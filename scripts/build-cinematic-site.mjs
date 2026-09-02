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

// Album media is an explicit public authority boundary. Fail closed before any
// publish output is created if a registry edit bypasses the R2/custom-domain
// contract or reintroduces an infrastructure-style public URL.
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

  // Mode config must execute before the legacy scroll-scrub runtime so ALBUM can
  // skip that background entirely while CURRENT remains behaviorally equivalent.
  if (!pageHtml.includes('padiem-exhibit-config-v1.js')) {
    pageHtml = pageHtml.replace('</body>', `  ${exhibitConfigScript}\n</body>`);
  }
  if (!pageHtml.includes('padiem-scroll-scrub-v1.js')) {
    pageHtml = pageHtml.replace('</body>', `  ${worldScrubScript}\n</body>`);
  }

  // Preserve the accepted CURRENT renderers exactly as their own mode.
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

  // The Album/Collection renderer is parallel, not destructive. Its config
  // chooses CURRENT or ALBUM per world, and ?exhibit=current|album can override
  // the default for exact-head QA without changing source or media authority.
  if (!pageHtml.includes('padiem-album-exhibit-v1.css')) {
    pageHtml = pageHtml.replace('</head>', `  ${albumExhibitStyle}\n</head>`);
  }
  if (!pageHtml.includes('padiem-exhibit-registry-v1.js')) {
    pageHtml = pageHtml.replace(
      '</body>',
      `  ${exhibitRegistryScript}\n  ${albumExhibitScript}\n</body>`,
    );
  }

  const destPath = join(publicDir, dest);
  mkdirSync(join(publicDir, dest.split("/")[0]), { recursive: true });
  writeFileSync(destPath, pageHtml, "utf8");
}

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
