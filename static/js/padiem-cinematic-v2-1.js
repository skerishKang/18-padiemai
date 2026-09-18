(() => {
const runtime = window.PADIEM_RUNTIME || {};
const storage = runtime.storage || { available: false, read: () => null, write: () => {} };
const fontButtons = [...document.querySelectorAll('[data-font-choice]')];
const savedFont = storage.read('padiem-font-choice') || 'suite';
const applyFont = name => {
document.body.dataset.font = name;
fontButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.fontChoice === name));
storage.write('padiem-font-choice', name);
};
fontButtons.forEach(btn => btn.addEventListener('click', () => applyFont(btn.dataset.fontChoice)));
applyFont(savedFont);

const responsiveStyle = document.createElement('style');
responsiveStyle.dataset.padiemResponsive = 'layout-v2';
responsiveStyle.textContent = `
.signal-card{
  flex:0 0 clamp(390px,30vw,430px);
  width:clamp(390px,30vw,430px);
  min-width:390px;
  padding:20px;
}
.signal-top{margin-bottom:17px;}
.signal-label,.signal-live{font-size:10.5px;}
.path{grid-template-columns:64px minmax(0,1fr);gap:11px 14px;}
.path-year{font-size:11px;line-height:1.4;}
.path-name{font-size:13.5px;line-height:1.5;word-break:keep-all;}
.signal-foot{gap:16px;}
.signal-foot span,.signal-foot b{white-space:nowrap;}

@media (min-width:761px){
  .overlay[data-panel="about"] .overlay-panel{
    width:min(1060px,78vw);
    grid-template-columns:minmax(280px,.82fr) minmax(470px,1.18fr);
    column-gap:52px;
    padding:clamp(44px,4.2vw,64px) clamp(46px,4.6vw,68px);
  }
  .overlay[data-panel="about"] .overlay-panel::before{left:37%;}
  .overlay[data-panel="about"] .overlay-lead{font-size:15.5px;}
  .overlay[data-panel="about"] .overlay-narrative p{font-size:13px;line-height:1.72;}
  .overlay[data-panel="about"] .company-section{padding:18px 0;}
  .overlay[data-panel="about"] .company-section li{font-size:12.5px;}

  .overlay[data-panel="team"] .overlay-panel{
    width:min(1160px,85vw);
    grid-template-columns:minmax(240px,.52fr) minmax(640px,1.48fr);
    column-gap:48px;
    padding:clamp(40px,4vw,58px) clamp(44px,4.5vw,64px);
  }
  .overlay[data-panel="team"] .overlay-panel::before{left:28.5%;}
  .overlay[data-panel="team"] .overlay-title{font-size:clamp(48px,4.2vw,64px);}
  .overlay[data-panel="team"] .overlay-lead{max-width:260px;font-size:15px;}
  .overlay[data-panel="team"] .leadership-grid{gap:20px;}
  .overlay[data-panel="team"] .leader-card{padding:15px;border-radius:24px;}
  .overlay[data-panel="team"] .leader-photo-wrap{aspect-ratio:4/3;border-radius:18px;}
  .overlay[data-panel="team"] .leader-photo{object-position:center 16%;}
  .overlay[data-panel="team"] .leader-meta{padding:15px 3px 4px;}
  .overlay[data-panel="team"] .leader-role{font-size:9.5px;}
  .overlay[data-panel="team"] .leader-name{font-size:27px;}
  .overlay[data-panel="team"] .leader-summary{min-height:42px;font-size:12.5px;line-height:1.55;}
  .overlay[data-panel="team"] .leader-facts{margin-top:12px;}
  .overlay[data-panel="team"] .leader-facts li{padding:8px 0 7px 12px;font-size:11.5px;line-height:1.42;}
  .overlay[data-panel="team"] .leader-school{font-size:11.5px;}
  .overlay[data-panel="team"] .leader-field{font-size:10.5px;}
}

@media (max-width:1180px) and (min-width:921px){
  .bottom-row{gap:24px;}
  .signal-card{flex-basis:380px;width:380px;min-width:380px;padding:18px;}
  .path{grid-template-columns:60px minmax(0,1fr);gap:10px 12px;}
  .path-name{font-size:12.8px;}
}

@media (max-width:980px) and (min-width:761px){
  .overlay[data-panel="about"] .overlay-panel,
  .overlay[data-panel="team"] .overlay-panel{
    width:min(900px,88vw);
    grid-template-columns:minmax(220px,.7fr) minmax(440px,1.3fr);
    column-gap:36px;
    padding:42px 40px;
  }
  .overlay[data-panel="about"] .overlay-panel::before,
  .overlay[data-panel="team"] .overlay-panel::before{left:34%;}
  .overlay[data-panel="team"] .leadership-grid{gap:14px;}
  .overlay[data-panel="team"] .leader-card{padding:12px;}
  .overlay[data-panel="team"] .leader-name{font-size:24px;}
  .overlay[data-panel="team"] .leader-summary{font-size:11.5px;}
  .overlay[data-panel="team"] .leader-facts li{font-size:10.5px;}
}

@media (max-width:760px){
  #top{
    position:relative;
    display:block;
    min-height:auto;
    padding-top:92px;
    padding-bottom:0;
  }
  #top .top-row{
    position:absolute;
    z-index:2;
    top:112px;
    left:var(--pad);
    right:var(--pad);
    display:flex;
    flex-direction:column;
    gap:34px;
  }
  #top .intro{max-width:340px;}
  #top .bottom-row{
    display:block;
    margin-top:0;
  }
  #top .bottom-row>div{
    min-height:calc(100svh - 92px);
    display:flex;
    flex-direction:column;
    justify-content:flex-end;
    padding:260px 0 64px;
  }
  #top .headline{font-size:clamp(48px,14vw,68px);}
  #top .signal-card{
    width:100%;
    min-width:0;
    margin:38px 0 68px;
    padding:18px;
  }
  #top .scroll-cue{display:none;}

  .overlay{align-items:flex-end;justify-content:center;padding:0;}
  .overlay-panel{
    width:100%;
    min-height:88dvh;
    height:auto;
    max-height:92dvh;
    padding:50px 20px 26px;
    border-radius:28px 28px 0 0;
  }
  .overlay-close{top:15px;right:15px;width:40px;height:40px;}
  .overlay-kicker{margin-bottom:12px;}
  .overlay-title{max-width:calc(100% - 48px);font-size:clamp(36px,10.5vw,46px);line-height:1.02;}
  .overlay-title::after{margin-top:16px;}
  .overlay-lead{margin-top:15px;font-size:13.5px;line-height:1.65;}
  .overlay-body{margin-top:23px;}

  .overlay[data-panel="about"] .overlay-narrative{margin-bottom:16px;padding-bottom:16px;gap:8px;}
  .overlay[data-panel="about"] .overlay-narrative p{font-size:12.5px;line-height:1.62;}
  .overlay[data-panel="about"] .company-section{padding:14px 0 12px;}
  .overlay[data-panel="about"] .company-section-label{margin-bottom:6px;}
  .overlay[data-panel="about"] .company-section h3{margin-bottom:7px;font-size:18px;}
  .overlay[data-panel="about"] .company-section li{padding:5px 0 5px 10px;font-size:11px;line-height:1.42;}

  .overlay[data-panel="team"] .overlay-lead{margin-top:13px;}
  .overlay[data-panel="team"] .overlay-body{margin-top:20px;}
  .overlay[data-panel="team"] .leadership-grid{gap:10px;}
  .overlay[data-panel="team"] .leader-card{
    grid-template-columns:88px minmax(0,1fr);
    gap:11px;
    padding:10px;
    border-radius:18px;
  }
  .overlay[data-panel="team"] .leader-photo-wrap{aspect-ratio:3/4;border-radius:13px;}
  .overlay[data-panel="team"] .leader-meta{padding:2px 0;}
  .overlay[data-panel="team"] .leader-role{font-size:8.5px;}
  .overlay[data-panel="team"] .leader-name{margin-top:4px;font-size:21px;}
  .overlay[data-panel="team"] .leader-summary{margin-top:5px;min-height:0;font-size:10.7px;line-height:1.45;}
  .overlay[data-panel="team"] .leader-facts{margin-top:7px;}
  .overlay[data-panel="team"] .leader-facts li{padding:5px 0 4px 10px;font-size:9.5px;line-height:1.35;}
  .overlay[data-panel="team"] .leader-facts li::before{top:9px;}
  .overlay[data-panel="team"] .leader-school{font-size:9.5px;}
  .overlay[data-panel="team"] .leader-field{margin-top:2px;font-size:9px;}

  .overlay[data-panel="inquiry"] .overlay-list li{min-height:56px;padding:12px 2px 11px 0;}
  .overlay[data-panel="inquiry"] .overlay-extra{margin-top:18px;}
}

@media (max-width:480px){
  #top .top-row{top:110px;gap:28px;}
  #top .bottom-row>div{padding-top:250px;padding-bottom:56px;}
  #top .signal-card{padding:16px;border-radius:14px;}
  #top .signal-top{gap:10px;margin-bottom:15px;}
  #top .signal-label,#top .signal-live{font-size:9px;}
  #top .path{grid-template-columns:52px minmax(0,1fr);gap:9px 10px;}
  #top .path-year{font-size:9.5px;}
  #top .path-name{font-size:11.5px;line-height:1.42;word-break:normal;}
  #top .signal-foot{align-items:flex-start;gap:8px;}
  #top .signal-foot span{font-size:8.5px;}
  #top .signal-foot b{font-size:9px;text-align:right;}
  .overlay-panel{padding-left:18px;padding-right:18px;}
}
`;
document.head.appendChild(responsiveStyle);

const cleanTechnologyOriginCopy = () => {
document.querySelectorAll('.path-name').forEach(el => {
const next = el.innerHTML.replace(/\s*·\s*개인 파디엠 창업/g, '');
if (next !== el.innerHTML) el.innerHTML = next;
});
};
cleanTechnologyOriginCopy();
const pathRoot = document.querySelector('.path');
if (pathRoot) {
const pathObserver = new MutationObserver(cleanTechnologyOriginCopy);
pathObserver.observe(pathRoot, { childList: true, subtree: true, characterData: true });
}

// The hero film URL and the failure copy come from the shared media config; a runtime must not
// define its own public media URL (#50).
const media = window.PADIEM_MEDIA || {};
const fallbackCopy = media.fallbackCopy || {
ko: '영상을 불러오지 못해 정지 화면으로 표시합니다.',
en: 'The film could not be loaded, so a still frame is shown.',
};
const VIDEO_URL = (media.home && media.home.scrollFilm) || '';
const video = document.getElementById('scrollVideo');
const canvas = document.getElementById('frameCanvas');
const poster = document.getElementById('poster');
const progressLine = document.getElementById('progressLine');
let target = 0;
let smoothed = 0;
let mediaReady = false;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const update = () => {
const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
target = clamp(scrollY / max, 0, 1);
progressLine.style.transform = `scaleX(${target})`;
};

const mediaLanguage = () => (document.body.dataset.lang === 'en' ? 'en' : 'ko');
const mediaStatusStyle = document.createElement('style');
mediaStatusStyle.dataset.padiemMedia = 'fallback-v1';
mediaStatusStyle.textContent = `
.hero-media-status{
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
html[data-media-state="error"] .hero-media-status{opacity:1;}
`;
document.head.appendChild(mediaStatusStyle);

const mediaStatus = document.createElement('p');
mediaStatus.className = 'hero-media-status';
mediaStatus.setAttribute('role', 'status');
mediaStatus.setAttribute('aria-live', 'polite');
document.body.appendChild(mediaStatus);

// A film that cannot play keeps the poster frame and says so, instead of failing silently (#50).
const showMediaFallback = () => {
mediaReady = false;
document.documentElement.dataset.mediaState = 'error';
canvas.style.opacity = '1';
video.style.opacity = '0';
poster.style.opacity = '1';
mediaStatus.textContent = fallbackCopy[mediaLanguage()] || fallbackCopy.ko;
};
document.addEventListener('padiem:language', () => {
if (document.documentElement.dataset.mediaState === 'error') mediaStatus.textContent = fallbackCopy[mediaLanguage()] || fallbackCopy.ko;
});

const revealVideo = () => {
if (mediaReady) return;
mediaReady = true;
document.documentElement.dataset.mediaState = 'ready';
canvas.style.opacity = '0';
video.style.opacity = '1';
poster.style.opacity = '0';
};

// No `crossOrigin`: the first-party media origin does not send CORS headers and nothing here
// reads pixels from the video, so requesting it anonymously only made playback fail (#50).
video.muted = true;
video.playsInline = true;
video.preload = 'metadata';
if (VIDEO_URL) video.src = VIDEO_URL;
else showMediaFallback();
video.addEventListener('loadedmetadata', () => {
try { video.currentTime = 0.01; } catch {}
}, { once: true });
video.addEventListener('loadeddata', () => {
if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(revealVideo);
else revealVideo();
}, { once: true });
video.addEventListener('error', showMediaFallback, { once: true });
video.load();

function scrubStep() {
smoothed += (target - smoothed) * 0.14;
if (mediaReady && video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0) {
const desired = smoothed * Math.max(0, video.duration - 0.05);
if (Math.abs(video.currentTime - desired) > 0.075 && !video.seeking) {
try { video.currentTime = desired; } catch {}
}
}
}

addEventListener('scroll', update, { passive: true });
addEventListener('resize', update);
update();

// The scroll scrub only runs while it is visible, the tab is active and the
// visitor has not asked for reduced motion; otherwise the frame is static.
const scrubElement = video.closest('section') || video.parentElement || video;
if (runtime.frameLoop) {
runtime.frameLoop(scrubElement, scrubStep, { onResume: () => { smoothed = target; } });
} else if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
const loop = () => { scrubStep(); requestAnimationFrame(loop); };
requestAnimationFrame(loop);
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = [...document.querySelectorAll('.reveal')];
if (reduced) revealEls.forEach(el => el.classList.add('visible'));
else {
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
if (entry.isIntersecting) {
const el = entry.target;
el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
el.classList.add('visible');
observer.unobserve(el);
}
}), { threshold: .15 });
revealEls.forEach(el => observer.observe(el));
}
})();
