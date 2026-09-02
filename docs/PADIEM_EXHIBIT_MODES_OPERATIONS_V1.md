# PADIEM Exhibit Modes Operations v1

Status: staging above PR #28. This document becomes authoritative only when the accepted hardening is absorbed into the canonical exhibit PR/main.

## 1. Purpose

PADIEM keeps two independent public presentation modes for Products and Design.

- `CURRENT` = the previously accepted cinematic / scroll-scrub presentation.
- `ALBUM` = the new non-scroll collection presentation.

The operational requirement is **reversibility, not replacement**. CURRENT source scenes and their renderers must not be deleted merely because ALBUM becomes the default.

## 2. Mode authority

Runtime authority lives in:

`static/js/padiem-exhibit-config-v1.js`

Expected shape:

```js
modes: {
  products: 'album',
  design: 'album',
}
```

To restore the accepted previous presentation, change only the desired world:

```js
modes: {
  products: 'current',
  design: 'current',
}
```

Products and Design are intentionally independent. Mixed operation is allowed.

Do not restore a mode by deleting the other renderer or reconstructing old markup.

## 3. Exact comparison overrides

The public build supports explicit QA overrides without changing source authority:

- `?exhibit=album`
- `?exhibit=current`

Internal comparison controls appear only with `?exhibitControls=1`.

## 4. Renderer isolation

When ALBUM is active:

- legacy scroll-scrub background must not start;
- CURRENT Design interaction runtime must return before mounting hidden studies;
- CURRENT Products interaction runtime must return before mounting hidden studies;
- hidden CURRENT infinite animation loops must not continue in the background.

When CURRENT is active, existing CURRENT behavior remains the accepted path and ALBUM must not overlay it.

## 5. Media registry authority

Content/media authority lives in `static/js/padiem-exhibit-registry-v1.js`.

Approved media origin: `https://media.padiem.net`.

Direct `r2.dev` and infrastructure-style deployment URLs such as `workers.dev` are forbidden on the public exhibit surface. Media filenames must be versioned (`-vN.mp4`) and must not use query-string cache busting.

Current accepted R2 media objects:

### Design
1. `https://media.padiem.net/design/orbitmorph-v1.mp4`
2. `https://media.padiem.net/design/emotion-path-helix-v1.mp4`
3. `https://media.padiem.net/design/rotating-memory-index-v1.mp4`
4. `https://media.padiem.net/design/living-media-sphere-v1.mp4`

### Products
1. `https://media.padiem.net/products/lovetree-mvp01-walkthrough-v1.mp4`
2. `https://media.padiem.net/products/danjion-product-preview-v1.mp4`

Products without approved real footage must remain static/fallback rather than receiving synthetic video.

## 6. CTA authority

Currently approved public product CTA:

- Padiem Chat → `https://chat.padiem.net`

Do not expose raw Workers, preview, local, or infrastructure URLs as official product CTAs.

## 7. Failure behavior

R2 media is enhancement, not page authority.

If `media.padiem.net` fails or is blocked, Products and Design must remain usable with selector/navigation and first-party static/typographic fallback. A failed media URL should enter terminal fallback for the current page session rather than repeatedly re-requesting the same broken object.

Reduced-motion users should not depend on video for meaning. If `IntersectionObserver` is unavailable, prefer static fallback instead of eager-loading external films.

## 8. Design collection authority

1. OrbitMorph Portal
2. Emotion Path Helix
3. Rotating Memory Index
4. Living Media Sphere

Rotating Memory Index must be described around the **right-side index / card transformation** interaction.

## 9. Product collection authority

1. Padiem Chat
2. StoryMemory
3. LoveTree
4. DanjiOn
5. AI Free Radar

Real public footage currently exists only for LoveTree and DanjiOn.

## 10. Acceptance matrix

For desktop and mobile verify:

- ALBUM render
- direct sleeve click/tap selection
- drag/swipe selection
- ArrowLeft / ArrowRight
- correct media mapping
- LoveTree and DanjiOn playback
- all four Design films
- no fake media on no-video products
- media failure fallback
- KO/EN
- Company drawer
- main navigation
- Home regression
- console fatal errors = 0

Direct sleeve click/tap is mandatory. Pointer capture must not retarget a normal sleeve click away from `.px-album-sleeve`.

Then verify reversibility with `?exhibit=current` and `?exhibit=album`.

## 11. Production rollback procedure

If ALBUM has a production defect but the site itself is healthy:

1. Do not delete ALBUM code or R2 objects.
2. Change only the affected `modes.<world>` value from `album` to `current`.
3. Build and exact-head preview.
4. Confirm the affected world is CURRENT and the other world is unchanged.
5. Deploy through the normal reviewed Netlify path.
6. Keep ALBUM for repair and later reactivation.

## 12. Pull request lineage

- PR #28 = canonical Album/Collection presentation integration candidate.
- PR #29 = staging hardening above PR #28; its accepted runtime changes are absorbed into #28, not main directly.
- PR #25 = earlier Design video runtime; safety logic may be absorbed, then superseded.
- PR #27 = accepted LoveTree footage lineage; R2 media is already canonical, only unique useful UX such as chapter seek should be evaluated before superseding.

## 13. Non-negotiable preservation rule

**CURRENT must remain recoverable without recreating deleted source.**

ALBUM may become the default, but it does not erase the previously accepted presentation.
