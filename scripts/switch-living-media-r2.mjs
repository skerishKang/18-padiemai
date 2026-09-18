import fs from 'node:fs';

const file = 'public/design/living-media-sphere/index.html';
let html = fs.readFileSync(file, 'utf8');

const replacements = new Map([
  ['assets/video-moment.mp4', 'https://media.padiem.net/design/living-media-sphere/video-moment-v1.mp4'],
  ['assets/video-season.mp4', 'https://media.padiem.net/design/living-media-sphere/video-season-v1.mp4'],
]);

for (const [from, to] of replacements) {
  // Idempotent: a re-run on an already switched working tree must not fail, but any
  // other unexpected state still stops the build.
  if (html.includes(to)) continue;
  if (!html.includes(from)) {
    throw new Error(`Living Media Sphere R2 switch failed: missing ${from}`);
  }
  html = html.split(from).join(to);
}

for (const from of replacements.keys()) {
  if (html.includes(from)) {
    throw new Error(`Living Media Sphere R2 switch failed: stale reference ${from}`);
  }
}

fs.writeFileSync(file, html);
console.log('Living Media Sphere R2 runtime switch: PASS');
