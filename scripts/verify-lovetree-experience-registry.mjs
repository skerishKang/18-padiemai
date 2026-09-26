import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const file = join(root, "contracts", "lovetree-experience-registry-v1.json");
const registry = JSON.parse(readFileSync(file, "utf8"));

const fail = message => {
  throw new Error(`LoveTree registry contract failed: ${message}`);
};

const requiredTop = [
  "version",
  "issue",
  "childIssue",
  "authorityCheckedAt",
  "sourceAuthority",
  "runtimePolicy",
  "interactionContract",
  "items",
];
for (const key of requiredTop) {
  if (!(key in registry)) fail(`missing top-level field ${key}`);
}

if (registry.issue !== 34 || registry.childIssue !== 75) {
  fail("issue lineage must remain #34 -> #75");
}
if (registry.authorityCheckedAt !== "2026-09-26") {
  fail("authority check date changed without an explicit contract refresh");
}
if (registry.sourceAuthority !== "GOOGLE_DRIVE_LOVETREE_SOURCE_CODEX") {
  fail("Drive SOURCE/CODEX must remain source authority");
}
if (registry.runtimePolicy.maxActivePreviews !== 1) {
  fail("exactly one active preview is allowed");
}
if (registry.runtimePolicy.largeMediaInGit !== false) {
  fail("large media must not be committed to Git");
}
if (registry.runtimePolicy.sourceIdsRenumberable !== false) {
  fail("SOURCE/CODEX IDs are immutable");
}
if (!Array.isArray(registry.items) || registry.items.length !== 12) {
  fail(`expected exactly 12 V1 featured families, found ${registry.items?.length ?? "none"}`);
}

const requiredItem = [
  "id",
  "namespace",
  "sourceId",
  "familyId",
  "title",
  "titleKo",
  "job",
  "status",
  "runtimeType",
  "previewMode",
  "interaction",
  "audio",
  "mobilePolicy",
  "sourceDriveId",
  "sourceDriveTitle",
  "provenance",
  "featured",
  "runtimeAuditRequired",
];

const ids = new Set();
const sourceKeys = new Set();
const driveIds = new Set();

for (const item of registry.items) {
  for (const key of requiredItem) {
    if (!(key in item)) fail(`${item.id || "<unknown>"} missing ${key}`);
  }

  if (!["SOURCE", "CODEX"].includes(item.namespace)) {
    fail(`${item.id} has invalid namespace ${item.namespace}`);
  }
  if (!/^\d{2}$/.test(item.sourceId)) {
    fail(`${item.id} sourceId must be a preserved two-digit SOURCE/CODEX id`);
  }

  const prefix = item.namespace.toLowerCase();
  const sourceKey = `${item.namespace}${item.sourceId}`;
  if (item.familyId !== `${prefix}-${item.sourceId}`) {
    fail(`${item.id} familyId drifted from SOURCE/CODEX identity`);
  }
  if (!item.id.startsWith(`${prefix}-${item.sourceId}-`)) {
    fail(`${item.id} does not preserve SOURCE/CODEX identity in id`);
  }
  if (!item.sourceDriveTitle.startsWith(`${item.sourceId}_`)) {
    fail(`${item.id} Drive folder title no longer matches sourceId`);
  }
  if (!/^[A-Za-z0-9_-]{20,}$/.test(item.sourceDriveId)) {
    fail(`${item.id} has an invalid Drive folder id`);
  }
  if (item.provenance !== "DRIVE_FOLDER_VERIFIED_2026-09-26") {
    fail(`${item.id} provenance is not the fresh Drive verification`);
  }
  if (item.featured !== true) {
    fail(`${item.id} must remain in the V1 featured set`);
  }
  if (item.runtimeAuditRequired !== true) {
    fail(`${item.id} cannot bypass a fresh per-work runtime audit`);
  }
  if (!Array.isArray(item.interaction) || item.interaction.length === 0) {
    fail(`${item.id} must declare an interaction contract`);
  }

  if (ids.has(item.id)) fail(`duplicate id ${item.id}`);
  if (sourceKeys.has(sourceKey)) fail(`duplicate SOURCE/CODEX identity ${sourceKey}`);
  if (driveIds.has(item.sourceDriveId)) fail(`duplicate Drive folder id ${item.sourceDriveId}`);
  ids.add(item.id);
  sourceKeys.add(sourceKey);
  driveIds.add(item.sourceDriveId);
}

const previewItems = registry.items.filter(item => item.status === "PREVIEW");
const liveItems = registry.items.filter(item => item.status === "LIVE");
if (liveItems.length !== 0) {
  fail("V1 scaffold cannot claim LIVE before per-work fidelity acceptance");
}
if (previewItems.length !== 1 || previewItems[0].id !== "codex-14-rotating-memory-index") {
  fail("current scaffold permits PREVIEW only for CODEX14 Rotating Memory Index");
}

const rmi = previewItems[0];
if (rmi.publicRoute !== "/design/rotating-memory-index/") {
  fail("CODEX14 public preview route drifted");
}
if (rmi.publicFidelity !== "PARTIAL_SHARED_85_DEFERRED") {
  fail("CODEX14 must not be mislabeled as full-fidelity while shared 85 remain deferred");
}

for (const item of registry.items) {
  if (item.id !== rmi.id && "publicRoute" in item) {
    fail(`${item.id} exposes an unreviewed public route`);
  }
  if (item.id !== rmi.id && item.status !== "HOLD") {
    fail(`${item.id} public state expanded beyond HOLD without a dedicated review`);
  }
}

console.log(
  `LoveTree Design World registry PASS: ${registry.items.length} featured families, ` +
  `${previewItems.length} PREVIEW, ${liveItems.length} LIVE, source IDs immutable.`,
);
