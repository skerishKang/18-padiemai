(() => {
  const mounts = [...document.querySelectorAll('[data-padiem-design-video]')];
  if (!mounts.length || !document.title.includes('PADIEM Design')) return;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const records = new Map();

  const setState = (mount, state) => {
    mount.dataset.videoState = state;
  };

  // Reduced-motion and legacy browsers fail open to the first-party static
  // fallback without creating or requesting a video element.
  if (reducedMotion || !supportsIntersectionObserver) {
    mounts.forEach(mount => setState(mount, 'fallback'));
    return;
  }

  const ensureVideo = mount => {
    if (records.has(mount)) return records.get(mount);

    const src = mount.dataset.videoSrc?.trim();
    if (!src) {
      setState(mount, 'fallback');
      return null;
    }

    let parsed;
    try {
      parsed = new URL(src, location.href);
    } catch {
      setState(mount, 'fallback');
      return null;
    }
    if (parsed.protocol !== 'https:') {
      setState(mount, 'fallback');
      return null;
    }

    const video = document.createElement('video');
    video.className = 'padiem-design-video';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.controls = false;
    if ('disablePictureInPicture' in video) video.disablePictureInPicture = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');

    const record = {
      mount,
      video,
      src: parsed.href,
      sourceAttached: false,
      failed: false,
      inView: false,
    };

    video.addEventListener('loadeddata', () => {
      if (record.failed) return;
      setState(mount, 'ready');
      if (record.inView && !document.hidden) {
        video.play().catch(() => setState(mount, 'paused'));
      }
    });

    video.addEventListener('playing', () => {
      if (!record.failed) setState(mount, 'playing');
    });

    video.addEventListener('pause', () => {
      if (!record.failed && mount.dataset.videoState !== 'fallback') {
        setState(mount, 'paused');
      }
    });

    const failOpen = () => {
      if (record.failed) return;
      record.failed = true;
      video.pause();
      video.removeAttribute('src');
      video.remove();
      setState(mount, 'fallback');
    };

    video.addEventListener('error', failOpen, { once: true });

    mount.append(video);
    setState(mount, 'idle');
    records.set(mount, record);
    return record;
  };

  const attachSource = record => {
    if (!record || record.sourceAttached || record.failed) return;
    record.video.src = record.src;
    record.video.preload = 'metadata';
    record.sourceAttached = true;
    setState(record.mount, 'loading');
    record.video.load();
  };

  const play = record => {
    if (!record || record.failed || document.hidden) return;
    attachSource(record);
    if (record.video.readyState >= 2) {
      record.video.play().catch(() => setState(record.mount, 'paused'));
    }
  };

  const pause = record => {
    if (!record || record.failed) return;
    record.video.pause();
  };

  mounts.forEach(ensureVideo);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const record = records.get(entry.target);
      if (!record) return;
      record.inView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      if (record.inView) play(record);
      else pause(record);
    });
  }, {
    root: null,
    rootMargin: '180px 0px',
    threshold: [0, 0.2, 0.55],
  });

  records.forEach(record => observer.observe(record.mount));

  document.addEventListener('visibilitychange', () => {
    records.forEach(record => {
      if (document.hidden) pause(record);
      else if (record.inView) play(record);
    });
  });
})();
