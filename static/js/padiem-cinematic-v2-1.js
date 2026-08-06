(() => {
const fontButtons = [...document.querySelectorAll('[data-font-choice]')];
const savedFont = localStorage.getItem('padiem-font-choice') || 'suite';
const applyFont = name => {
document.body.dataset.font = name;
fontButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.fontChoice === name));
localStorage.setItem('padiem-font-choice', name);
};
fontButtons.forEach(btn => btn.addEventListener('click', () => applyFont(btn.dataset.fontChoice)));
applyFont(savedFont);

const responsiveStyle = document.createElement('style');
responsiveStyle.dataset.padiemResponsive = 'technology-path';
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
@media (max-width:1180px) and (min-width:921px){
  .bottom-row{gap:24px;}
  .signal-card{flex-basis:360px;width:360px;min-width:360px;padding:18px;}
  .path{grid-template-columns:60px minmax(0,1fr);gap:10px 12px;}
  .path-name{font-size:12.5px;}
}
@media (max-width:920px){
  .bottom-row{flex-direction:column;align-items:flex-start;margin-top:80px;}
  .signal-card{flex:none;width:min(430px,100%);min-width:0;margin-top:18px;padding:18px;}
}
@media (max-width:480px){
  .signal-card{padding:16px;border-radius:14px;}
  .signal-top{gap:10px;margin-bottom:15px;}
  .signal-label,.signal-live{font-size:9px;}
  .path{grid-template-columns:54px minmax(0,1fr);gap:9px 10px;}
  .path-year{font-size:9.5px;}
  .path-name{font-size:12px;line-height:1.45;word-break:normal;}
  .signal-foot{align-items:flex-start;gap:8px;}
  .signal-foot span{font-size:9px;}
  .signal-foot b{font-size:9.5px;text-align:right;}
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

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4';
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

const revealVideo = () => {
if (mediaReady) return;
mediaReady = true;
canvas.style.opacity = '0';
video.style.opacity = '1';
poster.style.opacity = '0';
};

video.crossOrigin = 'anonymous';
video.muted = true;
video.playsInline = true;
video.preload = 'metadata';
video.src = VIDEO_URL;
video.addEventListener('loadedmetadata', () => {
try { video.currentTime = 0.01; } catch {}
}, { once: true });
video.addEventListener('loadeddata', () => {
if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(revealVideo);
else revealVideo();
}, { once: true });
video.addEventListener('error', () => {
console.warn('Background video unavailable; keeping poster fallback.');
}, { once: true });
video.load();

function frame() {
smoothed += (target - smoothed) * 0.14;
if (mediaReady && video.readyState >= 2 && Number.isFinite(video.duration) && video.duration > 0) {
const desired = smoothed * Math.max(0, video.duration - 0.05);
if (Math.abs(video.currentTime - desired) > 0.075 && !video.seeking) {
try { video.currentTime = desired; } catch {}
}
}
requestAnimationFrame(frame);
}

addEventListener('scroll', update, { passive: true });
addEventListener('resize', update);
update();
frame();

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
