# PADIEM Public Media Ledger v1

Purpose: integrity ledger for public PADIEM exhibit media delivered through `media.padiem.net`.

This ledger contains public object metadata only. Private archive locations, credentials, tokens, source IDs and unpublished media locators are intentionally excluded.

## Delivery authority

- Public media origin: `https://media.padiem.net`
- R2 bucket role: media origin only
- Public `r2.dev`: disabled
- Homepage origin: `https://padiem.net`
- Large MP4 files must not be committed to the homepage repository.
- Query-string cache busting is not an approved versioning mechanism.
- New public revisions use versioned object filenames (`-vN.mp4`).

## Approved Design objects

| Exhibit | Public object | Duration | Resolution | SHA-256 |
| --- | --- | ---: | --- | --- |
| OrbitMorph Portal | `https://media.padiem.net/design/orbitmorph-v1.mp4` | 17.8s | 1280×720 | `7fd66c69e34fe360086d1f5b7ba3d30a133a9f9b546db9c92584424f7c465f81` |
| Emotion Path Helix | `https://media.padiem.net/design/emotion-path-helix-v1.mp4` | 17.0s | 1280×720 | `fa2d0e49197b86ec7e7dc9f7eedf0729d30f646ab5752d161521fdd19f73b741` |
| Rotating Memory Index | `https://media.padiem.net/design/rotating-memory-index-v1.mp4` | 17.0s | 1280×720 | `6c78d811656f4fd2c68c960d9f6846114258b72f6978d169d2cf1de2a93f0a13` |
| Living Media Sphere | `https://media.padiem.net/design/living-media-sphere-v1.mp4` | 20.0s | 1280×720 | `42ae08e323eade2ccb3a1e8637937077a8f0ddfcd06501f318608a9eb0fed6fe` |

Accepted validation for all four:

- source ↔ remote byte parity: PASS
- public HTTP delivery: PASS
- Range request `206`: PASS
- CDN cache: PASS
- query-cache normalization: PASS

The combined Design reel is an archive/editorial convenience asset and is not part of the initial public R2 exhibit object set.

## Approved Product objects

| Product | Public object | Duration | Resolution | Public bytes | SHA-256 |
| --- | --- | ---: | --- | ---: | --- |
| LoveTree MVP01 walkthrough | `https://media.padiem.net/products/lovetree-mvp01-walkthrough-v1.mp4` | 58.04s | 1440×900 | 2,208,367 | `cd390fcc8374c762769a0915b9847c02d25d94d04e815ddb3d43081b0e6945eb` |
| DanjiOn product preview | `https://media.padiem.net/products/danjion-product-preview-v1.mp4` | 59.366667s | 1440×900 | 4,375,700 | `0b456e58903d25010dceae4dd754e735173a8493128b2740dd3cb06c1f8aee81` |

Accepted validation for both:

- source ↔ remote byte parity: PASS
- HTTP `200`: PASS
- Range `bytes=0-3` → `206`: PASS
- `Content-Range`: PASS
- CDN MISS → HIT: PASS
- query variants such as `?v=1` do not create an independent cache entry: PASS

## Current object inventory authority

Initial accepted public exhibit inventory = **6 objects**:

```text
design/orbitmorph-v1.mp4
design/emotion-path-helix-v1.mp4
design/rotating-memory-index-v1.mp4
design/living-media-sphere-v1.mp4
products/lovetree-mvp01-walkthrough-v1.mp4
products/danjion-product-preview-v1.mp4
```

The bootstrap cache probe was positively identified, deleted and purged. It is not an accepted public object.

## Products without approved video

The absence of a video is intentional for:

- Padiem Chat — public product footage not yet approved.
- StoryMemory — private preview / still changing.
- AI Free Radar — preparing.

Do not fill these slots with synthetic or fabricated product footage merely for visual symmetry.

## Replacement/versioning procedure

When an approved media file materially changes:

1. Do not overwrite the existing versioned object in place.
2. Produce the new final master and calculate SHA-256 before upload.
3. Upload to a new object name such as `-v2.mp4` using the remote R2 target.
4. Read the remote object back and verify byte parity.
5. Verify HTTP `200`, Range `206`, cache behavior and query normalization.
6. Update the exhibit registry to the new versioned URL.
7. Update this ledger with the new SHA-256 and metadata.
8. Run exact-head browser fallback and regression QA before production.
9. Retain or delete the old object only according to the media operations retention decision; never guess-delete unknown objects.

## Incident verification

If media corruption or unexpected content is suspected, compare the served/downloaded object SHA-256 with this ledger before changing homepage code.

A media mismatch is a media incident first; it is not by itself evidence that the PADIEM homepage source should be rolled back.

## Related authority

- `docs/PADIEM_MEDIA_R2_OPERATIONS_V1.md` — hosting/cost/fallback operations.
- `docs/PADIEM_EXHIBIT_MODES_OPERATIONS_V1.md` — CURRENT/ALBUM presentation switching and rollback.
- `static/js/padiem-exhibit-registry-v1.js` — runtime exhibit content/media registry after canonical integration.