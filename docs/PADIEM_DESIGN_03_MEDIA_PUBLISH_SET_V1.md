# PADIEM Design / 03 — Rotating Memory Index media publish set (V1)

Status: `SOURCE_AUTHORITY=CONFIRMED` · `NETWORK_LOADING_CONTRACT=MEASURED` · `R2_PUBLISH_SET=APPROVED_MINIMUM` · `BULK_CORPUS_MIRROR=DENIED`

Tracks Issue #46 (Design / 03 standalone) and Issue #47 / PR #48 (Drive authority + R2 publish-only policy).
This document records the read-only network-loading audit that #47 required before any large interactive
media set may be published, and fixes the publish set that follows from it.

## 1. Authority

```text
source/master authority : Google Drive `14_러브트리_로테이팅메모리인덱스_V1` (C14)
shared corpus authority : Google Drive `12_러브트리_리빙미디어스피어_인터랙티브대문_V1/assets/videos-v3` (C12)
code/contracts          : this repository
production publish layer: Cloudflare R2 behind `https://media.padiem.net/`
```

No Drive content is mirrored into R2 as a corpus. R2 carries only the objects the approved
production runtime actually addresses.

## 2. Measured runtime loading contract

Method: read-only inspection of the staged source package (`rotating-memory-index-source/`), no
network mutation, no upload, no rewrite of the original interaction code.

| Phase | Measured behaviour |
| --- | --- |
| First entry | `0` shared films requested. `4` featured films sit behind `preload="metadata"` (header atom only). |
| Index drawer | `89` poster stills requested with `loading="lazy"` — the browser fetches only what scrolls into view. |
| Index item click | Exactly `1` film requested, on demand, constructed at click time: `openMedia('video', src, …)`. |
| Featured override | Index `024 / 046 / 047 / 071` resolve to the work-owned featured films instead of the shared corpus. |

Conclusion: nothing in this work loads eagerly and nothing loads in bulk. A visitor who opens the
archive and plays one memory downloads one film, not 1.94 GB.

## 3. Approved publish set (minimum, 89 objects)

| Published key | Count | Ownership | Purpose |
| --- | ---: | --- | --- |
| `design/rotating-memory-index/memory-0NN-v1.mp4` | 4 | this work (C14) | featured films that the entry stage references |
| `shared/lovetree-v3/v3-NNN-v1.mp4` | 85 | shared C12 corpus | films the index addresses on click |

Source filenames stay untouched; the `-v1` suffix is applied when publishing, matching the
`-vN.mp4` rule the build already enforces for every other public media object.

The shared corpus is published **once**, under one shared namespace, and referenced by every work
that needs it. It is not duplicated into each work prefix.

## 4. Rules

1. **No wholesale mirror.** The Drive corpus is never copied to R2 as a whole; a publish set is the
   measured set of objects the approved runtime addresses, and nothing else.
2. **No per-work duplication.** Reused media lives in a shared namespace. Adding a second work that
   uses this corpus adds zero new objects.
3. **Immutable, versioned objects.** Published keys carry an explicit version (`-v1`) and are treated as
   frozen. `scripts/publish-rotating-memory-index-media-r2.mjs` refuses to overwrite an existing object;
   a re-cut is published under a new versioned key.
4. **Dry run first.** The publisher plans by default. `--apply` is the only mutating path and requires
   owner approval of the plan output.
5. **Git carries no media.** MP4 binaries stay out of Git; only the runtime, the contracts and the
   deterministic rewrite/publish scripts live here.
6. **No private paths in public output.** The build fails closed if a work-local path, the private C12
   path or a `videos-v3/` reference survives into the published HTML.

## 5. Still on HOLD

```text
C14_R2_BULK_UPLOAD      = DENIED (no corpus mirror exists or will be created)
C14_PRODUCTION_MERGE    = HOLD  (owner visual approval of the standalone route is outstanding)
DRIVE_AS_CDN            = DENIED (media.padiem.net remains the only video origin)
```

## 6. Verification

The deploy command is the whole gate, and the same command runs locally:

```bash
node scripts/build-cinematic-site.mjs \
  && node scripts/switch-living-media-r2.mjs \
  && node scripts/apply-living-media-padiem-attribution.mjs \
  && node scripts/verify-cinematic-build.mjs
```

`verify-cinematic-build.mjs` asserts that every route is regenerated (`/`, `/products/`, `/design/`,
`/design/rotating-memory-index/`, `/design/living-media-sphere/`), that the work resolves to both
public media origins with versioned keys, and that no private source path, MP4 binary or debug script
reaches the publish output. `node scripts/publish-rotating-memory-index-media-r2.mjs` prints the
approved publish set (4 + 85 = 89 objects) and mutates nothing.
