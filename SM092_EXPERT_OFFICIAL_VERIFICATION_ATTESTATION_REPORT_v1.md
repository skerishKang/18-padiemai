# SM-092 Expert / Official Verification + Attestation Program

Status: **PASS**
Release target: **StoryMemory v3.4.9**
Marketplace stage: **M7**
Verification contract: `storymemory-pack-verification-1.0`

## Purpose

SM-092 makes EXPERT and OFFICIAL trust a verifiable program instead of a self-declared Pack label. Verification is bound to an exact Pack version, Source fingerprint, explicit verification scope, approved review request, active verifier, and active credential. Popularity, rating, installs, sales, or creator self-declaration never create VERIFIED status.

## Runtime implementation

Added:
- `dist/storymemory-pack-verification-runtime.js`
- `dist/storymemory-pack-verification-ui.js`
- `dist/storymemory-pack-verification-ui.css`

The runtime fails closed for expired/revoked/suspended verifier state, credential expiry/revocation, Source fingerprint mismatch, unapproved request, wrong Pack version, and incompatible verification scope.

Trust does not inherit to a new Pack version or fork. The UI shows verifier identity label, verification tier, scope, and expiry rather than reducing verification to a generic badge.

### Compatibility correction found by SM-092

The existing Universal provenance runtime previously recognized `expert-verified` but not the Marketplace contract's canonical `expert` tier. SM-092 fixes the verified-tier set so a valid M7 Expert attestation can support `VERIFIED` answer provenance when qualifying Source evidence is actually used. The v3.4.8 → v3.4.9 Universal runtime diff is limited to this `expert` tier inclusion.

## Neon durable-state boundary

Migration: `DB_MIGRATIONS/STORYMEMORY_PACK_VERIFICATION_M7_v1.sql`

Main adds verification metadata only:
- `pack_verifiers`
- `pack_verifier_credentials`
- `pack_verification_requests`
- `pack_attestation_events`
- public read view `pack_verification_public_state`
- `credential_id` / `request_id` binding on existing `pack_attestations`
- issuance/expiry/revocation/revalidation guard + audit triggers

Authenticated clients may submit/read their own verification requests and read visible attestation events, but cannot create verifier identity, credential truth, or Expert/Official attestation truth directly.

Credential metadata stores references/fingerprints and bounded authority metadata; raw identity/license documents and Source-body-like payloads are blocked.

## Validation branch evidence

Validation branch: `br-orange-bar-avhzdnog` (deleted after successful validation).

Positive fixtures PASS:
- exact-version / exact-fingerprint Expert attestation
- publisher Official attestation
- `issued → revoked` Expert audit lifecycle
- `issued → expired` Official audit lifecycle

Negative gates PASS:
- unapproved request blocked
- Source fingerprint mismatch blocked
- Expert verifier self-claiming Official blocked
- expired credential blocked
- raw ID metadata blocked
- empty verification scope blocked
- Source-text scope blocked

All validation fixtures were removed before promotion. Residual verifier/credential/request/event/attestation rows = **0**.

## Main promotion

Rollback branch: `br-ancient-tooth-avkt81i6` (`pre-sm092-pack-verification-20260827`). M7 tables on rollback branch = **0**.

Main promotion: **39/39 statements PASS**.

Post-apply state:
- M7 tables = 4
- M7 public view = 1
- Production verifier rows = 0
- credential rows = 0
- verification request rows = 0
- attestation-event rows = 0
- Pack attestation rows = 0

Existing Odyssey Gold remains unchanged:
- entities 98
- aliases 108
- mentions 641
- relationships 147
- answer cards 98
- citations 145
- `source_passages = 0`
- Pack registry rows 1 / version rows 1

`KNOWLEDGE_DB_MUTATION = NONE`
`SOURCE_BODY_DB_MUTATION = NONE`

## Regression / integrity

- full regression: **27/27 PASS**
- static corpus: 6 works / 185 units / 12,628 passages
- `dist/content`: 192 files / changed 0 / missing 0 / extra 0 vs v3.4.8
- JavaScript syntax: PASS
- local asset references: PASS
- previous Marketplace / Auto-Pack / Lifecycle / Entitlement runtimes remain byte-identical
- Universal runtime delta is limited to recognizing canonical `expert` as a verified tier

## Explicit non-claims

SM-092 does **not** claim:
- that any real person or organization has been verified in Production
- that any real Expert/Official Pack attestation has been issued
- that raw credential/identity documents are stored
- that a live identity/credential verification provider is integrated
- that a live payment provider is integrated
- that rating/popularity is evidence of expertise
- that Source bodies or per-Source knowledge graphs were added to Neon
- that v3.4.9 has been deployed to Cloudflare / BI Portal

Deployment remains `DEFERRED_TO_BI_PORTAL`, target `/b61/`.

The sealed ZIP size/SHA and Drive raw-readback result are recorded separately in `SM092_RELEASE_VERIFICATION.json` after artifact sealing to avoid self-referential package hashing.
