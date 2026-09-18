/**
 * Exhibit runtime smoke check.
 *
 * Design and Product scenes must stay mounted by stable identifier. This script fails when:
 *   - a source page frame has no `data-exhibit` id, or an id appears twice;
 *   - the ids declared in the page and in the runtime scene table disagree;
 *   - a Product scene id is not an exhibit registry id (the registry stays the authority);
 *   - a runtime goes back to document order (`frames[0]`) or page-title gating.
 *
 * Usage: node scripts/smoke-exhibit-runtime.mjs
 */

import { existsSync, readFileSync } from "node:fs";
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

const frameIds = source => [...source.matchAll(/world-media-frame"[^>]*data-exhibit="([^"]+)"/g)].map(match => match[1]);
const undeclaredFrames = source => (source.match(/class="world-media-frame"(?!\s+data-exhibit=)/g) || []).length;
const sceneIds = source => {
  const table = source.match(/const SCENES = \[([\s\S]*?)\n  \];/);
  if (!table) {
    failures.push("runtime scene table (const SCENES) was not found");
    return [];
  }
  return [...table[1].matchAll(/\['([^']+)',\s*'([^']+)'\]/g)].map(match => match[1]);
};
const duplicates = values => values.filter((value, index) => values.indexOf(value) !== index);

const check = (label, pagePath, runtimePath, expectedIds) => {
  const page = read(pagePath);
  const runtime = read(runtimePath);

  if (runtime.includes("document.title")) {
    failures.push(`${label}: runtime still gates on document.title`);
  }
  if (/\bframes\[\d+\]/.test(runtime)) {
    failures.push(`${label}: runtime still mounts by document order (frames[N])`);
  }

  const inPage = frameIds(page);
  const inRuntime = sceneIds(runtime);

  if (undeclaredFrames(page)) {
    failures.push(`${label}: ${undeclaredFrames(page)} frame(s) without a data-exhibit id in ${pagePath}`);
  }
  for (const id of duplicates(inPage)) failures.push(`${label}: duplicate frame id in ${pagePath}: ${id}`);
  if (inPage.length !== inRuntime.length) {
    failures.push(`${label}: ${pagePath} declares ${inPage.length} frame(s) but the runtime expects ${inRuntime.length}`);
  }
  const mismatched = inPage.filter(id => !inRuntime.includes(id));
  if (mismatched.length) failures.push(`${label}: frame ids missing from the runtime scene table: ${mismatched.join(", ")}`);

  if (expectedIds) {
    const unexpected = inPage.filter(id => !expectedIds.includes(id));
    if (unexpected.length) failures.push(`${label}: frame ids that are not registry ids: ${unexpected.join(", ")}`);
  }

  return inPage.length;
};

const registry = read("static/js/padiem-exhibit-registry-v1.js");
const registryProductIds = [...registry.matchAll(/^\s{6}id:\s*'([^']+)'/gm)].map(match => match[1]);
if (!registryProductIds.length) failures.push("exhibit registry product ids could not be read");

const designFrames = check("design", "static/html/pages/design.html", "static/js/padiem-live-exhibits-v1.js");
const productFrames = check("products", "static/html/pages/products.html", "static/js/padiem-product-exhibits-v1.js", registryProductIds);

if (failures.length) {
  console.error("Exhibit runtime smoke check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Exhibit runtime smoke check passed: ${designFrames} design scenes, ${productFrames} product scenes mounted by stable id.`);
