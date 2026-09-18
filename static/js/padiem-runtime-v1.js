/**
 * Shared browser runtime utilities for the PADIEM public site.
 *
 * `window.PADIEM_RUNTIME.storage` — safe preference storage
 *   Browser storage is unavailable in private mode, embedded webviews and when
 *   the visitor blocks site data, and `localStorage` access *throws* in those
 *   environments. Every runtime reads and writes preferences through this
 *   adapter instead of touching `localStorage` directly, so language and font
 *   selection keep working for the session instead of breaking the page:
 *
 *     PADIEM_RUNTIME.storage.available  // false when persistent storage is blocked
 *     PADIEM_RUNTIME.storage.read(key)  // stored value, session value, or null
 *     PADIEM_RUNTIME.storage.write(key, value)
 *
 *   `window.PADIEM_STORAGE` is kept as an alias of the same object.
 *
 * `window.PADIEM_RUNTIME.frameLoop(element, step, options)` — gated rAF loop
 *   Animation loops are only allowed to run while they can be seen: the loop
 *   pauses when the tab is hidden, when `element` leaves the viewport and when
 *   the visitor prefers reduced motion. Callers pass the per-frame work; the
 *   utility owns scheduling, so a hidden scene performs no per-frame DOM work.
 *
 *     options.onResume()  // called when a paused loop restarts (reset smoothing)
 *     returns { stop(), isRunning() }
 */
(() => {
  const memory = new Map();

  const probe = () => {
    try {
      const key = 'padiem-storage-probe';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return window.localStorage;
    } catch {
      return null;
    }
  };

  const persistent = probe();

  const read = key => {
    if (persistent) {
      try {
        const value = persistent.getItem(key);
        if (value !== null) return value;
      } catch {
        /* fall through to the in-memory value */
      }
    }
    return memory.has(key) ? memory.get(key) : null;
  };

  const write = (key, value) => {
    memory.set(key, String(value));
    if (!persistent) return;
    try {
      persistent.setItem(key, String(value));
    } catch {
      /* in-memory value already holds the preference for this session */
    }
  };

  const storage = Object.freeze({
    version: '1.0.0',
    available: Boolean(persistent),
    read,
    write,
  });

  const reducedMotionQuery = () => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)');
    } catch {
      return null;
    }
  };

  /**
   * Schedule `step` on animation frames only while the loop is both allowed
   * (motion preference) and visible (tab + element intersection).
   */
  const frameLoop = (element, step, options = {}) => {
    const onResume = typeof options.onResume === 'function' ? options.onResume : () => {};
    const query = reducedMotionQuery();
    let allowed = !(query && query.matches);
    let intersecting = !element;
    let running = false;
    let handle = 0;

    const tick = () => {
      if (!running) return;
      handle = window.requestAnimationFrame(tick);
      step();
    };

    const shouldRun = () => allowed && intersecting && document.visibilityState !== 'hidden';

    const sync = () => {
      const next = shouldRun();
      if (next === running) return;
      running = next;
      if (running) {
        onResume();
        handle = window.requestAnimationFrame(tick);
      } else {
        window.cancelAnimationFrame(handle);
      }
    };

    document.addEventListener('visibilitychange', sync);
    if (query && typeof query.addEventListener === 'function') {
      query.addEventListener('change', () => {
        allowed = !query.matches;
        sync();
      });
    }

    let observer = null;
    if (element && typeof window.IntersectionObserver === 'function') {
      observer = new window.IntersectionObserver(entries => {
        const entry = entries[entries.length - 1];
        intersecting = Boolean(entry && entry.isIntersecting);
        sync();
      }, { threshold: 0 });
      observer.observe(element);
    } else {
      intersecting = true;
    }

    sync();

    return Object.freeze({
      isRunning: () => running,
      stop() {
        running = false;
        window.cancelAnimationFrame(handle);
        document.removeEventListener('visibilitychange', sync);
        if (observer) observer.disconnect();
      },
    });
  };

  window.PADIEM_RUNTIME = Object.freeze({
    version: '1.0.0',
    storage,
    frameLoop,
  });
  window.PADIEM_STORAGE = storage;
})();
