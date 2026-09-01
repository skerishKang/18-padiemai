# SM-089 On-Demand Auto Pack Generation + Precision Escalation Report v1

## Result
PASS. StoryMemory now supports demand-driven Precision escalation while preserving **LLM-first, Source-grounded, DB-on-demand** as the default execution model.

## Runtime / UI
- StoryMemory package: v3.4.6.
- New runtime: `storymemory-auto-pack-generation-1.0` v1.0.0.
- Existing Universal Source runtime remains byte-identical to v3.4.5.
- Existing Pack Registry / Marketplace runtime and Source UI remain byte-identical to v3.4.5.
- The UI adds `PRECISION · 정확도 높이기` inside the existing RIGHT AI Companion rather than introducing a separate dashboard.
- Quick / Auto is selected by default. Deep analysis is an explicit user-selected mode.

## Demand-driven trigger policy
A Pack is not generated merely because a Source exists. Escalation is eligible when one or more of the following is present:
1. explicit user request (`정확도 높이기`, `이 Source용 Pack 만들기`),
2. repeated correction / wrong-answer / retrieval-failure signals,
3. low retrieval confidence,
4. same-name collision,
5. citation insufficiency,
6. Strict/high-accuracy need.

A normal successful Explore/Grounded interaction without these signals remains `NOT_NEEDED` and does not create a Pack.

## Bounded generation request
The generator provider is replaceable through a provider hook. A generation request contains only:
- Source identity / revision / fingerprint / locator scheme / rights scope,
- the failed or repeated question,
- failure reasons and baseline metrics,
- bounded Source evidence,
- optional confirmed user corrections / query hints.

Hard limits in the runtime contract:
- at most 8 evidence blocks,
- at most 7,000 evidence characters,
- `fullSourceSent=false`,
- no Source body field allowed in the generated Pack proposal.

## Generated Pack defaults
Every automatically generated Pack begins as:
- PRIVATE,
- AUTO-GENERATED,
- UNVERIFIED,
- version `0.1.0`,
- exact Source-fingerprint compatibility,
- Source revision / language / locator-scheme bound,
- no automatic Marketplace publication.

Metadata records the generation mode, trigger reasons, bounded-processing disclosure, question fingerprint, compatibility identity, rights declaration, and artifact fingerprint.

## Safety / policy boundary
Provider proposals are sanitized before Pack construction.
- `sourceText`, `fullText`, `rawText`, `sourceBody`, `fullSource`, `documentBody`, `transcriptBody`, and `verbatimText` style fields are rejected.
- Hard policy overrides such as Trust Mode, answer reveal, future visibility, Strict UNKNOWN behavior, citation hard rules, spoiler boundaries, and workbook reveal are blocked.
- Quick mode accepts bounded aliases/search hints/soft policy only.
- Deep mode requires explicit confirmation and accepts knowledge rows only when they cite locators from the exact bounded Source evidence sent to the generator.
- Generated trust metadata never self-promotes to VERIFIED.

## Measured quality gate
The regression question is the existing lexical failure:
`헬렌 처음 어디서 나왔지?`

Without generated Pack:
- exact first-mention locator `odyssey:book:04:s1:row:002` = MISS.

Mock generator proposes the bounded alias repair:
- `헬렌 → 헬레네 / Helen`.

After generated Pack attach:
- exact first-mention locator = HIT,
- Pack query-hint expansion is observed,
- Source fingerprint is unchanged,
- user Memory count is unchanged.

After detach:
- baseline miss returns.

A style-only candidate that produces no measurable retrieval gain is automatically detached and returns `REJECTED_NO_IMPROVEMENT`; it is not stored in the local generated-Pack store.

## Providerless safe fallback
When no external generator provider is installed, an explicitly confirmed user correction can still build a private Search Pack. The same before/after quality gate applies. Without a provider or confirmed correction/hint, generation fails closed with `AUTO_PACK_GENERATOR_PROVIDER_REQUIRED`.

## Persistence / Marketplace boundary
Successful generated Packs are local/private by default.

`preparePublicReview()` produces only `pending_review`; it does not publish. Existing SM-085 Marketplace rights gates remain authoritative.

Optional Neon persistence is a metadata-only draft writer:
- `pack_registry` listing metadata,
- `pack_versions` artifact identity/compatibility metadata.

It requires a durable external `artifactUri`. The Pack payload itself is not inserted into Neon, and Source body is never inserted into Pack registry rows.

## Neon Main read-only verification
SM-089 performs no Neon mutation.

Fresh Main state after implementation:
- Odyssey Gold: 98 entities / 108 aliases / 641 mentions / 147 relationships / 98 answer cards / 145 citations.
- `source_passages=0`.
- active content versions/units = 6/185.
- Pack registry = 1 listing / 1 version / 0 attestations / 0 installs.
- Books 21–24 manual knowledge rows remain 0 for mentions / relationships / answer cards / citations.

Therefore:
- `NEON_MUTATION = NONE` for SM-089,
- `KNOWLEDGE_DB_MUTATION = NONE`,
- `SOURCE_BODY_DB_MUTATION = NONE`,
- `BOOK21_PLUS_MANUAL_KNOWLEDGE = NONE`.

## QA
- SM089 Auto Pack Generation contract: PASS.
- SM089 Auto Pack UI contract: PASS.
- Combined existing + new regression matrix: 18/18 PASS.
- JavaScript syntax: 6 inline + 6 external scripts PASS.
- `dist/content`: 192 files, changed 0 / missing 0 / extra 0 versus v3.4.5.
- Universal Source / Marketplace / Source UI core runtime files remain byte-identical to v3.4.5.
- No live browser/deployment acceptance is claimed in this environment.

## Out of scope
- automatic public publication,
- Marketplace M5 rating/version/fork workflow,
- M6 paid settlement/payment,
- M7 expert/official verification program,
- eager per-Source knowledge DB creation,
- mass embeddings,
- Cloudflare / BI Portal / DNS deployment.

## Deployment boundary
`CLOUDFLARE_PORTAL_DNS_MUTATION = NONE`.
`DEPLOYMENT = DEFERRED_TO_BI_PORTAL`.
`PORTAL_TARGET_ROUTE = /b61/`.
