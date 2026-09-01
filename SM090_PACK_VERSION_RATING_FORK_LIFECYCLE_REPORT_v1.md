# SM-090 Pack Version / Rating / Fork Lifecycle — Completion Report v1

Date: 2026-08-27
Package: StoryMemory v3.4.7
Runtime contract: storymemory-pack-lifecycle-1.0 v1.0.0
Marketplace stage: M5

## Result

SM-090 = PASS. Published Pack versions are immutable from ordinary user/community edits. Ratings and feedback are version-scoped, corrections carry reproducible Source locators, forward changes are submitted as proposals, and forks preserve explicit parent lineage.

## Runtime lifecycle

- `versionHistory(pack_id)` returns immutable released versions.
- Ratings are scoped to exact `pack_id + version` and validate 1–5 ranges.
- Public rating projection exposes aggregate metrics only; user identity and review text remain private rows.
- Feedback kinds: error / correction / compatibility / rights / other. Error/correction/compatibility require Source locator.
- Feedback and proposals reject Source-body payload fields.
- Version proposal must advance semantic version and include artifact URI, fingerprint and changelog.
- Proposal starts DRAFT, can be submitted to PENDING_REVIEW, and cannot silently change the currently published version.
- Creator runtime has no self-approval path. Approval/rejection is registry/host controlled.
- Fork begins LOCAL PRIVATE / AUTO-GENERATED / UNVERIFIED, records parent Pack/version, and does not mutate parent.
- Fork persistence requires an artifact writer to first return a real URI + fingerprint; only then is registry/version metadata written.

## Neon Main

Migration SHA256: `4df7e63aedabd27ef2c65893d59310374c1749000fd33ea766ecf1e9c0c4f29a`

Added durable lifecycle metadata only:
- `pack_version_proposals`
- `pack_ratings`
- `pack_feedback`
- `pack_rating_summary` view

Pre-SM090 rollback branch: `br-long-wave-avz3ah77` (`pre-sm090-pack-lifecycle-20260827`), verified with lifecycle tables = 0.

Post-apply Gold guard remains:
- 98 entities / 108 aliases / 641 mentions / 147 relationships / 98 answer cards / 145 citations
- `source_passages = 0`
- existing Marketplace registry/version = 1/1
- lifecycle fixture cleanup = proposals 0 / ratings 0 / feedback 0

Negative DB gates PASS: rating >5 rejected; correction without Source locator rejected; proposed correction containing Source body key rejected; version proposal declaring Source text included rejected.

## QA

Full regression = 21/21 PASS.

SM-090 lifecycle checks additionally verify:
- LOCAL PRIVATE fork before persistence
- artifact writer required
- registry persistence happens after artifact write result only
- parent Pack remains immutable
- VERIFIED status is not inherited
- version proposal review flow does not mutate published latest

Static regression:
- 6 works / 185 units / 12,628 bilingual passages
- `dist/content`: 192 files / changed 0 / missing 0 / extra 0 versus v3.4.6
- six pre-existing Universal/Source UI/Marketplace/Auto-Pack core runtime files byte-identical to v3.4.6
- JavaScript syntax: PASS
- local asset references: PASS

## Explicit non-claims

- M6 payment/purchase/refund/payout/settlement is NOT implemented.
- M7 expert/official verification program is NOT implemented.
- Public raw user review-text listing is not implemented; only numeric aggregate projection is part of this MVP.
- User/community actors cannot self-approve a version release.
- A local fork is not claimed durable until an artifact writer successfully stores the artifact and returns URI/hash.
- No Source body or derived knowledge graph was added by SM-090.
- Cloudflare / BI Portal / DNS deployment was not performed.

## Mutation boundary

NEON_MUTATION = PACK_LIFECYCLE_METADATA_SCHEMA_ONLY
KNOWLEDGE_DB_MUTATION = NONE
SOURCE_BODY_DB_MUTATION = NONE
BOOK21_PLUS_MANUAL_KNOWLEDGE = NONE
CLOUDFLARE_PORTAL_DNS_MUTATION = NONE
DEPLOYMENT = DEFERRED_TO_BI_PORTAL
PORTAL_TARGET_ROUTE = /b61/
