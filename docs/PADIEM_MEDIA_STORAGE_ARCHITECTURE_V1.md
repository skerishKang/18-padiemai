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
same key + same SHA-256       => SKIP_IDENTICAL
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

Confirmed staging facts:

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

### 9.1 Empirical browser Network audit

The read-only browser audit completed with `C14_NETWORK_AUDIT=PASS` and no source/Git/R2/Netlify/production mutation.

Observed behavior:

```text
INITIAL_VIDEO_REQUEST_COUNT=4
INITIAL_FEATURED_VIDEO_REQUEST_COUNT=4
INITIAL_SHARED_VIDEO_REQUEST_COUNT=0
INITIAL_VIDEO_TRANSFER_BYTES=976952
INITIAL_POSTER_REQUEST_COUNT=45
DRAWER_OPEN_SHARED_VIDEO_REQUEST_COUNT=0

CLICK_001_VIDEO_REQUEST_COUNT=1
CLICK_001_STATUS=404
CLICK_001_RANGE=bytes=0-

CLICK_058_VIDEO_REQUEST_COUNT=1
CLICK_058_STATUS=404
CLICK_058_RANGE=bytes=0-

FEATURED_CLICK_STATUS=206
FEATURED_PRELOAD_BEHAVIOR=4 featured videos preload metadata on initial load
VIEWER_CLOSE_TRANSFER_BEHAVIOR=no additional media request; viewer media removed

MOBILE_INITIAL_SHARED_VIDEO_REQUEST_COUNT=0
MOBILE_CLICK_SHARED_VIDEO_REQUEST_COUNT=1
FULL_89_INDEX_CAPABILITY_REQUIRES_ALL_VIDEO_URLS=YES
```

The two shared-video `404` responses are expected in local staging because the original relative C12 corpus path is not served there. They prove that the shared video URL is requested only after the corresponding Index item is activated.

### 9.2 Publish-set conclusion

The Network audit establishes two different facts that must not be conflated:

1. **Initial bandwidth dependency:** only the four featured videos are requested initially, via `preload="metadata"`; the 85 C12 shared videos are not eager-loaded.
2. **Full functional dependency:** the authored 89-item Index can open every item, so all 85 non-featured shared video URLs must remain publicly resolvable for full-fidelity standalone publication.

Therefore the minimum video publish set for full-fidelity C14 is:

```text
FEATURED_C14_VIDEO_OBJECTS=4
SHARED_C12_VIDEO_OBJECTS=85
TOTAL_VIDEO_OBJECTS_REQUIRED=89
```

This does **not** mean 1.94 GB is transferred at page load. The 85 shared videos are interaction-lazy.

### 9.3 Required object topology

The 85 C12 videos must be published once as a shared LoveTree corpus, not duplicated inside the C14 artwork namespace.

Approved target topology:

```text
https://media.padiem.net/shared/lovetree/videos-v3/v3-001-v1.mp4
...
https://media.padiem.net/shared/lovetree/videos-v3/v3-089-v1.mp4
```

The four C14-local featured overrides remain artwork-specific:

```text
https://media.padiem.net/design/rotating-memory-index/memory-024-v1.mp4
https://media.padiem.net/design/rotating-memory-index/memory-046-v1.mp4
https://media.padiem.net/design/rotating-memory-index/memory-047-v1.mp4
https://media.padiem.net/design/rotating-memory-index/memory-071-v1.mp4
```

The shared set excludes `024`, `046`, `047`, and `071`, because those four indices are intentionally overridden by C14-local featured videos.

Poster/image assets may remain with the Netlify-served artwork package unless a separate size/performance audit proves that moving them to R2 is necessary. This policy does not move small authored static assets to R2 by default.

### 9.4 C14 execution gate after audit

The previous `BULK_UPLOAD_BEFORE_NETWORK_AUDIT=HOLD` has been satisfied. The next gate is now R2 authentication and collision-safe publication of the approved 89-object video set.

Before any upload:

```text
R2_AUTH=PASS
BUCKET=padiem-media
KEY_COLLISION_SCAN=PASS
SAME_KEY_SAME_SHA=SKIP_IDENTICAL
SAME_KEY_DIFFERENT_SHA=STOP_CONFLICT
DELETE=FORBIDDEN
OVERWRITE_UNKNOWN=FORBIDDEN
```

After publication, verify at minimum:

- local ↔ remote checksum parity;
- public HTTP 200/206 behavior;
- representative shared objects `001`, `058`, `089`;
- all four featured objects;
- runtime click-through for a shared and featured Index item;
- no eager shared-video loading introduced by the URL rewrite.

Only after these checks may the deterministic runtime rewrite and Draft Preview proceed.

Current disposition:

```text
C14_NETWORK_AUDIT=PASS
C14_PUBLISH_SET_DECISION=PASS
C14_R2_AUTH=BLOCKED_UNTIL_VALID_TOKEN
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
SOURCE/MASTER?        -> Google Drive
CODE/CONTRACT/LEDGER? -> GitHub
PUBLIC RUNTIME MEDIA? -> Cloudflare R2
NOT YET PROVEN NEEDED? -> DO NOT PUBLISH YET
```
