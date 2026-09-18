(() => {
  const config = window.PADIEM_EXHIBIT_CONFIG;
  const registry = window.PADIEM_EXHIBIT_REGISTRY;
  if (!config || !registry) return;

  const pageKey = location.pathname.startsWith('/design')
    ? 'design'
    : location.pathname.startsWith('/products')
      ? 'products'
      : '';
  if (!pageKey || !registry[pageKey]) return;

  const params = new URLSearchParams(location.search);
  const requested = params.get(config.queryParam);
  const mode = config.allowedModes.includes(requested) ? requested : config.modes[pageKey];
  window.PADIEM_EXHIBIT_ACTIVE_MODE = mode;
  if (mode !== 'album') return;

  const items = registry[pageKey];
  const hero = document.querySelector('.world-hero');
  if (!hero || !items.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIntersectionObserver = 'IntersectionObserver' in window;
  const esc = value => String(value ?? '').replace(/[&<>'\"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;'
  })[char]);
  const currentLanguage = () => document.body.dataset.lang === 'en' ? 'en' : 'ko';
  const localizedTitle = item => currentLanguage() === 'en' ? item.title : (item.titleKo || item.title);

  document.body.classList.add('px-exhibit-album', `px-exhibit-${pageKey}`);

  const ledger = hero.querySelector('.world-hero-ledger dl');
  if (ledger) {
    ledger.innerHTML = items.map(item => {
      const ko = `${item.titleKo || item.title} · ${item.kicker.split(' / ')[0]}`;
      const en = `${item.title} · ${item.kicker.split(' / ')[0]}`;
      const initial = currentLanguage() === 'en' ? en : ko;
      return `<div><dt>${esc(item.no)}</dt><dd data-copy-ko="${esc(ko)}" data-copy-en="${esc(en)}">${esc(initial)}</dd></div>`;
    }).join('');
  }

  const section = document.createElement('section');
  section.className = 'px-album-world';
  section.tabIndex = -1;
  section.setAttribute('aria-label', pageKey === 'design' ? 'PADIEM Design Album Collection' : 'PADIEM Product Film Collection');
  section.innerHTML = `
    <div class="px-album-noise" aria-hidden="true"></div>
    <div class="px-album-header">
      <div>
        <span class="px-album-eyebrow">${pageKey === 'design' ? 'PADIEM / DESIGN PRESSING 001' : 'PADIEM / PRODUCT FILM ARCHIVE'}</span>
        <h2>${pageKey === 'design' ? 'Interaction, pressed into motion.' : 'Products, selected like records.'}</h2>
      </div>
      <div class="px-album-counter" aria-live="polite"><strong>01</strong><span>/ ${String(items.length).padStart(2, '0')}</span></div>
    </div>

    <div class="px-album-stage">
      <div class="px-album-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="px-album-disc" aria-hidden="true"><span></span></div>

      <div class="px-album-media" data-state="idle">
        <video class="px-album-video" muted loop playsinline preload="metadata" aria-label="Selected exhibit film"></video>
        <div class="px-album-fallback" aria-hidden="true">
          <span class="px-album-glyph"></span>
          <small>PADIEM ORIGINAL INTERACTION</small>
        </div>
        <div class="px-album-media-top">
          <span class="px-album-signal"><i></i><b>SELECTED FILM</b></span>
          <span class="px-album-duration"></span>
        </div>
        <div class="px-album-media-bottom">
          <button class="px-album-play" type="button" aria-label="영상 재생 또는 정지">PAUSE</button>
          <div class="px-album-progress" aria-hidden="true"><i></i></div>
          <span class="px-album-media-state">READY</span>
        </div>
      </div>

      <article class="px-album-copy">
        <div class="px-album-copy-index"><span></span><em></em></div>
        <p class="px-album-kicker"></p>
        <h3 class="px-album-title"></h3>
        <p class="px-album-summary"></p>
        <div class="px-album-tags"></div>
        <div class="px-album-actions">
          <a class="px-album-open" href="#" target="_blank" rel="noopener" hidden>OPEN PRODUCT ↗</a>
          <span class="px-album-status"></span>
        </div>
      </article>
    </div>

    <div class="px-album-shelf-wrap">
      <button class="px-album-nav px-prev" type="button" aria-label="이전 작품">←</button>
      <div class="px-album-shelf" role="listbox" aria-label="Collection selector"></div>
      <button class="px-album-nav px-next" type="button" aria-label="다음 작품">→</button>
    </div>

    <div class="px-album-footerline">
      <span>${pageKey === 'design' ? '108 STUDIES → 4 SELECTED WORKS' : 'PADIEM PRODUCT COLLECTION'}</span>
      <span>CLICK · DRAG · ARROW KEYS</span>
    </div>
  `;
  hero.insertAdjacentElement('afterend', section);

  const shelf = section.querySelector('.px-album-shelf');
  shelf.innerHTML = items.map((item, index) => {
    const initialTitle = localizedTitle(item);
    return `
    <button class="px-album-sleeve" type="button" role="option" aria-selected="${index === 0}" data-index="${index}" style="--item-accent:${esc(item.accent)}">
      <span class="px-sleeve-edge"></span>
      <span class="px-sleeve-face">
        <span class="px-sleeve-meta"><b>${esc(item.no)}</b><em>${esc(item.status || 'DESIGN STUDY')}</em></span>
        <span class="px-sleeve-glyph">${esc(item.glyph)}</span>
        <span class="px-sleeve-title" data-copy-ko="${esc(item.titleKo || item.title)}" data-copy-en="${esc(item.title)}">${esc(initialTitle)}</span>
        <span class="px-sleeve-line"></span>
      </span>
    </button>`;
  }).join('');

  const video = section.querySelector('.px-album-video');
  const media = section.querySelector('.px-album-media');
  const glyph = section.querySelector('.px-album-glyph');
  const mediaDuration = section.querySelector('.px-album-duration');
  const mediaState = section.querySelector('.px-album-media-state');
  const play = section.querySelector('.px-album-play');
  const progress = section.querySelector('.px-album-progress i');
  const counter = section.querySelector('.px-album-counter strong');
  const copyIndex = section.querySelector('.px-album-copy-index span');
  const copyRule = section.querySelector('.px-album-copy-index em');
  const kicker = section.querySelector('.px-album-kicker');
  const title = section.querySelector('.px-album-title');
  const summary = section.querySelector('.px-album-summary');
  const tags = section.querySelector('.px-album-tags');
  const openLink = section.querySelector('.px-album-open');
  const status = section.querySelector('.px-album-status');
  const sleeves = [...section.querySelectorAll('.px-album-sleeve')];
  const prev = section.querySelector('.px-prev');
  const next = section.querySelector('.px-next');
  const disc = section.querySelector('.px-album-disc');

  let selected = 0;
  let inView = false;
  let loadedSrc = '';
  let pointerStart = null;
  const failedMedia = new Set();

  const wrappedDelta = (index, active) => {
    let delta = index - active;
    const half = items.length / 2;
    if (delta > half) delta -= items.length;
    if (delta < -half) delta += items.length;
    return delta;
  };

  const layoutShelf = () => {
    sleeves.forEach((sleeve, index) => {
      const delta = wrappedDelta(index, selected);
      sleeve.style.setProperty('--slot', String(delta));
      sleeve.style.setProperty('--distance', String(Math.abs(delta)));
      sleeve.classList.toggle('is-selected', index === selected);
      sleeve.setAttribute('aria-selected', String(index === selected));
      sleeve.tabIndex = index === selected ? 0 : -1;
    });
  };

  const detachVideo = (state = 'fallback', message = 'STATIC FALLBACK') => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    loadedSrc = '';
    media.dataset.state = state;
    mediaState.textContent = message;
    progress.style.transform = 'scaleX(0)';
  };

  const ensureVideo = () => {
    const item = items[selected];
    if (!item.media || reduced || !hasIntersectionObserver) {
      detachVideo();
      return;
    }
    if (failedMedia.has(item.media)) {
      detachVideo('error', 'MEDIA OFFLINE · FALLBACK');
      play.hidden = true;
      return;
    }
    if (!inView) return;
    if (loadedSrc !== item.media) {
      video.pause();
      media.dataset.state = 'loading';
      mediaState.textContent = 'LOADING';
      video.src = item.media;
      loadedSrc = item.media;
      video.load();
    }
    video.play().catch(() => {
      media.dataset.state = 'paused';
      mediaState.textContent = 'TAP TO PLAY';
    });
  };

  const renderCopy = item => {
    const lang = currentLanguage();
    copyIndex.textContent = item.no;
    copyRule.style.setProperty('--accent-rgb', item.accent);
    kicker.textContent = item.kicker;
    title.textContent = lang === 'en' ? item.title : (item.titleKo || item.title);
    title.dataset.copyKo = item.titleKo || item.title;
    title.dataset.copyEn = item.title;
    summary.textContent = lang === 'en' ? item.copyEn : item.copyKo;
    summary.dataset.copyKo = item.copyKo;
    summary.dataset.copyEn = item.copyEn;
    tags.innerHTML = item.tags.map(tag => `<span>${esc(tag)}</span>`).join('');
    glyph.textContent = item.glyph;
    mediaDuration.textContent = item.duration || (item.media ? 'FILM' : 'PREVIEW');
    status.textContent = item.status || 'PADIEM DESIGN ORIGINAL';
    section.style.setProperty('--album-accent-rgb', item.accent);
    disc.style.setProperty('--album-accent-rgb', item.accent);
    play.hidden = !item.media || reduced || !hasIntersectionObserver || failedMedia.has(item.media);

    if (item.href) {
      openLink.hidden = false;
      openLink.href = item.href;
    } else {
      openLink.hidden = true;
      openLink.removeAttribute('href');
    }
  };

  const select = (index, { focus = false } = {}) => {
    selected = (index + items.length) % items.length;
    const item = items[selected];
    counter.textContent = item.no;
    renderCopy(item);
    layoutShelf();
    if (loadedSrc && loadedSrc !== item.media) detachVideo();
    ensureVideo();
    if (focus) sleeves[selected].focus({ preventScroll: true });
  };

  sleeves.forEach((sleeve, index) => sleeve.addEventListener('click', () => select(index)));
  prev.addEventListener('click', () => select(selected - 1, { focus: true }));
  next.addEventListener('click', () => select(selected + 1, { focus: true }));

  shelf.addEventListener('pointerdown', event => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  shelf.addEventListener('pointerup', event => {
    if (!pointerStart) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy)) return;
    select(selected + (dx < 0 ? 1 : -1), { focus: true });
  });
  shelf.addEventListener('pointercancel', () => { pointerStart = null; });

  section.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      select(selected - 1, { focus: true });
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      select(selected + 1, { focus: true });
    }
  });

  play.addEventListener('click', () => {
    const item = items[selected];
    if (!item.media || failedMedia.has(item.media)) return;
    if (!loadedSrc) ensureVideo();
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  });

  video.addEventListener('loadeddata', () => {
    media.dataset.state = 'ready';
    mediaState.textContent = 'PLAYING';
  });
  video.addEventListener('play', () => {
    media.dataset.state = 'ready';
    mediaState.textContent = 'PLAYING';
    play.textContent = 'PAUSE';
  });
  video.addEventListener('pause', () => {
    if (media.dataset.state !== 'fallback' && media.dataset.state !== 'error') media.dataset.state = 'paused';
    if (media.dataset.state !== 'fallback' && media.dataset.state !== 'error') mediaState.textContent = 'PAUSED';
    play.textContent = 'PLAY';
  });
  video.addEventListener('timeupdate', () => {
    const ratio = video.duration ? Math.min(1, video.currentTime / video.duration) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  });
  video.addEventListener('error', () => {
    const failedSrc = loadedSrc || items[selected].media;
    if (failedSrc) failedMedia.add(failedSrc);
    video.pause();
    video.removeAttribute('src');
    video.load();
    loadedSrc = '';
    media.dataset.state = 'error';
    mediaState.textContent = 'MEDIA OFFLINE · FALLBACK';
    progress.style.transform = 'scaleX(0)';
    play.hidden = true;
  });

  if (hasIntersectionObserver) {
    new IntersectionObserver(entries => {
      entries.forEach(entry => {
        inView = entry.isIntersecting;
        if (inView) ensureVideo();
        else video.pause();
      });
    }, { threshold: .22, rootMargin: '120px 0px 120px' }).observe(section);
  } else {
    detachVideo('fallback', 'STATIC FALLBACK');
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (inView) ensureVideo();
  });

  select(0);
})();
