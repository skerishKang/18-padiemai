# SM-085 Pack Registry + Marketplace MVP Report v1

## Result
PASS. StoryMemory now has a metadata-only Pack Registry and first Marketplace discovery/install runtime while preserving **LLM-first, Source-grounded, DB-on-demand**.

## Runtime / UI
- StoryMemory package: v3.4.5.
- Registry runtime schema: `storymemory-pack-registry-1.0` v1.0.0.
- Pack payload schema remains `storymemory-precision-pack-1.0`.
- Public discovery, compatible-only filtering, creator/version lineage, rights metadata, artifact loading, attach/install, detach/uninstall, install-provider persistence hooks, and registry attestation handoff are implemented.
- Marketplace UI is a bounded panel inside the RIGHT AI Companion. Existing Book shelf/page-curl and source-specific CENTER viewers are preserved.
- Static catalog fallback works without Neon; authenticated runtime can switch to the Neon Data API provider.

## First public Pack
`pack:odyssey:korean-alias-public:v1` / `Odyssey Korean Alias Helper`.
- Type: Search Pack.
- Price: FREE.
- Publication: public/published.
- Trust: AUTO-GENERATED / UNVERIFIED.
- Source body included: NO.
- Purpose: `헬렌 → 헬레네 / Helen`, `이로스 → 아르나이오스 / Irus` query expansion.
- The Pack is stored as JSON artifact; Neon stores only listing/version metadata.

## Measured attach/detach behavior
The existing Book 20 query `헬렌 처음 어디서 나왔지?` is used as the regression case.
- Baseline without Pack: exact Book 4 first-mention recall = false.
- After Marketplace install/attach: exact locator `odyssey:book:04:s1:row:002` is recovered.
- After detach: baseline behavior is restored.
- Source fingerprint and user/source state remain unchanged.

## Trust boundary
- A Pack declaring itself `curated` is not trusted by itself.
- `CURATED / EXPERT / OFFICIAL` becomes effective only through a trusted registry/host attestation.
- An attestation alone does not make an answer `VERIFIED`; qualifying Source evidence must actually be used by the answer path.
- Authenticated users have read access to visible attestations but no direct attestation write grant.

## Rights boundary
- `source_text_included=true` is rejected at Neon DB constraint level and in browser registry normalization.
- A private Pack cannot be directly stored as `published`.
- Public listing validation rejects private-source/private-data declarations.
- No copyrighted/private Source body is seeded into the Marketplace Pack.

## Neon Main mutation
Metadata-only schema added:
1. `storymemory.pack_registry`
2. `storymemory.pack_versions`
3. `storymemory.pack_attestations`
4. `storymemory.pack_installs`

RLS follows the existing authenticated StoryMemory model. Creators may create private drafts and move them to pending review but cannot self-publish through creator RLS. User installs are scoped to `auth.user_id()`.

A pre-mutation rollback branch is retained:
- `pre-sm085-pack-registry-20260827`
- `br-sweet-bonus-avyx2twz`

The validated temporary branch and Main had an empty schema diff after promotion, then the temp branch was deleted.

## Non-mutations / preserved baseline
After Main promotion:
- entities 98
- aliases 108
- mentions 641
- relationships 147
- answer cards 98
- citations 145
- source_passages 0
- active content versions 6
- active units 185

Therefore `KNOWLEDGE_DB_MUTATION = NONE` and `SOURCE_BODY_DB_MUTATION = NONE`.

## Payment boundary
Paid/free metadata can be represented, but purchase, payment processing, entitlement purchase flow, settlement, refund, creator payout and tax handling are **NOT_IMPLEMENTED** in SM-085. This is deliberately deferred beyond the first Marketplace MVP.

## QA
- SM-085 Marketplace Runtime: PASS.
- Neon Pack Provider Contract: PASS.
- Marketplace UI Contract: PASS.
- Existing regression matrix: 16/16 PASS.
- JavaScript syntax: PASS.
- Local assets: PASS.
- `dist/content`: 192 files, changed 0 / missing 0 / extra 0 versus v3.4.4.
- Universal Source Runtime: byte-identical to v3.4.4.
- Browser live/deployment acceptance is not claimed; Cloudflare/BI Portal/DNS remain deferred.

## Deployment boundary
`CLOUDFLARE_PORTAL_DNS_MUTATION = NONE`.
`DEPLOYMENT = DEFERRED_TO_BI_PORTAL`.
`PORTAL_TARGET_ROUTE = /b61/`.
