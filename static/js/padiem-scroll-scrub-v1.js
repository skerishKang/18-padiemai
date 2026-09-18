(() => {
  const exhibitConfig = window.PADIEM_EXHIBIT_CONFIG;
  if (exhibitConfig) {
    const pageKey = location.pathname.startsWith('/design')
      ? 'design'
      : location.pathname.startsWith('/products')
        ? 'products'
        : '';
    if (pageKey) {
      const params = new URLSearchParams(location.search);
      const requested = params.get(exhibitConfig.queryParam);
      const exhibitMode = exhibitConfig.allowedModes.includes(requested)
        ? requested
        : exhibitConfig.modes[pageKey];
      if (exhibitMode === 'album') return;
    }
  }

  // URLs and failure copy are centralised: a runtime never defines its own media URL (#50).
  const media = window.PADIEM_MEDIA || {};
  const fallbackCopy = media.fallbackCopy || {
    ko: '영상을 불러오지 못해 정지 화면으로 표시합니다.',
    en: 'The film could not be loaded, so a still frame is shown.',
  };
  const DEFAULT_VIDEO = (media.home && media.home.scrollFilm) || '';
  const videoUrl = document.body.dataset.worldScrollVideo || DEFAULT_VIDEO;
  if (!videoUrl) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const style = document.createElement('style');
  style.dataset.padiemScrollScrub = 'v1';
  style.textContent = `
    .world-scroll-video-layer{
      position:fixed;
      inset:0;
      z-index:0;
      overflow:hidden;
      pointer-events:none;
      background:#06080d;
    }
    .world-scroll-video-layer video,
    .world-scroll-video-poster,
    .world-scroll-video-tone,
    .world-scroll-video-vignette{
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
    }
    .world-scroll-video-layer video{
      object-fit:cover;
      opacity:0;
      filter:saturate(.72) contrast(1.06) brightness(.72);
      transform:scale(1.018);
      transition:opacity .6s ease;
    }
    .world-scroll-video-poster{
      background:
        radial-gradient(circle at 62% 42%,rgba(183,213,255,.17),transparent 24%),
        radial-gradient(circle at 37% 61%,rgba(239,201,132,.10),transparent 26%),
        linear-gradient(140deg,#07101a 0%,#07090e 52%,#020305 100%);
      transition:opacity .6s ease;
    }
    .world-scroll-video-tone{
      background:
        linear-gradient(180deg,rgba(2,8,18,.46) 0%,rgba(3,6,12,.16) 42%,rgba(2,4,8,.62) 100%),
        radial-gradient(circle at 18% 50%,rgba(12,44,82,.22),transparent 38%),
        radial-gradient(circle at 82% 50%,rgba(103,60,12,.10),transparent 36%);
      mix-blend-mode:multiply;
    }
    .world-scroll-video-vignette{
      box-shadow:inset 0 0 220px 76px rgba(0,0,0,.56);
      background:linear-gradient(90deg,rgba(1,4,9,.24),transparent 28%,transparent 70%,rgba(1,4,9,.22));
    }
    body.world-body > .world-page{position:relative;z-index:10;}
    .world-scroll-video-status{
      position:fixed;
      left:50%;
      bottom:26px;
      transform:translateX(-50%);
      margin:0;
      padding:9px 16px;
      border:1px solid rgba(255,255,255,.22);
      border-radius:999px;
      background:rgba(4,8,14,.72);
      color:rgba(255,255,255,.82);
      font-size:11.5px;
      letter-spacing:.01em;
      text-align:center;
      opacity:0;
      pointer-events:none;
      transition:opacity .4s ease;
      z-index:11;
    }
    .world-scroll-video-layer[data-media-state="error"] .world-scroll-video-status{opacity:1;}
    .world-scroll-video-layer[data-media-state="error"] .world-scroll-video-poster{opacity:1;}
    @media (prefers-reduced-motion: reduce){
      .world-scroll-video-layer video{display:none;}
    }
  `;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.className = 'world-scroll-video-layer';
  layer.dataset.mediaState = 'loading';
  layer.innerHTML = `
    <div class="world-scroll-video-poster" aria-hidden="true"></div>
    <video muted playsinline preload="metadata" crossorigin="anonymous" aria-hidden="true"></video>
    <div class="world-scroll-video-tone" aria-hidden="true"></div>
    <div class="world-scroll-video-vignette" aria-hidden="true"></div>
    <p class="world-scroll-video-status" role="status" aria-live="polite"></p>
  `;
  document.body.prepend(layer);

  const video = layer.querySelector('video');
  const poster = layer.querySelector('.world-scroll-video-poster');
  const status = layer.querySelector('.world-scroll-video-status');
  const currentLanguage = () => (document.body.dataset.lang === 'en' ? 'en' : 'ko');
  const statusCopy = () => fallbackCopy[currentLanguage()] || fallbackCopy.ko;
  document.addEventListener('padiem:language', () => {
    if (layer.dataset.mediaState === 'error') status.textContent = statusCopy();
  });
  let target = 0;
  let smoothed = 0;
  let ready = false;

  const updateTarget = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    target = clamp(scrollY / max, 0, 1);
    document.documentElement.style.setProperty('--padiem-scroll-progress', target.toFixed(4));
  };

  addEventListener('scroll', updateTarget, { passive: true });
  addEventListener('resize', updateTarget);
  updateTarget();

  // No `crossOrigin`: the first-party media origin does not send CORS headers and nothing here
  // reads pixels from the video, so requesting it anonymously only made playback fail (#50).

  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.src = videoUrl;

  video.addEventListener('loadedmetadata', () => {
    try { video.currentTime = 0.01; } catch {}
  }, { once: true });

  video.addEventListener('loadeddata', () => {
    ready = true;
    layer.dataset.mediaState = 'ready';
    video.style.opacity = '.72';
    poster.style.opacity = '.18';
  }, { once: true });

  // A film that cannot play must stay usable and observable: the poster keeps the hero
  // readable and the status line says so out loud instead of failing silently (#50).
  video.addEventListener('error', () => {
    ready = false;
    layer.dataset.mediaState = 'error';
    video.style.opacity = '0';
    poster.style.opacity = '1';
    status.textContent = statusCopy();
  }, { once: true });

  video.load();

  if (reduced) return;

  const step = () => {
    smoothed += (target - smoothed) * 0.14;
    if (ready && video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0) {
      const desired = smoothed * Math.max(0, video.duration - 0.05);
      if (Math.abs(video.currentTime - desired) > 0.075 && !video.seeking) {
        try { video.currentTime = desired; } catch {}
      }
    }
  };

  // The scrub frame only advances while the tab is active; a backgrounded tab must not seek.
  const runtime = window.PADIEM_RUNTIME;
  if (runtime && runtime.frameLoop) {
    runtime.frameLoop(layer, step, { onResume: () => { smoothed = target; } });
  } else {
    const loop = () => { step(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
})();
