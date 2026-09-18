# PADIEM Website

`18-padiemai` is the source repository for the public `padiem.net` website.

## Current production path

This project is **not** a Hugo/PaperMod site in the active deployment path.

Netlify builds the cinematic site with:

```toml
[build]
  publish = "public"
  command = "node scripts/build-cinematic-site.mjs && node scripts/switch-living-media-r2.mjs && node scripts/apply-living-media-padiem-attribution.mjs && node scripts/verify-cinematic-build.mjs"
```

Primary source/publish relationship:

```text
static/html/index1.html                -> public/index.html
static/html/pages/products.html        -> public/products/index.html
static/html/pages/design.html          -> public/design/index.html
static/design/living-media-sphere/**    -> public/design/living-media-sphere/**
rotating-memory-index-source/**         -> public/design/rotating-memory-index/**
static/css/**                          -> public/css/**
static/js/**                           -> public/js/**
static/images/**                       -> public/images/**
```

`static/html/**` is a source tree. It is **not** copied wholesale into `public/html/**`; this prevents legacy page shells from surviving in a deployment. `public/` is generated output and is not source authority.

Local repository gates:

```bash
npm run build:check
npm run smoke:exhibits
npm run smoke:runtime
npm run media:plan
```


Exhibit scenes mount by a stable identifier (`data-exhibit` on `.world-media-frame`), never by
document order or page title. Keep the source markup, the runtime scene tables and the exhibit
registry in sync with:

```bash
node scripts/smoke-exhibit-runtime.mjs
```

## Shared browser runtime

`static/js/padiem-runtime-v1.js` loads first on every page and owns the two things runtimes must
not implement themselves:

```text
PADIEM_RUNTIME.storage    safe preference storage (language, font choice)
PADIEM_RUNTIME.frameLoop  animation scheduling that is gated by visibility and motion preference
```

Rules:

- No site runtime reads `localStorage` directly. Private browsing, blocked site data and embedded
  webviews make storage access throw; the adapter keeps values in memory for the session so
  navigation and language state keep working.
- Per-frame work only runs while it can be seen: the loop pauses when the tab is hidden, when the
  scene leaves the viewport and when the visitor prefers reduced motion. Hidden scenes perform no
  per-frame DOM work (issue #56).

The `KO / EN` control broadcasts `padiem:language` on `document`. Runtimes that mount their own copy
re-apply it from that event (and from `document.body.dataset.lang` at mount time) instead of
reading the locale themselves.

Documented copy behavior:

```text
Homepage / Products / Design chrome        KO + EN, swapped by the page runtime
data-copy-ko / data-copy-en pairs          follow the active language, no page reload
Live exhibit scene labels (shelf books)    KO + EN via data-copy pairs
Exhibit scene meta, HUD and aria-labels    English art direction, intentionally not translated
Product exhibit narrative copy             KO-first narrative; EN strings are an owner/design
                                           decision, tracked rather than invented at runtime
```

Verify the runtime contract with:

```bash
node scripts/smoke-runtime-resilience.mjs
```

## Public media

Approved origins:

```text
https://media.padiem.net     every public film and still (Cloudflare R2 behind the CDN)
https://padiem.net           the site itself
https://chat.padiem.net      the product entry link
```

Who owns what:

```text
static/js/padiem-media-v1.js            high-churn page-level films + failure copy
static/js/padiem-exhibit-registry-v1.js Design / Product exhibit media (the authority)
```

Rules:

- A runtime never defines its own public media URL: it reads `PADIEM_MEDIA` (or the exhibit
  registry for exhibit items). One canonical definition per film — a media move is one file.
- A film that cannot play must stay usable and observable: the still frame remains, the container
  records `data-media-state` (`loading` / `ready` / `error`), and a `role="status"`
  `aria-live="polite"` line shows the shared copy in the active language. Failure is never silent.
- Do not set `crossOrigin` on first-party films. The media origin does not send CORS headers and
  nothing reads pixels from the video, so requesting it anonymously only blocks playback.

Verify the media contract with:

```bash
node scripts/smoke-media-urls.mjs
```

It exercises the adapter in a sandbox with throwing/missing storage, a hidden tab, an off-screen
element and reduced motion, then sweeps the source for direct `localStorage` access, ungated
animation loops and incomplete copy pairs.

## PADIEM public information architecture

The site intentionally uses different navigation grammars for different kinds of content.

```text
HOME SCROLL NARRATIVE
Hero -> Solutions -> Evolution

PRIMARY CINEMATIC DESTINATIONS
Products -> /products/
Design   -> /design/

SIDE INFORMATION DRAWER
Company -> Company / Team / Contact

EXTERNAL PRODUCT ENTRY
Padiem Chat -> https://chat.padiem.net
```

Core rule for Products and Design:

```text
route changed
world did not change
```

They are independent URLs, but they must stay inside the same visual world as the PADIEM first screen.

Recommended global navigation:

```text
PADIEM   Solutions   Evolution   Products   Design   Company      KO / EN   [Padiem Chat]
```

The PADIEM logo is the Home control.

## Visual authority

The current cinematic first screen is the primary public visual authority.

Implementation/design contract:

```text
docs/PADIEM_VISUAL_GRAMMAR_V1.md
```

Guiding issue:

```text
GitHub Issue #10
PADIEM homepage identity system — product, design, and company character alignment
```

Do not introduce a new generic AI/SaaS template merely because a new page is added.

Canonical visual language includes:

- dark navy-black / graphite field;
- pearl/frosted glass;
- white/silver editorial typography;
- restrained PADIEM blue and warm-gold signals;
- large negative space;
- thin technical rules and mono notation;
- cinematic media composition;
- restrained motion;
- content/interaction structure before decorative UI chrome.

## Primary public content

### Products

Current public product set:

- Padiem Chat
- StoryMemory
- LoveTree
- 단지온

Padiem Chat is the approved live external CTA:

```text
https://chat.padiem.net
```

Do not restore the Workers origin URL as a public homepage CTA.

### Design

The Design world is an interaction-structure archive, not a generic agency portfolio.

Current archive candidates include:

- 사람별 기억책장
- LP 플레이어
- 메모리테이프
- 인피니트 비디오월
- 3D 기억책장
- 로테이팅 메모리 인덱스
- 모먼트 리빌

## Design evidence policy

Before major visual changes, review the relevant PADIEM / Padiem Chat / StoryMemory / LoveTree evidence in Google Drive and record what was actually used.

Do not expose private Drive paths, local paths, credentials, raw internal task IDs, or unfinished source URLs in the public site.

## Media policy

Product/design media should come from an approved streaming/publication source such as YouTube or another approved host.

Do not commit large MP4/MOV/WebM binaries unless explicitly approved.

When public media does not exist, use a designed safe placeholder rather than inventing an external product URL.

## Deployment

```text
GitHub push
-> Netlify build
-> public/
-> padiem.net
```

Production changes require preview/build verification before merge.

## Legacy cleanup

The earlier Hugo/PaperMod experiment is archival only.

Do not restore these as homepage authority:

```text
config.toml
content/
themes/
.hugo_build.lock
.gitmodules
```

Do not use the legacy `PadiemAI` blue header, generic card-wall layout, or old standalone About/Contact template as forward design authority.

## Source-of-truth policy

- GitHub = durable code ledger and public-site implementation authority.
- Google Drive = design/media evidence authority where applicable.
- `ai-revenue-lab` = PADIEM product/source authority for actual products and shared technology boundaries.
- `static/html/index1.html` = canonical home source.
- `public/` = generated Netlify publish output.
- Issue #10 + `docs/PADIEM_VISUAL_GRAMMAR_V1.md` = current homepage identity/design contract.
