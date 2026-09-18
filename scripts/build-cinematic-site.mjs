import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicDir = join(root, "public");
const sourceHtml = join(root, "static", "html", "index1.html");
const exhibitRegistryPath = join(root, "static", "js", "padiem-exhibit-registry-v1.js");

// The exhibit registry is the public authority for every Design / Product scene.
// Refuse to publish if it is missing, exposes a non-approved origin, or drops an
// approved public CTA or film.
if (!existsSync(exhibitRegistryPath)) {
  throw new Error("Required exhibit registry is missing: static/js/padiem-exhibit-registry-v1.js");
}
const exhibitRegistryText = readFileSync(exhibitRegistryPath, "utf8");
if (/\.r2\.dev|workers\.dev/i.test(exhibitRegistryText)) {
  throw new Error("Exhibit registry must not expose r2.dev or workers.dev URLs.");
}
const exhibitMediaUrls = [...exhibitRegistryText.matchAll(/\bmedia:\s*'([^']*)'/g)]
  .map(match => match[1].trim())
  .filter(Boolean);
const exhibitHrefUrls = [...exhibitRegistryText.matchAll(/\bhref:\s*'([^']*)'/g)]
  .map(match => match[1].trim())
  .filter(Boolean);
const allowedPublicHrefs = new Set([
  "https://chat.padiem.net",
  "/design/living-media-sphere/",
]);
for (const href of exhibitHrefUrls) {
  if (!allowedPublicHrefs.has(href)) {
    throw new Error(`Unapproved public exhibit CTA: ${href}`);
  }
}
const requiredExhibitMedia = new Set([
  "https://media.padiem.net/design/orbitmorph-v1.mp4",
  "https://media.padiem.net/design/emotion-path-helix-v1.mp4",
  "https://media.padiem.net/design/rotating-memory-index-v1.mp4",
  "https://media.padiem.net/design/living-media-sphere-v1.mp4",
  "https://media.padiem.net/products/lovetree-mvp01-walkthrough-v1.mp4",
  "https://media.padiem.net/products/danjion-product-preview-v1.mp4",
]);
for (const required of requiredExhibitMedia) {
  if (!exhibitMediaUrls.includes(required)) {
    throw new Error(`Approved exhibit media is missing from the registry: ${required}`);
  }
}
for (const src of exhibitMediaUrls) {
  const url = new URL(src);
  const validPath = url.pathname.startsWith("/design/") || url.pathname.startsWith("/products/");
  if (url.origin !== "https://media.padiem.net" || !validPath) {
    throw new Error(`Exhibit media must use https://media.padiem.net/design|products/: ${src}`);
  }
  if (url.search || url.hash) {
    throw new Error(`Exhibit media URLs must not contain query strings or fragments: ${src}`);
  }
  if (!/-v\d+\.mp4$/i.test(url.pathname)) {
    throw new Error(`Exhibit media filenames must be versioned and end in -vN.mp4: ${src}`);
  }
}

// Exhibits live in the source tree, not in the publish output: every route is generated from
// a source location so that a clean clone reproduces production without staged copies.
const sphereSource = join(root, "static", "design", "living-media-sphere");
const sphereRoute = join(publicDir, "design", "living-media-sphere");
if (!existsSync(join(sphereSource, "index.html"))) {
  throw new Error("Living Media Sphere source is missing: static/design/living-media-sphere/index.html");
}

// Always start from a clean publish directory so legacy committed/generated pages
// cannot survive into a Netlify deploy.
rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });

let html = readFileSync(sourceHtml, "utf8");

const oldTitle = "<title>PADIEM Cinematic Pearl Glass Demo V2</title>";
const newTitle = "<title>PADIEM | AI로 일을 다시 설계합니다</title>";
const languageScript = '<script src="/js/padiem-cinematic-v2-2.js"></script>';
const homeNavScript = '<script src="/js/padiem-home-nav-v1.js"></script>';
const drawerTabsScript = '<script src="/js/padiem-home-drawer-tabs-v1.js"></script>';
const worldScrubScript = '<script src="/js/padiem-scroll-scrub-v1.js"></script>';
const homeMobileNavStyle = '<link rel="stylesheet" href="/css/padiem-home-mobile-nav-v1.css"/>';
const liveExhibitStyle = '<link rel="stylesheet" href="/css/padiem-live-exhibits-v1.css"/>';
const liveExhibitScript = '<script src="/js/padiem-live-exhibits-v1.js"></script>';
const productExhibitStyle = '<link rel="stylesheet" href="/css/padiem-product-exhibits-v1.css"/>';
const productExhibitScript = '<script src="/js/padiem-product-exhibits-v1.js"></script>';
const albumExhibitStyle = '<link rel="stylesheet" href="/css/padiem-album-exhibit-v1.css"/>';
const exhibitConfigScript = '<script src="/js/padiem-exhibit-config-v1.js"></script>';
const exhibitRegistryScript = '<script src="/js/padiem-exhibit-registry-v1.js"></script>';
const albumExhibitScript = '<script src="/js/padiem-album-exhibit-v1.js"></script>';
const rotatingIndexSource = join(root, "rotating-memory-index-source", "index.html");
const rotatingIndexAssets = join(root, "rotating-memory-index-source", "assets");
const rotatingIndexDestination = join(publicDir, "design", "rotating-memory-index");
const rotatingIndexMediaBase = "https://media.padiem.net/design/rotating-memory-index/";
// Only the four work-owned featured films are approved for the current public release.
// The 85 shared C12 films remain in Drive until their corresponding memories are explicitly
// approved for public release. Index entries still expose their poster/still preview without
// requesting an unpublished video. See docs/PADIEM_DESIGN_03_MEDIA_PUBLISH_SET_V1.md.
const rotatingIndexAttributionCss = '<style id="padiem-design-archive-attribution">.rmi-attribution{position:fixed;z-index:65;left:28px;top:23px;display:flex;align-items:flex-end;gap:8px;font-size:13px;font-weight:760;line-height:1}.rmi-attribution .rmi-by{font-size:7px;letter-spacing:.17em;color:rgba(16,16,15,.52);text-transform:uppercase}.rmi-archive-meta{position:fixed;z-index:65;right:28px;top:25px;display:flex;gap:11px;font-size:8px;letter-spacing:.17em;color:rgba(16,16,15,.52);text-transform:uppercase}.rmi-archive-meta strong{color:#10100f}.rmi-about-toggle{position:absolute;opacity:0}.rmi-about-trigger{position:fixed;z-index:66;left:28px;top:58px;border:0;border-left:2px solid #10100f;background:rgba(255,255,255,.58);padding:7px 9px;color:rgba(16,16,15,.55);font-size:7px;letter-spacing:.17em;text-transform:uppercase;cursor:pointer}.rmi-about{position:fixed;z-index:67;left:28px;top:91px;width:min(315px,calc(100% - 56px));padding:18px;background:rgba(247,246,242,.94);border:1px solid rgba(16,16,15,.14);opacity:0;pointer-events:none;transition:.22s}.rmi-about-toggle:checked~.rmi-about{opacity:1;pointer-events:auto}.rmi-about-close{float:right;font-size:18px;cursor:pointer}.rmi-about h2{margin:16px 0 9px;font-size:25px}.rmi-about p{font-size:9px;line-height:1.6;color:rgba(16,16,15,.62)}.rmi-about-meta{display:flex;gap:12px;margin-top:17px;padding-top:12px;border-top:1px solid rgba(16,16,15,.14);font-size:7px;letter-spacing:.15em}.rmi-signature{position:fixed;z-index:65;left:28px;bottom:23px;font-size:7px;letter-spacing:.16em;color:rgba(16,16,15,.52);text-transform:uppercase}@media(max-width:760px){.rmi-attribution{left:14px;top:14px}.rmi-archive-meta{display:none}.rmi-about-trigger{left:14px;top:47px}.rmi-about{left:14px;top:78px;width:calc(100% - 28px)}.rmi-signature{left:14px;bottom:14px;max-width:48%;font-size:6px}}</style>';

if (!html.includes(oldTitle)) {
  throw new Error("Expected cinematic source title was not found; refusing to publish an unreviewed head change.");
}
if (html.includes('rel="canonical"')) {
  throw new Error("Canonical already exists in the cinematic source; update this build script before publishing.");
}
if (!html.includes(languageScript)) {
  throw new Error("Expected language runtime script was not found; refusing to publish without the KO/EN language runtime.");
}
if (!html.includes('</head>')) {
  throw new Error("Expected </head> was not found in cinematic source.");
}

const seoHead = [
  newTitle,
  '<link rel="canonical" href="https://padiem.net/"/>',
  '<meta name="robots" content="index,follow,max-image-preview:large"/>',
  '<meta property="og:type" content="website"/>',
  '<meta property="og:site_name" content="PADIEM"/>',
  '<meta property="og:title" content="PADIEM | AI로 일을 다시 설계합니다"/>',
  '<meta property="og:description" content="파디엠은 Generative AI, AX, Public AI Agent, Multimodal AI 기술로 산업과 공공의 업무를 다시 설계합니다."/>',
  '<meta property="og:url" content="https://padiem.net/"/>',
].join("");

html = html.replace(oldTitle, seoHead);

if (!html.includes('padiem-home-mobile-nav-v1.css')) {
  html = html.replace('</head>', `${homeMobileNavStyle}</head>`);
}

// Script order is a fail-closed contract: the shared runtime must load before cinematic code.
if (!html.includes('padiem-runtime-v1.js')) {
  throw new Error("The shared runtime script is missing from static/html/index1.html; it must load before the home cinematic runtimes.");
}
if (!html.includes('padiem-media-v1.js')) {
  throw new Error("The media config script is missing from static/html/index1.html; runtimes read public media URLs from it.");
}
if (html.indexOf('padiem-runtime-v1.js') > html.indexOf('padiem-cinematic-v2-1.js')) {
  throw new Error("The shared runtime must load before the home cinematic runtimes in static/html/index1.html.");
}

// The legacy source markup still contains the previous navigation labels. Inject
// the IA adapter before the existing language/overlay runtime so that the latter
// binds to the final navigation semantics. The drawer-tab enhancer runs after it.
html = html.replace(
  languageScript,
  `${homeNavScript}${languageScript}${drawerTabsScript}`,
);

writeFileSync(join(publicDir, "index.html"), html, "utf8");

// Copy only runtime assets. Do NOT copy static/html/** wholesale: that tree still
// contains archived/legacy page shells which must never reappear in production.
for (const dir of ["css", "js", "images"]) {
  const source = join(root, "static", dir);
  if (!existsSync(source)) {
    throw new Error(`Required asset directory is missing: static/${dir}`);
  }
  cpSync(source, join(publicDir, dir), { recursive: true });
}

// Publish the Living Media Sphere route from its source location.
mkdirSync(join(publicDir, "design"), { recursive: true });
cpSync(sphereSource, sphereRoute, { recursive: true });

const requiredFiles = [
  [join(root, "static", "_redirects"), join(publicDir, "_redirects")],
  [join(root, "static", "404.html"), join(publicDir, "404.html")],
  [join(root, "robots.txt"), join(publicDir, "robots.txt")],
  [join(root, "sitemap.xml"), join(publicDir, "sitemap.xml")],
];

for (const [source, destination] of requiredFiles) {
  if (!existsSync(source)) {
    throw new Error(`Required publish file is missing: ${source}`);
  }
  copyFileSync(source, destination);
}

// Publish only the primary cinematic destinations. Company / Team / Contact
// remain first-party drawer surfaces inside the home world and are reached via
// compatibility redirects; do not republish the legacy standalone page shell.
const showcasePages = [
  { source: "pages/products.html", dest: "products/index.html" },
  { source: "pages/design.html",  dest: "design/index.html"  },
];

for (const { source, dest } of showcasePages) {
  const srcPath = join(root, "static", "html", source);
  if (!existsSync(srcPath)) {
    throw new Error(`Showcase page is missing: static/html/${source}`);
  }

  let pageHtml = readFileSync(srcPath, "utf8");
  if (!pageHtml.includes('padiem-cinematic-worlds-v1.js')) {
    throw new Error(`Cinematic world runtime is missing from static/html/${source}`);
  }
  if (!pageHtml.includes('</head>') || !pageHtml.includes('</body>')) {
    throw new Error(`Expected document boundaries were not found in static/html/${source}`);
  }

  if (!pageHtml.includes('padiem-runtime-v1.js')) {
    throw new Error(`The shared runtime script is missing from static/html/${source}; it must load before the page world runtime.`);
  }
  if (!pageHtml.includes('padiem-media-v1.js')) {
    throw new Error(`The media config script is missing from static/html/${source}; runtimes read public media URLs from it.`);
  }
  if (pageHtml.indexOf('padiem-runtime-v1.js') > pageHtml.indexOf('padiem-cinematic-worlds-v1.js')) {
    throw new Error(`The shared runtime must load before the page world runtime in static/html/${source}.`);
  }
  if (!pageHtml.includes('padiem-scroll-scrub-v1.js')) {
    pageHtml = pageHtml.replace('</body>', `  ${worldScrubScript}\n</body>`);
  }

  // Products and Design are separate exhibition worlds. Each receives only its
  // own public-safe study runtime while sharing the same cinematic scroll-scrub.
  if (source === 'pages/products.html') {
    if (!pageHtml.includes('padiem-product-exhibits-v1.css')) {
      pageHtml = pageHtml.replace('</head>', `  ${productExhibitStyle}\n</head>`);
    }
    if (!pageHtml.includes('padiem-product-exhibits-v1.js')) {
      pageHtml = pageHtml.replace('</body>', `  ${productExhibitScript}\n</body>`);
    }
  }

  if (source === 'pages/design.html') {
    if (!pageHtml.includes('padiem-live-exhibits-v1.css')) {
      pageHtml = pageHtml.replace('</head>', `  ${liveExhibitStyle}\n</head>`);
    }
    if (!pageHtml.includes('padiem-live-exhibits-v1.js')) {
      pageHtml = pageHtml.replace('</body>', `  ${liveExhibitScript}\n</body>`);
    }
  }

  if (!pageHtml.includes('padiem-album-exhibit-v1.css')) {
    pageHtml = pageHtml.replace('</head>', `  ${albumExhibitStyle}\n</head>`);
  }
  if (!pageHtml.includes('padiem-exhibit-config-v1.js')) {
    pageHtml = pageHtml.replace('</body>', `  ${exhibitConfigScript}\n</body>`);
  }
  if (!pageHtml.includes('padiem-exhibit-registry-v1.js')) {
    pageHtml = pageHtml.replace('</body>', `  ${exhibitRegistryScript}\n  ${albumExhibitScript}\n</body>`);
  }

  const destPath = join(publicDir, dest);
  mkdirSync(join(publicDir, dest.split("/")[0]), { recursive: true });
  writeFileSync(destPath, pageHtml, "utf8");
}

// Publish the complete Design / 03 source world. HTML and still assets stay in
// the Netlify publish output; only MP4 objects use the public media origin.
if (!existsSync(rotatingIndexSource) || !existsSync(rotatingIndexAssets)) {
  throw new Error("Rotating Memory Index source package is missing.");
}
const rotatingIndexHtml = readFileSync(rotatingIndexSource, "utf8")
  .replace(/<title>[^<]*<\/title>/i, "<title>PADIEM Design / Rotating Memory Index</title>")
  .replace(/assets\/featured-videos\/memory-(\d+)\.mp4/g, `${rotatingIndexMediaBase}memory-$1-v1.mp4`)
  // The authored source points 85 Index items at the private C12 shared-video corpus.
  // Those films are not approved for this release. Remove that production dependency and
  // keep a poster-only viewer for deferred items, while preserving the four featured videos.
  .replace(
    "var indexGrid=document.getElementById('indexGrid'),fullVideoBase='../../12_러브트리_리빙미디어스피어_인터랙티브대문_V1/assets/videos-v3/';",
    "var indexGrid=document.getElementById('indexGrid');",
  )
  .replace(
    "var local={24:'024',46:'046',47:'047',71:'071'}[no],src=local?'assets/featured-videos/memory-'+local+'.mp4':fullVideoBase+'v3-'+p+'.mp4';openMedia('video',src,'assets/index-posters/poster-'+p+'.jpg',title,'LoveTree film · '+p+' / 089');",
    "var local={24:'024',46:'046',47:'047',71:'071'}[no];if(local){var src='assets/featured-videos/memory-'+local+'.mp4';openMedia('video',src,'assets/index-posters/poster-'+p+'.jpg',title,'LoveTree film · '+p+' / 089');}else{var poster='assets/index-posters/poster-'+p+'.jpg';openMedia('image',poster,poster,title,'LoveTree memory · '+p+' / 089 · film publication deferred');}",
  )
  // The index-item override also resolves a featured film at click time. That concatenation
  // has to be rewritten as well, otherwise the published work points at a work-local file.
  .replace(
    "'assets/featured-videos/memory-'+local+'.mp4'",
    `'${rotatingIndexMediaBase}memory-'+local+'-v1.mp4'`,
  )
  .replace(/<header class="topbar">[\s\S]*?<\/header>/i, "")
  .replace(/<div class="caption">[\s\S]*?<\/div>/i, "")
  .replace("</head>", `${rotatingIndexAttributionCss}</head>`)
  .replace("<body>", '<body data-padiem-world="rotating-memory-index"><div class="rmi-attribution"><span class="mark" aria-hidden="true"></span><span>LoveTree</span><span class="rmi-by">BY PADIEM</span></div><div class="rmi-archive-meta"><span>DESIGN ARCHIVE / STUDY 03</span><strong>2026</strong></div><input class="rmi-about-toggle" id="rmiAboutToggle" type="checkbox"><label class="rmi-about-trigger" for="rmiAboutToggle">PADIEM / ABOUT THIS WORK</label><div class="rmi-about"><label class="rmi-about-close" for="rmiAboutToggle" aria-label="Close">×</label><div class="rmi-about-kicker">PADIEM DESIGN ARCHIVE · STUDY 03</div><h2>Rotating Memory Index</h2><p>An index-led memory experience where selecting one moment transforms the card and opens the next layer of the archive.</p><div class="rmi-about-meta"><span>CREATED BY PADIEM</span><span>FOR LOVETREE</span><span>2026</span></div></div><div class="rmi-signature">PADIEM DESIGN ARCHIVE · 03&nbsp;&nbsp; / &nbsp;&nbsp;MEMORY · MOTION · INTERACTION</div>');
// Fail closed: the published work must not carry work-local media paths or the private C12
// source path. Every film has to resolve to an approved public media origin instead.
for (const unresolved of ["12_러브트리", "assets/featured-videos/", "videos-v3/"]) {
  if (rotatingIndexHtml.includes(unresolved)) {
    throw new Error(`Rotating Memory Index output still references a non-public media path: ${unresolved}`);
  }
}
if (!rotatingIndexHtml.includes(rotatingIndexMediaBase)) {
  throw new Error("Rotating Memory Index featured films do not resolve to the approved work media origin.");
}
if (rotatingIndexHtml.includes("https://media.padiem.net/shared/lovetree-v3/")) {
  throw new Error("Deferred shared LoveTree films must not be public dependencies in the current release.");
}
// Published featured objects are versioned and immutable; an unversioned key must never ship.
if (!rotatingIndexHtml.includes("-v1.mp4")) {
  throw new Error("Rotating Memory Index output does not use versioned public media keys.");
}
if (/memory-\d+\.mp4/.test(rotatingIndexHtml)) {
  throw new Error("Rotating Memory Index output still references an unversioned featured media key.");
}

mkdirSync(rotatingIndexDestination, { recursive: true });
writeFileSync(join(rotatingIndexDestination, "index.html"), rotatingIndexHtml, "utf8");
cpSync(rotatingIndexAssets, join(rotatingIndexDestination, "assets"), {
  recursive: true,
  filter: source => !source.toLowerCase().endsWith(".mp4"),
});

// Preserve search-engine verification files without republishing the old site.
for (const file of [
  "googlef7d3aa2eaecfa367.html",
  "naver973c7ccb11cec92fb48885106f1bf365.html",
]) {
  const source = join(root, file);
  if (existsSync(source)) {
    copyFileSync(source, join(publicDir, file));
  }
}

console.log("Built canonical PADIEM cinematic site and worlds.");
