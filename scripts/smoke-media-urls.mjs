/**
 * Public media smoke check (issue #50).
 *
 * Fails when:
 *   - a runtime defines its own public media URL instead of reading the shared config;
 *   - a media URL leaves the approved origins (the first-party CDN, the site, the product entry);
 *   - the same canonical film is defined in more than one place;
 *   - exhibit media appears outside the exhibit registry (the registry stays the authority);
 *   - a video failure path has no observable, accessible state.
 *
 * Usage: node scripts/smoke-media-urls.mjs
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const failures = [];

const read = relativePath => {
  const absolute = join(root, relativePath);
  if (!existsSync(absolute)) {
    failures.push(`missing file: ${relativePath}`);
    return "";
  }
  return readFileSync(absolute, "utf8");
};

const APPROVED_ORIGINS = ["https://media.padiem.net", "https://padiem.net", "https://chat.padiem.net"];
const MEDIA_ORIGIN = "https://media.padiem.net";

const runtimeFiles = readdirSync(join(root, "static/js"))
  .filter(name => name.startsWith("padiem-") && name.endsWith(".js"))
  .map(name => `static/js/${name}`);

const mediaConfigPath = "static/js/padiem-media-v1.js";
const registryPath = "static/js/padiem-exhibit-registry-v1.js";

// 1 — the shared config publishes the origin and the home film.
const mediaConfig = read(mediaConfigPath);
if (!mediaConfig.includes(MEDIA_ORIGIN)) {
  failures.push(`${mediaConfigPath}: the approved media origin is not defined here`);
}
if (!mediaConfig.includes("fallbackCopy")) {
  failures.push(`${mediaConfigPath}: the shared failure copy is missing`);
}

// 2 — no runtime defines an absolute media URL, and no URL leaves the approved origins.
for (const file of runtimeFiles) {
  const source = read(file);
  const urls = [...source.matchAll(/https?:\/\/[^"'\s)]+/g)].map(match => match[0]);
  const mediaUrls = urls.filter(url => url.includes("/") && /\.(mp4|webm|m3u8|jpe?g|png|webp|avif)/.test(url));

  if (file !== registryPath && file !== mediaConfigPath && mediaUrls.length) {
    failures.push(`${file}: defines its own media URL(s) instead of reading ${mediaConfigPath}: ${mediaUrls.join(", ")}`);
  }

  for (const url of urls) {
    const approved = APPROVED_ORIGINS.some(origin => url.startsWith(`${origin}/`) || url === origin || url.startsWith(`${origin}?`));
    if (approved) continue;
    if (url.startsWith("https://www.w3.org") || url.startsWith("http://www.w3.org") || url.includes("schema.org")) continue;
    failures.push(`${file}: media/content URL leaves the approved origins: ${url}`);
  }
}

// 3 — one canonical definition per film.
const canonicalFilms = [
  "home/cinematic-scroll-v1.mp4",
  "design/hero/padiem-design-human-cinematic-v1.mp4",
  "design/hero/padiem-design-human-cinematic-v1.webp",
];
for (const film of canonicalFilms) {
  const defining = runtimeFiles.filter(file => read(file).includes(film));
  if (defining.length !== 1) {
    failures.push(`${film} is defined in ${defining.length} files (${defining.join(", ")}); exactly one definition is allowed`);
  }
}

const worldRuntime = read("static/js/padiem-cinematic-worlds-v1.js");
const designPage = read("static/html/pages/design.html");
for (const marker of ["PADIEM_MEDIA", "heroFilm", "heroPoster", "data-world-hero-fragments", "setReveal"]) {
  if (!worldRuntime.includes(marker) && !designPage.includes(marker)) failures.push(`Design hero reveal marker missing: ${marker}`);
}
for (const marker of ["data-world-hero-video", "data-world-hero-media-status", 'role="status"', 'aria-live="polite"']) {
  if (!designPage.includes(marker)) failures.push(`Design hero fallback marker missing: ${marker}`);
}

// 4 — exhibit media stays in the registry, on the approved origin.
const registryMedia = [...read(registryPath).matchAll(/media:\s*'([^']+)'/g)].map(match => match[1]);
if (!registryMedia.length) failures.push(`${registryPath}: no exhibit media URLs were found`);
for (const url of registryMedia) {
  if (!url.startsWith(`${MEDIA_ORIGIN}/`)) failures.push(`${registryPath}: exhibit media is not on the approved origin: ${url}`);
}

// 5 — every video failure path is observable and accessible.
const fallbackFiles = ["static/js/padiem-scroll-scrub-v1.js", "static/js/padiem-cinematic-v2-1.js"];
for (const file of fallbackFiles) {
  const source = read(file);
  if (!source.includes("fallbackCopy")) failures.push(`${file}: video failure copy does not come from the shared config`);
  if (!source.includes("media-state") && !source.includes("mediaState")) {
    failures.push(`${file}: video failure does not set an observable media state`);
  }
  if (!/role="status"|setAttribute\('role', 'status'\)|setAttribute\("role", "status"\)/.test(source)) {
    failures.push(`${file}: the failure state is not announced (role="status" missing)`);
  }
  if (!source.includes("aria-live")) failures.push(`${file}: the failure state is not announced (aria-live missing)`);
  if (!source.includes("padiem:language")) failures.push(`${file}: the failure copy does not follow the active language`);
  if (/crossorigin\\s*=|\\.crossOrigin\\s*=/.test(source)) {
    failures.push(`${file}: crossOrigin must stay unset for first-party media playback`);
  }
}

// 6 — the config is published and referenced before the runtimes that read it.
for (const page of ["public/index.html", "public/design/index.html", "public/products/index.html"]) {
  if (!existsSync(join(root, page))) continue;
  const built = read(page);
  const configAt = built.indexOf("padiem-media-v1.js");
  if (configAt < 0) {
    failures.push(`${page}: does not load the shared media config`);
    continue;
  }
  for (const consumer of ["padiem-cinematic-v2-1.js", "padiem-scroll-scrub-v1.js"]) {
    const consumerAt = built.indexOf(consumer);
    if (consumerAt >= 0 && consumerAt < configAt) {
      failures.push(`${page}: loads ${consumer} before the shared media config`);
    }
  }
}
if (existsSync(join(root, "public/js"))) {
  if (!existsSync(join(root, "public/js/padiem-media-v1.js"))) failures.push("public/js/padiem-media-v1.js was not published");
}
if (/cloudfront\.net/.test(runtimeFiles.map(read).join("\n"))) {
  failures.push("a legacy CloudFront media URL is still present in the runtimes");
}

if (failures.length) {
  console.error("Public media smoke check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `Public media smoke check passed: ${registryMedia.length} exhibit films on ${MEDIA_ORIGIN}, 1 canonical home film, observable fallbacks.`,
);
