/**
 * PADIEM public media publish — Design / 03 Rotating Memory Index
 *
 * Dry-run by default. --apply is the only mutating path.
 * Existing versioned objects are immutable: they are skipped only after the public
 * object's byte length and single-part ETag match the local source exactly.
 */

import { existsSync, readdirSync, statSync, createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const APPLY = process.argv.includes("--apply");

const root = process.cwd();
const sourceRoot = join(root, "rotating-memory-index-source");
const bucket = "padiem-media";
const publicOrigin = "https://media.padiem.net/";

const workPrefix = "design/rotating-memory-index";
const featuredSource = join(sourceRoot, "assets", "featured-videos");
const expectedFeatured = 4;

const sharedPrefix = "shared/lovetree-v3";
const sharedSource = join(sourceRoot, "shared-videos");
const expectedShared = 85;

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

const md5File = file => new Promise((resolve, reject) => {
  const hash = createHash("md5");
  const stream = createReadStream(file);
  stream.on("error", reject);
  stream.on("data", chunk => hash.update(chunk));
  stream.on("end", () => resolve(hash.digest("hex")));
});

const inspectExisting = async entry => {
  const response = await fetch(`${publicOrigin}${entry.key}`, { method: "HEAD", cache: "no-store" });
  if (response.status === 404) return false;
  if (response.status !== 200) {
    throw new Error(`Cannot verify immutability for ${entry.key}: public media origin returned ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (!Number.isFinite(contentLength) || contentLength !== entry.bytes) {
    throw new Error(
      `IMMUTABLE KEY CONFLICT for ${entry.key}: remote bytes=${response.headers.get("content-length")} local bytes=${entry.bytes}`,
    );
  }

  const etag = (response.headers.get("etag") || "").replace(/^W\//, "").replace(/^"|"$/g, "");
  if (!/^[a-f0-9]{32}$/i.test(etag)) {
    throw new Error(
      `Cannot prove byte parity for existing immutable object ${entry.key}: missing/non-single-part ETag (${etag || "none"}). Refusing to skip.`,
    );
  }

  const localMd5 = await md5File(entry.file);
  if (etag.toLowerCase() !== localMd5.toLowerCase()) {
    throw new Error(`IMMUTABLE KEY CONFLICT for ${entry.key}: remote ETag does not match local source.`);
  }

  return true;
};

let published = 0;
let skipped = 0;
for (const [index, entry] of plan.entries()) {
  if (await inspectExisting(entry)) {
    skipped += 1;
    console.log(`[${index + 1}/${plan.length}] VERIFIED immutable existing object, not overwriting: ${entry.key}`);
    continue;
  }

  console.log(`[${index + 1}/${plan.length}] publish ${entry.key}`);
  const wrangler = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
  const result = spawnSync(
    wrangler,
    ["r2", "object", "put", `${bucket}/${entry.key}`, "--remote", "--file", entry.file, "--content-type", "video/mp4"],
    { stdio: "inherit", shell: true, env: process.env },
  );
  if (result.status !== 0) throw new Error(`Publish failed for ${entry.key}`);

  // Do not count a write as accepted until the public immutable key is visible and
  // byte-identical to the source. This also catches wrong-account/wrong-bucket writes.
  if (!(await inspectExisting(entry))) {
    throw new Error(`Publish verification failed for ${entry.key}: object is still absent from the public origin.`);
  }
  published += 1;
}

console.log(`\nPublished and parity-verified ${published} object(s); verified/skipped ${skipped} existing immutable object(s).`);
console.log("Next: verify HTTP Range 206 and cache behavior for representative/new keys, then record accepted objects in the public media ledger.");
