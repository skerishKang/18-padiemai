# PADIEM Chat Product Film Capture Contract v1

Purpose: lock the source/runtime and privacy boundary for the Padiem Chat product film tracked by Issue #32.

## Authority snapshot

- PADIEM homepage repository: `skerishKang/18-padiemai`
- PADIEM homepage base at contract creation: `6755a78c691fb00003d7f278818716293e0f9738`
- Padiem Chat source repository: `skerishKang/ai-revenue-lab`
- Padiem Chat source main at contract creation: `98f8b90ebacedddb4f1cceb9be057c72650a3b8e`
- Product source boundary: `apps/padiem-chat/**`
- Official branded public surface: `https://chat.padiem.net`
- Canonical future media object: `https://media.padiem.net/products/padiem-chat-product-film-v1.mp4`

The exact Padiem Chat source main must be refreshed immediately before recording. If source or public-surface behavior changes materially, report the new SHA before capture rather than silently using this snapshot.

## Runtime truth

The current Padiem Chat README states that Provider/model assignment remains deferred and the Cloudflare Worker package defaults to `PADIEM_CHAT_RUNTIME_MODE=mock` unless separately configured. A deployed public UI is therefore not evidence that a specific live Provider/model route, persistence feature, or multimodal capability is active.

The film must not imply or claim capabilities that are not visibly proven on the exact public surface at capture time.

## Source-visible UI truth

At the authority snapshot, the source UI exposes safe film subjects including:

- Padiem Chat brand/home surface;
- New Chat control;
- recommended prompts / starter cards;
- the main conversation/composer surface;
- file control as a visible UI affordance, without implying unsupported execution;
- Settings dialog;
- themes: Padiem Home / Light / Dark / Cinematic;
- language controls KR / EN;
- Padiem Home external brand link.

The source also visibly marks or disables several capabilities:

- Search: `준비 중` / disabled;
- Projects: `로그인 후` / disabled until actual auth/persistence is provisioned;
- Web Search: `준비 중` / disabled;
- Deep Research: unavailable / disabled;
- Login: disabled when auth is not configured.

These must not be staged as working features merely for the film.

## Recording story

Target length: approximately 40–60 seconds.

Preferred sequence:

1. Open the real public Padiem Chat surface in a clean/sanitized browser state.
2. Hold briefly on the main first viewport so the composer and product identity are readable.
3. Use New Chat or a safe recommended-prompt interaction only if the public surface behaves deterministically without private data.
4. Show the composer and real navigation affordances without presenting disabled features as active.
5. Open Settings and demonstrate one or two real theme transitions.
6. Demonstrate KR → EN → KR.
7. Return to the main composer/conversation state and end on a clean product frame.

Do not force every step if the public surface differs at capture time. Public truth beats the storyboard.

## Privacy and safety

The recording must contain none of the following:

- personal conversations or user history;
- personal account name, email, avatar or account identifiers;
- private project names/instructions/files;
- API keys, secrets, tokens, cookies or auth values;
- provider/model routing details;
- internal fixture/source/database identifiers;
- local paths or private Drive paths;
- browser developer tools;
- Workers/Pages/origin infrastructure URLs;
- fabricated model names, latency, benchmark or cost claims.

Prefer logged-out or sanitized state.

## Master/export contract

Preferred accepted master:

- MP4 / H.264;
- 1440×900;
- muted;
- approximately 40–60 seconds;
- no unnecessary cursor movement or long dead time;
- readable at PADIEM Products Album stage size.

Record and report:

- exact source URL used;
- capture timestamp;
- source authority SHA;
- duration;
- resolution;
- byte size;
- SHA-256.

## R2 contract

Target object:

`products/padiem-chat-product-film-v1.mp4`

Public target:

`https://media.padiem.net/products/padiem-chat-product-film-v1.mp4`

Do not commit the MP4 into GitHub or Netlify.

Before the homepage registry is wired, acceptance requires:

- upload success;
- source/remote parity;
- HTTP 200;
- Range request 206;
- valid Content-Range;
- CDN cache behavior accepted under the existing R2 operations contract;
- query-string normalization guard preserved;
- no unintended extra public objects.

## Homepage integration boundary

Only after the media object passes acceptance should the PADIEM homepage branch add the media URL to the `padiem-chat` entry in `static/js/padiem-exhibit-registry-v1.js`.

The same integration must preserve:

- `status: LIVE`;
- CTA `https://chat.padiem.net`;
- StoryMemory media blank;
- AI Free Radar media blank;
- LoveTree and DanjiOn media unchanged;
- all Design media unchanged;
- CURRENT/ALBUM reversibility;
- fail-open media fallback.

`docs/PADIEM_PUBLIC_MEDIA_LEDGER_V1.md` must be updated only after the public object is approved, adding the exact duration, resolution, public bytes and SHA-256. Until then, its current statement that Padiem Chat has no approved public footage remains correct.

## Local/browser worker boundary

Local/browser work is limited to tasks CENTRAL cannot perform directly:

1. real screen recording;
2. deterministic trimming/encoding to the accepted master;
3. metadata/hash extraction;
4. R2 upload only if the authenticated local Cloudflare CLI path is already available and safe.

Do not assign GitHub review, code audit, PR review, Netlify review, issue triage, or production acceptance to the local/browser worker.

## Capture report

```text
PADIEM_CHAT_PRODUCT_FILM_CAPTURE_REPORT

SOURCE_MAIN =
PUBLIC_URL = https://chat.padiem.net
PUBLIC_SURFACE_BEHAVIOR =
CAPTURE_PATH =
DURATION =
RESOLUTION =
BYTES =
SHA256 =
SENSITIVE_DATA = NONE
INFRA_URL_EXPOSURE = NONE
FAKE_CAPABILITY_CLAIM = NONE
R2_UPLOAD =
R2_OBJECT =
SOURCE_REMOTE_PARITY =
HTTP_200 =
RANGE_206 =
CACHE_GUARD =
LOCAL_SOURCE_MUTATION = NONE
GIT_MUTATION = NONE
FINAL_DISPOSITION =
```
