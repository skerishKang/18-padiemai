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

if (!html.includes(oldTitle)) {
  throw new Error("Expected cinematic source title was not found; refusing to publish an unreviewed head change.");
}
if (html.includes('rel="canonical"')) {
  throw new Error("Canonical already exists in the cinematic source; update this build script before publishing.");
}
if (!html.includes(languageScript)) {
  throw new Error("Expected language runtime script was not found; refusing to publish without the KO/EN language runtime.");
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

// The legacy source markup still contains the previous navigation labels. Inject
// the IA adapter before the existing language/overlay runtime so that the latter
// binds to the final navigation semantics. The drawer-tab enhancer runs after it.
html = html.replace(
  languageScript,
  `${homeNavScript}${languageScript}${drawerTabsScript}`,
);

writeFileSync(join(publicDir, "index.html"), html, "utf8");

// Copy supporting directories.
for (const dir of ["css", "js", "images", "html"]) {
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
  const destPath = join(publicDir, dest);
  mkdirSync(join(publicDir, dest.split("/")[0]), { recursive: true });
  copyFileSync(srcPath, destPath);
}

// Preserve legacy search-engine verification files without republishing the old site.
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
