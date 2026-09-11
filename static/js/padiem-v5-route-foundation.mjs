const MANIFEST_FILES = Object.freeze({
  families: "/data/padiem-v5/family-manifest.json",
  representatives: "/data/padiem-v5/representative-runtime-manifest.json",
  collections: "/data/padiem-v5/collection-membership-manifest.json",
  ecosystem: "/data/padiem-v5/ecosystem-case-manifest.json",
});

const STATIC_ROUTES = new Map([
  ["/selected", "selected"],
  ["/works", "works"],
  ["/lab", "lab"],
  ["/ecosystem", "ecosystem"],
]);

const normalizePath = (pathname) => {
  const raw = typeof pathname === "string" && pathname ? pathname : "/";
  if (raw === "/") return "/";
  return `/${raw.split("/").filter(Boolean).join("/")}`;
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

export function matchPadiemV5Route(pathname) {
  const path = normalizePath(pathname);
  if (path === "/") return { kind: "home", path };

  const staticKind = STATIC_ROUTES.get(path);
  if (staticKind) return { kind: staticKind, path };

  let match = path.match(/^\/collections\/([^/]+)$/);
  if (match) {
    const collectionId = safeDecode(match[1]);
    return collectionId ? { kind: "collection", path, collectionId } : { kind: "invalid", path };
  }

  match = path.match(/^\/works\/lovetree\/([^/]+)$/);
  if (match) {
    const familyId = safeDecode(match[1]);
    return familyId ? { kind: "family-detail", path, familyId: familyId.toUpperCase() } : { kind: "invalid", path };
  }

  match = path.match(/^\/experience\/lovetree\/([^/]+)$/);
  if (match) {
    const familyId = safeDecode(match[1]);
    return familyId ? { kind: "family-experience", path, familyId: familyId.toUpperCase() } : { kind: "invalid", path };
  }

  match = path.match(/^\/ecosystem\/([^/]+)$/);
  if (match) {
    const caseId = safeDecode(match[1]);
    return caseId ? { kind: "ecosystem-case", path, caseId: caseId.toLowerCase() } : { kind: "invalid", path };
  }

  match = path.match(/^\/experience\/ecosystem\/([^/]+)$/);
  if (match) {
    const caseId = safeDecode(match[1]);
    return caseId ? { kind: "ecosystem-experience", path, caseId: caseId.toLowerCase() } : { kind: "invalid", path };
  }

  return { kind: "invalid", path };
}

export function resolvePadiemV5Route(match, manifests) {
  if (!match || match.kind === "invalid") return { ok: false, reason: "INVALID_ROUTE" };
  if (["home","selected","works","lab","ecosystem"].includes(match.kind)) {
    return { ok: true, kind: match.kind, path: match.path, entity: null };
  }

  if (match.kind === "collection") {
    const entity = manifests.collections.collections.find(item => item.routeEnabled && item.routeId === match.collectionId);
    return entity ? { ok: true, kind: match.kind, path: match.path, entity } : { ok: false, reason: "UNKNOWN_COLLECTION" };
  }

  if (match.kind === "family-detail" || match.kind === "family-experience") {
    const family = manifests.families.records.find(item => item.routeEnabled && item.stableId === match.familyId);
    if (!family) return { ok: false, reason: "UNKNOWN_FAMILY" };

    if (match.kind === "family-detail") {
      return { ok: true, kind: match.kind, path: match.path, entity: family };
    }

    const representative = manifests.representatives.records.find(
      item => item.routeEnabled && item.familyId === family.stableId
    );
    return representative
      ? { ok: true, kind: match.kind, path: match.path, entity: family, representative }
      : { ok: false, reason: "REPRESENTATIVE_RUNTIME_NOT_AUTHORIZED" };
  }

  if (match.kind === "ecosystem-case" || match.kind === "ecosystem-experience") {
    const entity = manifests.ecosystem.cases.find(item => item.routeEnabled && item.routeId === match.caseId);
    return entity ? { ok: true, kind: match.kind, path: match.path, entity } : { ok: false, reason: "UNKNOWN_ECOSYSTEM_CASE" };
  }

  return { ok: false, reason: "UNSUPPORTED_ROUTE" };
}

export async function loadPadiemV5Manifests(fetchImpl = fetch) {
  const entries = await Promise.all(Object.entries(MANIFEST_FILES).map(async ([key, url]) => {
    const response = await fetchImpl(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Manifest load failed: ${url} (${response.status})`);
    return [key, await response.json()];
  }));
  return Object.fromEntries(entries);
}

async function bootBrowserRouteFoundation() {
  const root = document.querySelector("[data-padiem-v5-route-root]");
  if (!root) return;

  const match = matchPadiemV5Route(window.location.pathname);
  const manifests = await loadPadiemV5Manifests(window.fetch.bind(window));
  const resolved = resolvePadiemV5Route(match, manifests);

  if (!resolved.ok) {
    window.location.replace("/404.html");
    return;
  }

  document.documentElement.dataset.padiemV5RouteReady = "true";
  root.dataset.routeKind = resolved.kind;
  root.dataset.routePath = resolved.path;
  const status = root.querySelector("[data-route-status]");
  if (status) status.textContent = "Route foundation ready.";

  window.PADIEM_V5_ROUTE_CONTEXT = Object.freeze(resolved);
  window.dispatchEvent(new CustomEvent("padiem:v5-route-ready", { detail: resolved }));
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  bootBrowserRouteFoundation().catch(() => {
    window.location.replace("/404.html");
  });
}
