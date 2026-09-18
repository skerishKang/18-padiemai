import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const publicDir = join(root, "public");
const legacyCloudfrontMarker = ["d8j0ntlcm91z4.cloudfront.net", "user_"].join("/");
const requiredInputs = [
  "static/js/padiem-album-exhibit-v1.js",
  "static/js/padiem-exhibit-config-v1.js",
  "static/js/padiem-exhibit-registry-v1.js",
  "static/css/padiem-album-exhibit-v1.css",
  "rotating-memory-index-source/index.html",
  "rotating-memory-index-source/assets/index-posters",
];

const requiredOutputs = [
  "public/index.html",
  "public/products/index.html",
  "public/design/index.html",
  "public/design/rotating-memory-index/index.html",
  "public/design/living-media-sphere/index.html",
  "public/design/living-media-sphere/assets",
  "public/js/padiem-album-exhibit-v1.js",
  "public/js/padiem-exhibit-registry-v1.js",
  "public/js/padiem-cinematic-v2-1.js",
  "public/js/padiem-scroll-scrub-v1.js",
  "public/css/padiem-album-exhibit-v1.css",
];

const missing = [...requiredInputs, ...requiredOutputs].filter(path => !existsSync(join(root, path)));
if (missing.length) {
  throw new Error(`Cinematic build is incomplete. Missing:\n${missing.join("\n")}`);
}

const sourceMp4 = [];
const scan = directory => {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) scan(path);
    else if (/\.mp4$/i.test(entry.name)) sourceMp4.push(path);
  }
};
scan(join(root, "rotating-memory-index-source"));
if (sourceMp4.length) {
  console.warn(`Rotating Memory Index source contains ${sourceMp4.length} local MP4 files; keep them ignored and publish from R2.`);
}
if (existsSync(join(root, ".git"))) {
  const trackedMp4 = execFileSync("git", ["ls-files", "*.mp4"], { cwd: root, encoding: "utf8" }).trim();
  if (trackedMp4) throw new Error(`MP4 binaries must not be tracked in Git:\n${trackedMp4}`);
}

const home = readFileSync(join(publicDir, "index.html"), "utf8");
const design = readFileSync(join(publicDir, "design/index.html"), "utf8");
const products = readFileSync(join(publicDir, "products/index.html"), "utf8");
const rotating = readFileSync(join(publicDir, "design/rotating-memory-index/index.html"), "utf8");
const sphere = readFileSync(join(publicDir, "design/living-media-sphere/index.html"), "utf8");
const registry = readFileSync(join(root, "static/js/padiem-exhibit-registry-v1.js"), "utf8");

if (registry.includes("lovetree.limone.dev")) {
  throw new Error("Unapproved personal LoveTree CTA domain remains in the exhibit registry.");
}
if (!registry.includes("'/design/living-media-sphere/'")) {
  throw new Error("Approved Living Media Sphere route CTA is missing from the exhibit registry.");
}

for (const marker of ["F:/", "G:\\", "Drive file", "folder ID"]) {
  if (rotating.includes(marker)) throw new Error(`Public Rotating Memory Index HTML exposes private source metadata: ${marker}`);
}
for (const [label, html] of [["home", home], ["rotating", rotating], ["sphere", sphere]]) {
  if (html.includes(legacyCloudfrontMarker)) {
    throw new Error(`${label} output still exposes the user-scoped CloudFront media origin.`);
  }
}

for (const [label, html] of [["design", design], ["products", products]]) {
  for (const marker of ["padiem-album-exhibit-v1.js", "padiem-exhibit-config-v1.js", "padiem-exhibit-registry-v1.js"]) {
    if (!html.includes(marker)) throw new Error(`${label} output is missing ${marker}`);
  }
}

for (const marker of ["padiem-design-archive-attribution", "BY PADIEM", "PADIEM DESIGN ARCHIVE · 03"]) {
  if (!rotating.includes(marker)) throw new Error(`Rotating Memory Index output is missing ${marker}`);
}
for (const marker of [
  "id=\"padiem-design-archive-attribution\"",
  "BY PADIEM",
  "DESIGN ARCHIVE / STUDY 04",
  "https://media.padiem.net/design/living-media-sphere/video-moment-v1.mp4",
  "https://media.padiem.net/design/living-media-sphere/video-season-v1.mp4",
]) {
  if (!sphere.includes(marker)) throw new Error(`Living Media Sphere output is missing ${marker}`);
}
for (const stale of ["assets/video-moment.mp4", "assets/video-season.mp4"]) {
  if (sphere.includes(stale)) throw new Error(`Living Media Sphere output still contains local media path ${stale}`);
}

for (const origin of [
  "https://media.padiem.net/design/rotating-memory-index/",
  "https://media.padiem.net/shared/lovetree-v3/",
]) {
  if (!rotating.includes(origin)) throw new Error(`Rotating Memory Index output does not resolve to ${origin}`);
}
for (const leaked of ["12_러브트리", "assets/featured-videos/", "videos-v3/"]) {
  if (rotating.includes(leaked)) throw new Error(`Rotating Memory Index output leaks a non-public media path: ${leaked}`);
}
if (!rotating.includes("https://media.padiem.net/design/rotating-memory-index/memory-")) {
  throw new Error("Rotating Memory Index featured films do not resolve to versioned public keys.");
}
if (!rotating.includes("memory-024-v1.mp4") || !rotating.includes("v3-'+p+'-v1.mp4")) {
  throw new Error("Rotating Memory Index output does not use versioned media keys.");
}

const posterDir = join(root, "rotating-memory-index-source/assets/index-posters");
const posters = readdirSync(posterDir).filter(name => /^poster-\d{3}\.jpg$/i.test(name));
if (posters.length !== 89) throw new Error(`Expected 89 Rotating Memory Index posters, found ${posters.length}.`);

const publicMp4 = [];
const walk = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.mp4$/i.test(entry.name)) publicMp4.push(path);
  }
};
walk(publicDir);
if (publicMp4.length) throw new Error(`Build output must not contain MP4 binaries: ${publicMp4.join(", ")}`);

const debugArtifacts = ["public/js/debug.js", "public/js/menu-debug.js"].filter(path => existsSync(join(root, path)));
if (debugArtifacts.length) {
  throw new Error(`Debug scripts must not ship in the production publish surface: ${debugArtifacts.join(", ")}`);
}

if (!registry.includes("https://media.padiem.net/design/rotating-memory-index-v1.mp4")) {
  throw new Error("Approved Rotating Memory Index film is missing from the exhibit registry.");
}
const cinematicMediaFiles = [
  join(root, "static/js/padiem-cinematic-v2-1.js"),
  join(root, "static/js/padiem-scroll-scrub-v1.js"),
  join(publicDir, "js/padiem-cinematic-v2-1.js"),
  join(publicDir, "js/padiem-scroll-scrub-v1.js"),
];
for (const mediaFile of cinematicMediaFiles) {
  const mediaSource = readFileSync(mediaFile, "utf8");
  if (mediaSource.includes(legacyCloudfrontMarker)) {
    throw new Error(`User-scoped CloudFront URL remains in ${mediaFile}.`);
  }
  if (!mediaSource.includes("https://media.padiem.net/home/cinematic-scroll-v1.mp4")) {
    throw new Error(`Approved first-party cinematic media URL is missing from ${mediaFile}.`);
  }
}

console.log(`Cinematic build verification passed: ${posters.length} posters, ${publicMp4.length} public MP4 binaries.`);
