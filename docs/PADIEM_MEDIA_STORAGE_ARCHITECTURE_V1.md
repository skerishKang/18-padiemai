# PADIEM Media Storage Architecture v1

Status: **CANONICAL STORAGE / PUBLISHING POLICY**  
Canonical tracking issue: **#47**  
Repository: `skerishKang/18-padiemai`

## 1. Purpose

This document fixes the storage and publication boundary for PADIEM Design/Product media so that future work does not drift toward copying every source/master asset into production storage.

The governing model is:

```text
Google Drive = source/master authority
GitHub       = code/contracts/ledger
Cloudflare R2 = approved production publish layer
Netlify      = padiem.net site/application surface
```

The key invariant is:

> **Archive broadly in Drive; publish selectively to R2.**

A work may contain many source assets. That does not mean every source asset belongs in R2.

## 2. Storage roles

### 2.1 Google Drive — source/master authority

Google Drive is the long-term authority and archive for large original assets, including:

- authored HTML/CSS/JS source packages;
- original images and posters;
- original/master MP4 files;
- shared media corpora used by multiple works;
- source-authority snapshots and supporting evidence.

Drive capacity should be used for preservation. Large source/master media does not need to be duplicated into R2 merely because a work is being published.

Drive is **not** the primary production CDN for browser `<video>` delivery under this architecture.

### 2.2 GitHub — code and operating contracts

GitHub stores:

- application/site source;
- deterministic media-path rewrite scripts;
- operations contracts;
- public media ledger/checksums;
- source/visual authority metadata appropriate for the repository.

Large MP4 masters must not be committed to this repository.

### 2.3 Cloudflare R2 — production publish layer

R2 is the production origin for media intentionally exposed through `media.padiem.net`.

R2 should contain only assets that have a concrete production purpose, such as:

- approved public exhibit/reel videos;
- media required by a production interactive work;
- shared public media that is reused by multiple production works and is worth publishing once.

R2 is **not** a mirror of Google Drive and is **not** a full source archive.

### 2.4 Netlify — site/application surface

`padiem.net` remains the public site/application surface. Media-origin failure must not take down page rendering or navigation.

## 3. Publish-set rule

Before adding a large source package to R2, determine the **minimum production publish set**.

For each candidate asset, answer:

1. Is this object requested by the production runtime?
2. When is it requested: initial load, near-viewport, interaction, or explicit viewer open?
3. Is the entire object transferred, or only metadata/Range bytes?
4. Is the same media already published under an immutable shared object?
5. Is this asset merely a source/master archive object that can remain in Drive?

Only assets with an affirmative production need should be published to R2.

## 4. Network-loading audit gate

Interactive works with large media sets must receive a read-only browser/network audit before bulk upload.

Record at minimum:

```text
INITIAL_MEDIA_REQUEST_COUNT=
INITIAL_MEDIA_BYTES=
LAZY_MEDIA_REQUEST_COUNT=
RANGE_REQUEST_BEHAVIOR=
POSTER_REQUEST_BEHAVIOR=
FEATURED_MEDIA_REQUEST_BEHAVIOR=
SHARED_MEDIA_REQUEST_BEHAVIOR=
MINIMUM_PUBLISH_SET=
```

Do not infer the publish set from the number of files referenced in source alone.

A source may reference 100 files while requesting only a small subset during normal use. Conversely, eager preload behavior may make many referenced assets real production dependencies. The browser/network contract decides.

## 5. Shared-media rule

When multiple works use byte-identical public media, do not create work-specific duplicates by default.

Preferred model:

```text
media.padiem.net/
  design/...
  products/...
  shared/...
```

A shared namespace must be introduced only after source lineage and checksum identity are established.

Before publishing to an existing key:

```text
same key + same SHA-256      => SKIP_IDENTICAL
same key + different SHA-256 => STOP_CONFLICT
```

Unknown existing objects must never be overwritten or deleted by assumption.

## 6. Immutability and versioning

Public objects use versioned filenames such as `-v1.mp4`, `-v2.mp4`.

Once published and referenced by production, a versioned object is treated as immutable.

A material change requires a new object name, checksum, ledger entry, public readback validation, and runtime update.

Query-string cache busting is not a substitute for object versioning.

## 7. Public-delivery contract

Approved R2 media must continue to satisfy the existing media operations contract:

- public origin: `https://media.padiem.net`;
- public `*.r2.dev` exposure disabled;
- HTTP delivery succeeds;
- browser Range requests work correctly;
- CDN caching is enabled and query variants do not fragment the intended cache key;
- normal video loading/playback is non-fatal to the homepage/application;
- emergency media blocking must leave `padiem.net` usable.

See `docs/PADIEM_MEDIA_R2_OPERATIONS_V1.md` for the detailed delivery/safety gate.

## 8. Current accepted R2 model

The current public media ledger contains six accepted public objects:

```text
design/orbitmorph-v1.mp4
design/emotion-path-helix-v1.mp4
design/rotating-memory-index-v1.mp4
design/living-media-sphere-v1.mp4
products/lovetree-mvp01-walkthrough-v1.mp4
products/danjion-product-preview-v1.mp4
```

These objects represent the intended **publish-layer** model: approved public media only, not a mirror of all source/master assets.

Their checksum and delivery validation authority remains `docs/PADIEM_PUBLIC_MEDIA_LEDGER_V1.md`.

## 9. C14 Rotating Memory Index decision

C14 (`Rotating Memory Index`) is the first explicit application of this policy to a large interactive source package.

Confirmed local staging facts:

```text
C14_SOURCE_COMPLETE=true
POSTER_COUNT=89
FEATURED_VIDEO_COUNT=4
C12_SHARED_EXPECTED=85
C12_SHARED_FOUND=85
C12_SHARED_MISSING=0
SHARED_VIDEO_TOTAL_BYTES=1941541194
BROWSER_SMOKE=PASS
```

The source package references 85 C12 shared videos in addition to four featured local videos.

**Decision:** do not bulk-upload the 85 shared videos merely because the HTML references them.

The C14 gate is now:

1. preserve the confirmed source/staging package unchanged;
2. perform a read-only network-loading audit;
3. determine the minimum production publish set;
4. decide whether any shared namespace is justified;
5. only then restore/repair R2 authentication if R2 publication is required;
6. publish only approved objects after key/SHA conflict checks;
7. apply deterministic runtime path rewriting without changing the authored interaction/design contract;
8. use Draft PR + Netlify Preview + owner visual approval before production.

Until steps 1–4 are complete:

```text
C14_R2_BULK_UPLOAD=HOLD
C14_RUNTIME_REWRITE=HOLD
C14_PRODUCTION_MERGE=HOLD
```

## 10. Cost/capacity policy

Cloud storage free tiers and prices may change and are not architectural authority.

The durable policy is therefore not “fit everything under a specific free quota.” It is:

- keep masters in the designated archive authority;
- avoid production duplication;
- publish the minimum runtime-required set;
- reuse checksum-identical shared objects;
- review R2 storage/operations regularly;
- treat budget alerts as advisory rather than a hard-stop guarantee.

Any move to Oracle, B2, another object store, or another CDN requires a separate documented migration decision. It does not happen implicitly because one work has a large source package.

## 11. Change control

Changes to any of the following require an issue/PR that explicitly updates this document or its successor:

- Drive authority role;
- R2 publish-only role;
- use of Google Drive as a production media origin;
- shared-media namespace rules;
- immutable object/versioning rules;
- large-media GitHub policy;
- production media provider.

A single artwork implementation must not silently redefine global media architecture.

## 12. Related authority

- Issue #47 — canonical storage architecture tracking issue.
- Issue #46 — C14 Rotating Memory Index standalone publication work.
- `docs/PADIEM_MEDIA_R2_OPERATIONS_V1.md` — R2 delivery, safety, cache, Range, billing, fallback operations.
- `docs/PADIEM_PUBLIC_MEDIA_LEDGER_V1.md` — accepted public object inventory and checksums.
- `static/js/padiem-exhibit-registry-v1.js` — current runtime media registry.

## 13. Short operator rule

When uncertain, use this order:

```text
SOURCE/MASTER?       -> Google Drive
CODE/CONTRACT/LEDGER? -> GitHub
PUBLIC RUNTIME MEDIA? -> Cloudflare R2
NOT YET PROVEN NEEDED? -> DO NOT PUBLISH YET
```
