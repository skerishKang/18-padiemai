import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifestDir = join(root, "static", "data", "padiem-v5");
const files = {
  families: "family-manifest.json",
  representatives: "representative-runtime-manifest.json",
  collections: "collection-membership-manifest.json",
  ecosystem: "ecosystem-case-manifest.json",
  repair: "runtime-repair-ledger.json",
  previousNext: "previous-next-order-manifest.json",
  viewport: "viewport-fallback-manifest.json",
};

const readJson = (name) => JSON.parse(readFileSync(join(manifestDir, name), "utf8"));
const data = Object.fromEntries(Object.entries(files).map(([key, name]) => [key, readJson(name)]));
const fail = (message) => { throw new Error(`[PADIEM V5 Phase 1] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const unique = (values, label) => {
  const seen = new Set();
  for (const value of values) {
    assert(!seen.has(value), `${label} contains duplicate: ${value}`);
    seen.add(value);
  }
};

assert(data.families.manifestType === "padiem-v5-family-manifest", "family manifest type mismatch");
assert(data.representatives.manifestType === "padiem-v5-representative-runtime-manifest", "representative runtime manifest type mismatch");
assert(data.collections.manifestType === "padiem-v5-collection-membership-manifest", "collection manifest type mismatch");
assert(data.ecosystem.manifestType === "padiem-v5-ecosystem-case-manifest", "ecosystem manifest type mismatch");
assert(data.repair.manifestType === "padiem-v5-runtime-class-repair-ledger", "repair ledger type mismatch");
assert(data.previousNext.manifestType === "padiem-v5-previous-next-order-manifest", "previous/next manifest type mismatch");
assert(data.viewport.manifestType === "padiem-v5-viewport-fallback-manifest", "viewport manifest type mismatch");

assert(data.families.declaredFamilyCount === 88, "LoveTree family count must remain 88");
assert(data.families.declaredFamilyCount !== 93, "93 Families is forbidden");
assert(data.collections.declaredCollectionCount === 7, "collection count must remain 7");
assert(data.collections.collections.length === 7, "collection catalog must contain exactly 7 locked collections");
assert(data.families.archetypeCatalog.length === 9, "family detail archetype count must remain 9");
assert(data.ecosystem.declaredCaseCount === 5, "ecosystem case count must remain 5");
assert(data.ecosystem.cases.length === 5, "ecosystem manifest must contain exactly 5 case slots");

const runtimeCount = data.ecosystem.cases.reduce((sum, item) => sum + item.runtimes.length, 0);
assert(data.ecosystem.declaredPublicRuntimeCount === 6, "ecosystem runtime count must remain 6");
assert(runtimeCount === 6, `ecosystem runtime entries must total 6, got ${runtimeCount}`);

const familyIds = data.families.records.map(item => item.stableId);
unique(familyIds, "family IDs");
const familySet = new Set(familyIds);

const collectionIds = data.collections.collections.map(item => item.stableId);
const collectionRouteIds = data.collections.collections.map(item => item.routeId);
unique(collectionIds, "collection IDs");
unique(collectionRouteIds, "collection route IDs");

for (const family of data.families.records) {
  assert("authority" in family, `${family.stableId} missing authority`);
  assert("publicVisibility" in family, `${family.stableId} missing publicVisibility`);
  assert("version" in family, `${family.stableId} missing version`);
  assert("representativeRuntime" in family, `${family.stableId} missing representativeRuntime`);
  assert("runtimeClass" in family, `${family.stableId} missing runtimeClass`);
  assert(Array.isArray(family.collectionMembership), `${family.stableId} collectionMembership must be an array`);
  assert("archetype" in family, `${family.stableId} missing archetype`);
  assert("repairState" in family, `${family.stableId} missing repairState`);
  assert("mobileFallbackState" in family, `${family.stableId} missing mobileFallbackState`);
  if (family.labelAuthority === "PENDING") {
    assert(family.label === "LABEL_AUTHORITY_PENDING", `${family.stableId} pending label must use LABEL_AUTHORITY_PENDING`);
  }
}

for (const membership of data.collections.memberships) {
  assert(familySet.has(membership.familyId), `collection membership references unknown family ${membership.familyId}`);
  assert(collectionIds.includes(membership.collectionId), `collection membership references unknown collection ${membership.collectionId}`);
}

const representativeFamilies = data.representatives.records.map(item => item.familyId);
unique(representativeFamilies, "representative family references");
for (const rep of data.representatives.records) {
  assert(familySet.has(rep.familyId), `representative runtime references unknown family ${rep.familyId}`);
}
const s47 = data.representatives.records.find(item => item.familyId === "S47");
assert(Boolean(s47), "S47 representative runtime assertion is missing");
assert(s47.familyIdentity === "S47", "S47 family identity must remain S47");
assert(s47.representativeRuntimeId === "S47_V4.2.5", "S47 public representative must remain V4.2.5");
assert(s47.version === "V4.2.5", "S47 representative version must remain V4.2.5");
assert(s47.runtimeClass === "ADAPTER_WRAPPED", "S47 representative runtime class must remain ADAPTER_WRAPPED");

for (const context of data.previousNext.contexts) {
  unique(context.sequence, `previous/next context ${context.contextId}`);
  for (const familyId of context.sequence) {
    assert(familySet.has(familyId), `previous/next context ${context.contextId} references unknown family ${familyId}`);
  }
}

for (const item of data.viewport.records) {
  assert(familySet.has(item.familyId), `viewport fallback references unknown family ${item.familyId}`);
}
const viewportIds = data.viewport.records.map(item => item.familyId).sort();
assert(JSON.stringify(viewportIds) === JSON.stringify(["S01","S12","S25","S35","S36"].sort()),
  "desktop-primary/mobile-fallback authority must remain S01,S12,S25,S35,S36");

const ecosystemIds = data.ecosystem.cases.map(item => item.stableId);
unique(ecosystemIds, "ecosystem case IDs");
const ecosystemRuntimeIds = data.ecosystem.cases.flatMap(item => item.runtimes.map(runtime => runtime.stableId));
unique(ecosystemRuntimeIds, "ecosystem runtime IDs");

for (const item of data.ecosystem.cases) {
  if (item.labelAuthority === "PENDING") {
    assert(item.label === "LABEL_AUTHORITY_PENDING", `${item.stableId} pending ecosystem label must use LABEL_AUTHORITY_PENDING`);
    assert(item.routeEnabled === false, `${item.stableId} unresolved ecosystem case must not be route-enabled`);
    assert(item.routeId === null, `${item.stableId} unresolved ecosystem case must not fabricate a route ID`);
  }
  for (const runtime of item.runtimes) {
    if (runtime.labelAuthority === "PENDING") {
      assert(runtime.label === "LABEL_AUTHORITY_PENDING", `${runtime.stableId} pending runtime label must use LABEL_AUTHORITY_PENDING`);
      assert(runtime.routeEnabled === false, `${runtime.stableId} unresolved runtime must not be route-enabled`);
    }
  }
}

const sasilro = data.ecosystem.cases.find(item => item.stableId === "SASILRO");
assert(Boolean(sasilro), "SASILRO ecosystem case is missing");
assert(sasilro.routeId === "sasilro", "SASILRO route ID mismatch");
assert(sasilro.runtimes.length === 2, "SASILRO must keep exactly two public runtimes");
assert(JSON.stringify(sasilro.runtimes.map(item => item.stableId)) === JSON.stringify(["SASILRO_06_HERO","SASILRO_07_WORKSPACE"]),
  "SASILRO must keep 06 Hero + 07 Workspace in authority order");
assert(sasilro.runtimes.every(item => item.runtimeClass === "DIRECT_HOST"),
  "SASILRO public runtimes must remain DIRECT_HOST");

const expectedRuntimeClasses = {
  DIRECT_HOST: ["S14","S16","S24","S28","S39","S46","S54","S55","S60","S61","S62","S66","S72","S13","S15","S52"],
  ADAPTER_WRAPPED: ["S74","S73","S70","S47","S69","S26","S27","S67","S11","S58"],
  FIX_REQUIRED: ["S57","S65","S36","S68","S12"],
  DESKTOP_PRIMARY_MOBILE_FALLBACK: ["S01","S12","S25","S35","S36"],
  DONOR_ONLY: ["S21","S43","S44","S45","S38"],
};
for (const [classification, expected] of Object.entries(expectedRuntimeClasses)) {
  const actual = data.repair.classAuthority[classification];
  assert(Array.isArray(actual), `repair ledger missing ${classification}`);
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${classification} authority drift`);
}

assert(data.repair.classAuthority.PARTIAL_INTERACTION_RECONCILIATION.includes("C04"), "C04 reconciliation authority missing");
assert(data.repair.classAuthority.INTERNAL_RESEARCH.includes("C16"), "C16 internal research authority missing");
for (const forbidden of ["C12-2","S47_LEGACY_PATH_MISMATCH","S68_V2_MISSING_ASSETS"]) {
  assert(data.repair.classAuthority.DO_NOT_REUSE_VARIANT.includes(forbidden), `do-not-reuse guard missing ${forbidden}`);
}

const pendingCount =
  data.families.records.filter(item => item.labelAuthority === "PENDING").length +
  data.ecosystem.cases.filter(item => item.labelAuthority === "PENDING").length +
  data.ecosystem.cases.flatMap(item => item.runtimes).filter(item => item.labelAuthority === "PENDING").length;
assert(pendingCount > 0, "LABEL_AUTHORITY_PENDING guard must be exercised by current partial authority");

console.log([
  "PADIEM_V5_PHASE1_VALIDATION=PASS",
  "FAMILY_COUNT_LOCK=88",
  "COLLECTION_COUNT_LOCK=7",
  "ARCHETYPE_COUNT_LOCK=9",
  "ECOSYSTEM_CASE_RUNTIME_LOCK=5/6",
  "S47_REPRESENTATIVE=V4.2.5",
  "SASILRO_DUAL_RUNTIME=06_HERO+07_WORKSPACE",
  `LABEL_AUTHORITY_PENDING_ROWS=${pendingCount}`,
].join("\n"));
