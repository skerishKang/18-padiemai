# PADIEM Design / 03 — Rotating Memory Index media publish set (V1)

Status: `SOURCE_AUTHORITY=CONFIRMED` · `NETWORK_LOADING_CONTRACT=MEASURED` · `CURRENT_R2_PUBLISH_SET=4` · `SHARED_85=DEFERRED`

Tracks Issue #46 and canonical storage policy Issue #47.

## 1. Authority

```text
source/master authority : Google Drive C14
shared corpus authority : Google Drive C12 / videos-v3
code/contracts          : GitHub
production publish layer: Cloudflare R2 / media.padiem.net
```

The governing rule is **publish only media explicitly approved for the current public release**.
A source/runtime reference is not, by itself, publication approval.

## 2. Measured runtime contract

The authored work contains four work-owned featured films and 85 shared C12 films reachable from the
Index. The audit confirmed:

- the four featured films are present in the visible authored stage and use `preload="metadata"`;
- the 85 shared films are interaction-lazy and are requested only when their Index item is clicked;
- the 89 poster stills can be published independently of those 85 films.

This proves that the shared corpus is not an eager bandwidth dependency. It does **not** authorize
publishing the whole shared corpus.

## 3. Current approved publish set

| Published key | Count | Status |
| --- | ---: | --- |
| `design/rotating-memory-index/memory-024-v1.mp4` | 1 | APPROVED CURRENT RELEASE |
| `design/rotating-memory-index/memory-046-v1.mp4` | 1 | APPROVED CURRENT RELEASE |
| `design/rotating-memory-index/memory-047-v1.mp4` | 1 | APPROVED CURRENT RELEASE |
| `design/rotating-memory-index/memory-071-v1.mp4` | 1 | APPROVED CURRENT RELEASE |
| `shared/lovetree-v3/v3-NNN-v1.mp4` | 85 | DEFERRED / NOT AUTHORIZED NOW |

Therefore:

```text
CURRENT_R2_PUBLISH_SET = 4
DEFERRED_SHARED_SET    = 85
R2_BULK_CORPUS_UPLOAD = DENIED
```

The 85 shared source/master films stay in Google Drive until the corresponding memories/content are
explicitly selected for public publication. When one is approved later, publish only that approved
object under the shared immutable namespace; do not duplicate it into a work-specific prefix.

## 4. Current public runtime behavior

The public RMI route keeps all 89 poster/index entries.

- featured indices 024 / 046 / 047 / 071 open their approved public videos;
- the other 85 entries open their poster/still preview and do **not** request an unpublished MP4;
- no `shared/lovetree-v3/` video URL is a current production dependency.

This avoids both broken 404 video requests and premature publication of the shared archive.

## 5. Safety rules

1. Drive remains the source/master archive.
2. Git contains no MP4 binaries.
3. R2 receives only explicitly approved current-release media.
4. Existing versioned R2 keys are immutable; conflicts stop publication.
5. `npm run media:plan` is dry-run only.
6. `npm run media:apply` may publish only the current 4-object plan and still requires owner approval.
7. Shared films are promoted from DEFERRED to APPROVED individually or by a later explicit release decision.

## 6. Verification

`npm run build:check` must prove:

- RMI and Living Media Sphere routes regenerate from source;
- all 89 posters exist;
- all four featured RMI URLs use versioned `media.padiem.net/design/rotating-memory-index/` keys;
- no `shared/lovetree-v3/` video URL is emitted by the current RMI runtime;
- deferred Index items use the poster fallback;
- no private Drive/local path, MP4 binary, or debug script reaches the publish output.

`npm run media:plan` must print exactly **4** current-release objects and perform zero mutation.
