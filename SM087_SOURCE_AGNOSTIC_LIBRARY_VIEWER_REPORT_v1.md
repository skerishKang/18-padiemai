# SM-087 Source-Agnostic Library + Source Viewer UI Adaptation — Completion Report

## Result
`SM-087 [P1][DONE]` at deterministic UI/runtime contract scope.

Package: StoryMemory v3.4.4  
UI contract: `storymemory-source-ui-1.0` v1.0.0  
Base runtime: `storymemory-universal-source-runtime-1.0` v1.4.0 from v3.4.3, byte-preserved.

## Product grammar implemented
The existing three-zone StoryMemory grammar is preserved and generalized:

- LEFT — Context / Bookmark / Memory
- CENTER — Source Viewer
- RIGHT — AI Companion

Book remains a first-class Source skin with its existing shelf and physical reading behavior. Non-book Sources use native locators rather than fake book pagination.

## Library adaptation
The existing Book shelf remains default Book mode. A Sources mode and Source-add entry were added without converting the Library into a flat SaaS dashboard.

Non-book Source cards share the product metadata grammar:
- source type,
- progress / current position,
- ingest readiness,
- recommended/current Trust Mode,
- attached Pack count.

## Source Viewer fixtures
Three source families were exercised end-to-end through the Universal Harness:

1. Contract/document
   - 3 blocks
   - STRICT recommendation
   - page/block stable locator
   - exact clause/date/number source evidence path
2. Workbook
   - 4 blocks
   - GROUNDED recommendation
   - problem/answer stable locators
   - Tutor answer blocks hidden from retrieval
3. URL/media transcript
   - 3 timestamp segments
   - EXPLORE recommendation
   - timestamp-segment stable locators

A user-created private document import fixture also reaches CONVERSATION_READY with `ownerScope=user-private`.

## Reader binding
For a native Source:
- CENTER switches from Book paper stack to the native Source viewer.
- LEFT exposes the active Source, current locator, block navigation, memory action, and locator copy.
- RIGHT exposes Trust selection, Pack state, bounded-current-locator context, and source-type quick questions.
- AI questions call the same Universal Harness and preserve `fullSourceSent=false`.

Returning to Book mode restores the existing Book UI path.

## Regression / boundaries
PASS:
- SM087 source UI contract.
- SM082 current Reader bridge / exact Odyssey Book17 resume.
- SM058 production runtime contract.
- inline JavaScript syntax and new UI JS syntax.
- local asset reference check.
- `dist/content` regression: 192 files, changed 0 / missing 0 / extra 0 vs v3.4.3.
- Universal Source runtime byte identity vs v3.4.3.

Historical SM038/039 static-expansion contract was not counted as a product regression because its test hardcodes an external fixture path absent from this session. No PASS is claimed for that historical test in SM-087.

## Browser acceptance
`PENDING_ENVIRONMENT_BLOCKER`.

The current environment Chromium hangs/times out even on a minimal `data:text/html,<html><body>ok</body></html>` invocation. Therefore no screenshot/browser PASS is claimed. This does not replace a future real browser/mobile acceptance gate.

## Explicit non-claims
- raw PDF OCR/acquisition,
- live URL/YouTube fetch,
- STT/transcript acquisition,
- durable upload persistence for the new import UI,
- production Portal deployment.

## Mutation boundary
- NEON_MUTATION = NONE
- CLOUDFLARE_PORTAL_DNS_MUTATION = NONE
- BOOK21_PLUS_MANUAL_KNOWLEDGE = NONE
- DEPLOYMENT = DEFERRED_TO_BI_PORTAL
- PORTAL_TARGET_ROUTE = /b61/
