(() => {
  const DEFAULT_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4';
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
    @media (prefers-reduced-motion: reduce){
      .world-scroll-video-layer video{display:none;}
    }
  `;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.className = 'world-scroll-video-layer';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <div class="world-scroll-video-poster"></div>
    <video muted playsinline preload="metadata" crossorigin="anonymous"></video>
    <div class="world-scroll-video-tone"></div>
    <div class="world-scroll-video-vignette"></div>
  `;
  document.body.prepend(layer);

  const video = layer.querySelector('video');
  const poster = layer.querySelector('.world-scroll-video-poster');
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

  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.src = videoUrl;

  video.addEventListener('loadedmetadata', () => {
    try { video.currentTime = 0.01; } catch {}
  }, { once: true });

  video.addEventListener('loadeddata', () => {
    ready = true;
    video.style.opacity = '.72';
    poster.style.opacity = '.18';
  }, { once: true });

  video.addEventListener('error', () => {
    ready = false;
    video.style.opacity = '0';
    poster.style.opacity = '1';
  }, { once: true });

  video.load();

  if (reduced) return;

  const frame = () => {
    smoothed += (target - smoothed) * 0.14;
    if (ready && video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0) {
      const desired = smoothed * Math.max(0, video.duration - 0.05);
      if (Math.abs(video.currentTime - desired) > 0.075 && !video.seeking) {
        try { video.currentTime = desired; } catch {}
      }
    }
    requestAnimationFrame(frame);
  };

  frame();
})();
