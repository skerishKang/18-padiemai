# PADIEM Chat Product Film Readiness v1

Status: **PRE-CAPTURE READY / MANUAL R2 WRITE CREDENTIAL PENDING / MEDIA NOT YET CAPTURED**

Tracks Issue #32 and Draft PR #33.

## Authority

- PADIEM production base at lane creation: `6755a78c691fb00003d7f278818716293e0f9738`
- Padiem Chat source authority audited at: `98f8b90ebacedddb4f1cceb9be057c72650a3b8e`
- Official public surface: `https://chat.padiem.net`
- Future canonical public object: `https://media.padiem.net/products/padiem-chat-product-film-v1.mp4`

Refresh both repository heads immediately before the actual capture/integration step. This document records readiness, not permission to assume that later runtime behavior is unchanged.

## Local capture readiness

The dedicated non-Git media workspace has been prepared with raw/edit/final/evidence stages.

Verified tooling:

- Chrome + Playwright available;
- ffmpeg and ffprobe available;
- Windows screen capture through ffmpeg is available;
- recording preset prepared for 1440×900, H.264, 30fps, muted output;
- no recording has been executed yet.

The final media contract remains approximately 40–60 seconds, muted, 1440×900 H.264 MP4.

## Public-surface preflight

A clean logged-out visit to `https://chat.padiem.net` returned HTTP 200 and rendered the Padiem Chat first viewport.

Publicly proven capture subjects at this preflight:

- Padiem Chat branded first viewport;
- New Chat control;
- main composer and message input;
- file/send affordances as visible UI only;
- Settings entry;
- logged-out/disabled login state.

Important live-surface constraint:

- theme controls were not independently proven as exposed in the clean logged-out state;
- a KR/EN switch was not proven as exposed in the clean logged-out state;
- Projects had no public persistence/auth proof;
- Search/Web Search/Deep Research were not proven as active public capabilities.

Therefore the actual capture must **not** force the earlier source-visible storyboard. Public truth wins. If theme or locale controls are not visibly available at capture time, omit those shots rather than staging them.

## No-fabrication boundary

Do not present any of the following as active unless the exact public surface proves them at capture time:

- Search;
- Web Search;
- Deep Research;
- Projects persistence;
- login/auth-backed history or saved outputs;
- a named Provider/model route;
- live multimodal execution;
- voice/STT/TTS;
- image generation;
- export capabilities not proven by the public runtime.

A clean film that primarily shows the real branded surface, New Chat and composer is acceptable. Feature-count symmetry is not a goal.

## R2 preflight and write-authority gate

The future target object was checked through the public custom domain and is currently absent (`404`).

Existing approved media objects remain publicly reachable and were not modified.

The production `padiem-media` bucket and its owning Cloudflare account have been positively identified. A separate Cloudflare account without R2 enabled was also identified and must remain untouched; R2 must not be enabled there merely to complete this task.

The currently authenticated Wrangler OAuth session can discover the existing bucket but does not carry the R2 write scope required for object upload. Therefore Wrangler account auth alone is not an approved write path for this lane.

The approved fallback is a **bucket-scoped R2 credential** with:

- permission: Object Read & Write;
- scope: `padiem-media` only;
- no all-bucket administrative scope unless Cloudflare proves the narrower scope is technically unavailable;
- secret material stored locally only and never committed, pasted into issues, or printed in reports.

No write test object is permitted. The first write, after CENTRAL approval and after the final film exists, must be the canonical object itself:

`products/padiem-chat-product-film-v1.mp4`

Current gate:

```text
R2_PRODUCTION_ACCOUNT = IDENTIFIED
PADIEM_MEDIA_BUCKET = FOUND
WRANGLER_DISCOVERY = PASS
WRANGLER_R2_WRITE_SCOPE = MISSING
R2_BUCKET_SCOPED_CREDENTIAL = REQUIRED
R2_CREDENTIAL_CREATION_PATH = MANUAL_DASHBOARD_LOGIN_REQUIRED
R2_WRITE_AUTHORITY = HOLD_PENDING_MANUAL_CREDENTIAL
TARGET_OBJECT = ABSENT
OVERWRITE_ALLOWED = NO
DELETE_ALLOWED = NO
TEST_OBJECT_ALLOWED = NO
WRONG_ACCOUNT_R2_ENABLE = FORBIDDEN
CLOUDFLARE_CONFIG_MUTATION = NO
```

Automated credential creation was not attempted beyond the authenticated boundary because the available browser session was not signed into Cloudflare and no owner credentials are available to CENTRAL/local automation. This is an intentional stop, not an implementation failure.

The owner must create the bucket-scoped credential interactively in the existing production R2 account. After it is created, do not upload a probe. Report only that the credential exists and is scoped correctly. Actual upload remains gated on the approved final master.

After the canonical object is eventually uploaded, require source/remote parity, HTTP 200, Range 206, Content-Range, cache and query-normalization acceptance before homepage wiring.

## Drive archive readiness

A dedicated private master archive folder for `PADIEM_CHAT_PRODUCT_FILM_V1` has been created under the existing PADIEM media archive authority, with four stages:

```text
00_RAW
01_EDIT
02_FINAL
03_EVIDENCE
```

Private Drive identifiers/paths are intentionally excluded from this public repository document.

## Homepage mutation boundary

Until an approved R2 object exists:

- do not change the Padiem Chat `media` field in `static/js/padiem-exhibit-registry-v1.js`;
- do not add Padiem Chat to the approved-object table in `docs/PADIEM_PUBLIC_MEDIA_LEDGER_V1.md`;
- keep StoryMemory media blank;
- keep AI Free Radar media blank;
- preserve LoveTree, DanjiOn and all Design media objects unchanged.

## Current disposition

```text
CAPTURE_TOOLING = READY
PUBLIC_SURFACE_PREFLIGHT = PASS
PRIVACY_BOUNDARY = LOCKED
FAKE_CAPABILITY_BOUNDARY = LOCKED
DRIVE_ARCHIVE = READY
TARGET_R2_OBJECT = ABSENT
R2_PRODUCTION_ACCOUNT = IDENTIFIED
R2_WRITE_CREDENTIAL = MANUAL_CREATION_PENDING
R2_WRITE_AUTHORITY = HOLD_PENDING_MANUAL_CREDENTIAL
RECORDING_EXECUTED = NO
R2_UPLOAD_EXECUTED = NO
HOMEPAGE_MEDIA_WIRED = NO
FINAL_DISPOSITION = PRE_CAPTURE_READY_MANUAL_R2_CREDENTIAL_PENDING
```
