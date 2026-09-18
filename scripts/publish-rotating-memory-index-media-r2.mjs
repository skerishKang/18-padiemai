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
import { spawn, spawnSync } from "node:child_process";

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

const hashFile = (file, algorithm) => new Promise((resolve, reject) => {
  const hash = createHash(algorithm);
  const stream = createReadStream(file);
  stream.on("error", reject);
  stream.on("data", chunk => hash.update(chunk));
  stream.on("end", () => resolve(hash.digest("hex")));
});

const hashRemoteObject = entry => new Promise((resolve, reject) => {
  const wrangler = process.platform === "win32" ? "wrangler.cmd" : "wrangler";
  const child = spawn(
    wrangler,
    ["r2", "object", "get", `${bucket}/${entry.key}`, "--remote", "--pipe"],
    {
      stdio: ["ignore", "pipe", "inherit"],
      shell: process.platform === "win32",
      env: process.env,
    },
  );

  const hash = createHash("sha256");
  let bytes = 0;
  child.stdout.on("data", chunk => {
    bytes += chunk.length;
    hash.update(chunk);
  });
  child.on("error", reject);
  child.on("close", code => {
    if (code !== 0) {
      reject(new Error(`Remote parity read failed for ${entry.key} (wrangler exit ${code})`));
      return;
    }
    resolve({ sha256: hash.digest("hex"), bytes });
  });
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

  // Fast path: a single-part R2 object exposes the content MD5 as a 32-hex ETag.
  if (/^[a-f0-9]{32}$/i.test(etag)) {
    const localMd5 = await hashFile(entry.file, "md5");
    if (etag.toLowerCase() !== localMd5.toLowerCase()) {
      throw new Error(`IMMUTABLE KEY CONFLICT for ${entry.key}: remote ETag does not match local source.`);
    }
    return true;
  }

  // Multipart R2 objects use a composite ETag (hash-partCount), so ETag cannot prove
  // whole-object equality. Fall back to a bounded-memory remote stream SHA-256 check.
  // This costs one authenticated read of that object, but avoids false failures after
  // a successful multipart upload while preserving the immutable-key conflict stop.
  console.warn(
    `Non-single-part ETag for ${entry.key} (${etag || "none"}); verifying full remote bytes with SHA-256.`,
  );
  const [localSha256, remote] = await Promise.all([
    hashFile(entry.file, "sha256"),
    hashRemoteObject(entry),
  ]);
  if (remote.bytes !== entry.bytes) {
    throw new Error(
      `IMMUTABLE KEY CONFLICT for ${entry.key}: remote streamed bytes=${remote.bytes} local bytes=${entry.bytes}`,
    );
  }
  if (remote.sha256.toLowerCase() !== localSha256.toLowerCase()) {
    throw new Error(`IMMUTABLE KEY CONFLICT for ${entry.key}: remote SHA-256 does not match local source.`);
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
