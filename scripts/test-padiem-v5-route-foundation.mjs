import { readFileSync } from "node:fs";
import { join } from "node:path";
import { matchPadiemV5Route, resolvePadiemV5Route } from "../static/js/padiem-v5-route-foundation.mjs";

const root = process.cwd();
const dir = join(root, "static", "data", "padiem-v5");
const load = (name) => JSON.parse(readFileSync(join(dir, name), "utf8"));
const manifests = {
  families: load("family-manifest.json"),
  representatives: load("representative-runtime-manifest.json"),
  collections: load("collection-membership-manifest.json"),
  ecosystem: load("ecosystem-case-manifest.json"),
};

const expect = (path, ok, kind, reason = null) => {
  const resolved = resolvePadiemV5Route(matchPadiemV5Route(path), manifests);
  if (resolved.ok !== ok) throw new Error(`${path}: expected ok=${ok}, got ${resolved.ok}`);
  if (kind && resolved.kind !== kind) throw new Error(`${path}: expected kind=${kind}, got ${resolved.kind}`);
  if (reason && resolved.reason !== reason) throw new Error(`${path}: expected reason=${reason}, got ${resolved.reason}`);
  return resolved;
};

expect("/", true, "home");
expect("/selected", true, "selected");
expect("/selected/", true, "selected");
expect("/works", true, "works");
expect("/lab", true, "lab");
expect("/ecosystem", true, "ecosystem");

const collection = expect("/collections/human-editorial", true, "collection");
if (collection.entity.stableId !== "COLLECTION_01") throw new Error("collection resolution drift");
expect("/collections/not-authorized", false, null, "UNKNOWN_COLLECTION");

const s47Detail = expect("/works/lovetree/S47", true, "family-detail");
if (s47Detail.entity.stableId !== "S47") throw new Error("S47 detail identity drift");
const s47Experience = expect("/experience/lovetree/S47", true, "family-experience");
if (s47Experience.representative.representativeRuntimeId !== "S47_V4.2.5") throw new Error("S47 representative drift");
expect("/experience/lovetree/S46", false, null, "REPRESENTATIVE_RUNTIME_NOT_AUTHORIZED");
expect("/works/lovetree/UNKNOWN", false, null, "UNKNOWN_FAMILY");

const sasilroCase = expect("/ecosystem/sasilro", true, "ecosystem-case");
if (sasilroCase.entity.runtimes.length !== 2) throw new Error("SASILRO case must expose two runtime records");
const sasilroExperience = expect("/experience/ecosystem/sasilro", true, "ecosystem-experience");
if (sasilroExperience.entity.runtimes.map(item => item.stableId).join(",") !== "SASILRO_06_HERO,SASILRO_07_WORKSPACE") {
  throw new Error("SASILRO runtime order drift");
}
expect("/ecosystem/pending-slot", false, null, "UNKNOWN_ECOSYSTEM_CASE");
expect("/not-a-padiem-v5-route", false, null, "INVALID_ROUTE");

console.log("PADIEM_V5_ROUTE_TESTS=PASS");
