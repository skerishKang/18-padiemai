
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
const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4';
const video = document.getElementById('scrollVideo');
const canvas = document.getElementById('frameCanvas');
const poster = document.getElementById('poster');
const progressLine = document.getElementById('progressLine');
const ctx = canvas.getContext('2d', { alpha:false });
let target = 0, smoothed = 0, frames = [], cacheReady = false, extracting = false;
const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
const sleep = ms => new Promise(r => setTimeout(r,ms));
const once = (el,event) => new Promise((resolve,reject) => {
const ok = () => { clean(); resolve(); };
const bad = () => { clean(); reject(new Error('media error')); };
const clean = () => { el.removeEventListener(event,ok); el.removeEventListener('error',bad); };
el.addEventListener(event,ok,{once:true}); el.addEventListener('error',bad,{once:true});
});
const resize = () => {
const dpr = Math.min(devicePixelRatio || 1, 2);
const w = Math.max(1, Math.round(innerWidth * dpr));
const h = Math.max(1, Math.round(innerHeight * dpr));
if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
};
const cover = (source,sw,sh) => {
const scale = Math.max(canvas.width/sw, canvas.height/sh);
const dw = sw*scale, dh = sh*scale;
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.drawImage(source,(canvas.width-dw)/2,(canvas.height-dh)/2,dw,dh);
};
const update = () => {
const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
target = clamp(scrollY/max,0,1);
progressLine.style.transform = `scaleX(${target})`;
};
async function seek(v,t) {
if (Math.abs(v.currentTime-t) < .002) return;
const done = once(v,'seeked'); v.currentTime=t; await done;
if (v.requestVideoFrameCallback) await new Promise(r => v.requestVideoFrameCallback(() => r()));
}
async function cacheFrames() {
if (extracting) return; extracting = true;
const extractor = document.createElement('video');
extractor.crossOrigin='anonymous'; extractor.muted=true; extractor.playsInline=true; extractor.preload='auto'; extractor.src=VIDEO_URL; extractor.load();
if (extractor.readyState < 1) await once(extractor,'loadedmetadata');
if (extractor.readyState < 2) await once(extractor,'loadeddata');
const duration = extractor.duration;
const count = clamp(Math.floor(duration*12),24,90);
const ow = Math.min(extractor.videoWidth,960);
const oh = Math.max(1,Math.round(extractor.videoHeight/extractor.videoWidth*ow));
const off = document.createElement('canvas'); const oc = off.getContext('2d',{alpha:false});
off.width=ow; off.height=oh; const built=[];
for (let i=0;i<count;i++) {
await seek(extractor,(i/(count-1))*Math.max(0,duration-.05));
oc.drawImage(extractor,0,0,ow,oh);
built.push(await createImageBitmap(off));
}
frames=built; cacheReady=true; canvas.style.opacity='1'; video.style.opacity='0';
}
video.crossOrigin='anonymous'; video.src=VIDEO_URL;
video.addEventListener('loadeddata',async() => {
poster.style.opacity='0'; video.style.opacity='1'; await sleep(300);
try { await cacheFrames(); }
catch(e) { console.warn('Frame cache unavailable; using seek fallback.',e); }
},{once:true});
function frame() {
smoothed += (target-smoothed)*.12;
resize();
if (cacheReady && frames.length) {
const f = frames[Math.min(frames.length-1,Math.round(smoothed*(frames.length-1)))];
cover(f,f.width,f.height);
} else if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
const t = smoothed*Math.max(0,video.duration-.05);
if (Math.abs(video.currentTime-t)>.04 && !video.seeking) { try { video.currentTime=t; } catch {} }
}
requestAnimationFrame(frame);
}
addEventListener('scroll',update,{passive:true}); addEventListener('resize',resize); update(); frame();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = [...document.querySelectorAll('.reveal')];
if (reduced) revealEls.forEach(el => el.classList.add('visible'));
else {
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
if (entry.isIntersecting) {
const el=entry.target; el.style.transitionDelay=(el.dataset.delay||0)+'ms'; el.classList.add('visible'); observer.unobserve(el);
}
}),{threshold:.15});
revealEls.forEach(el => observer.observe(el));
}
})();
