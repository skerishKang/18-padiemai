/**
 * PADIEM public media publish — Design / 03 Rotating Memory Index
 *
 * Policy (Issue #47: Drive authority + R2 publish-only, PR #48):
 *   - Google Drive is the source/master authority. The corpus is NOT mirrored to R2 wholesale.
 *   - R2 (media.padiem.net) is the production publish layer: only objects that the approved
 *     production runtime actually addresses are published.
 *   - A corpus shared by more than one work is published once under a shared namespace and
 *     referenced from each work, instead of being duplicated per work prefix.
 *   - Published objects are immutable. This script never overwrites an existing object;
 *     a re-cut has to be published under a new versioned key.
 *
 * Measured runtime loading contract (read-only audit, Issue #46):
 *   - first entry: 0 shared films requested; 4 featured films at preload="metadata";
 *     89 posters requested lazily by the browser as the index grid scrolls.
 *   - index click: exactly one film requested, on demand, at click time.
 *   => nothing eager, nothing bulk: the approved publish set is the 4 work-owned featured
 *      films plus the 85 shared corpus films the index addresses = 89 objects.
 *      See docs/PADIEM_DESIGN_03_MEDIA_PUBLISH_SET_V1.md.
 *
 * Usage:
 *   node scripts/publish-rotating-memory-index-media-r2.mjs           # plan only, no mutation (default)
 *   node scripts/publish-rotating-memory-index-media-r2.mjs --apply   # publish missing objects
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const APPLY = process.argv.includes("--apply");

const root = process.cwd();
const sourceRoot = join(root, "rotating-memory-index-source");
const bucket = "padiem-media";
const publicOrigin = "https://media.padiem.net/";

// Work-owned objects. These are built by this work and published under its own prefix.
const workPrefix = "design/rotating-memory-index";
const featuredSource = join(sourceRoot, "assets", "featured-videos");
const expectedFeatured = 4;

// Shared C12 `videos-v3` corpus. Owned by the Living Memory source material and reused by the
// index; published once here and referenced by every work that needs it.
const sharedPrefix = "shared/lovetree-v3";
const sharedSource = join(sourceRoot, "shared-videos");
const expectedShared = 85;

// Published keys are versioned and immutable, matching the public media naming rule the build
// enforces. Source names stay untouched: `memory-024.mp4` publishes as `memory-024-v1.mp4`.
const versioned = name => name.replace(/\.mp4$/i, "-v1.mp4");
const plan = [];
const collect = (directory, prefix, matcher) => {
  if (!existsSync(directory)) throw new Error(`Publish source is missing: ${directory}`);
  for (const name of readdirSync(directory).sort()) {
    if (!matcher.test(name)) continue;
    const file = join(directory, name);
    const bytes = statSync(file).size;
    if (!bytes) throw new Error(`Publish source is empty: ${file}`);
    plan.push({ key: `${prefix}/${versioned(name)}`, file, bytes });
  }
};

collect(featuredSource, workPrefix, /^memory-\d{3}\.mp4$/i);
collect(sharedSource, sharedPrefix, /^v3-\d{3}\.mp4$/i);

const featured = plan.filter(entry => entry.key.startsWith(`${workPrefix}/`));
const shared = plan.filter(entry => entry.key.startsWith(`${sharedPrefix}/`));
if (featured.length !== expectedFeatured) {
  throw new Error(`Expected ${expectedFeatured} featured films, found ${featured.length}. Refusing to publish a partial work.`);
}
if (shared.length !== expectedShared) {
  throw new Error(`Expected ${expectedShared} shared corpus films, found ${shared.length}. Refusing to publish a partial set.`);
}

const totalBytes = plan.reduce((sum, entry) => sum + entry.bytes, 0);
console.log(`Approved publish set: ${featured.length} featured + ${shared.length} shared = ${plan.length} objects (${(totalBytes / 1024 / 1024).toFixed(1)} MiB)`);
console.log(`  ${workPrefix}/    -> work-owned films`);
console.log(`  ${sharedPrefix}/  -> shared corpus, published once for all works`);
for (const entry of plan) {
  console.log(`    ${entry.key} (${(entry.bytes / 1024 / 1024).toFixed(2)} MiB)`);
}

if (!APPLY) {
  console.log("\nDRY RUN: nothing was uploaded. Re-run with --apply only after owner approval of this publish set.");
  process.exit(0);
}

const objectExists = async key => {
  const response = await fetch(`${publicOrigin}${key}`, { method: "HEAD" });
  if (response.status === 200) return true;
  if (response.status === 404) return false;
  throw new Error(`Cannot verify immutability for ${key}: public media origin returned ${response.status}`);
};

let published = 0;
let skipped = 0;
for (const [index, entry] of plan.entries()) {
  if (await objectExists(entry.key)) {
    skipped += 1;
    console.log(`[${index + 1}/${plan.length}] IMMUTABLE existing object, not overwriting: ${entry.key}`);
    continue;
  }
  console.log(`[${index + 1}/${plan.length}] publish ${entry.key}`);
  const wrangler = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
  const result = spawnSync(
    wrangler,
    ["r2", "object", "put", `${bucket}/${entry.key}`, "--remote", "--file", entry.file, "--content-type", "video/mp4"],
    { stdio: "inherit", shell: true, env: { ...process.env, CLOUDFLARE_API_TOKEN: undefined } },
  );
  if (result.status !== 0) throw new Error(`Publish failed for ${entry.key}`);
  published += 1;
}

console.log(`\nPublished ${published} object(s); skipped ${skipped} already-published immutable object(s).`);
console.log("Next: verify source<->remote parity, HTTP 200 and Range 206 for the newly published keys, then record them in the public media ledger.");
