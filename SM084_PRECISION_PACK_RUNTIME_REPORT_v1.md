# SM-084 Precision Pack Runtime + Attach/Detach — Completion Report v1

**Status:** PASS / DONE candidate pending Drive readback and Backlog append
**Package:** StoryMemory v3.4.3
**Runtime:** storymemory-universal-source-runtime-1.0 v1.4.0
**Pack schema:** storymemory-precision-pack-1.0

## 1. What was implemented
SM-084 converts the earlier optional Pack hook into a serializable runtime artifact contract. Knowledge, Harness, Search, and Companion Pack kinds are accepted without making Pack installation a prerequisite for Source conversation. JSON Pack payloads support aliases, search hints, structured knowledge evidence, and controlled Harness soft-policy configuration.

## 2. Compatibility and lifecycle
- Default JSON compatibility is exact Source fingerprint.
- Explicit source-id and work-revision modes are available only with required identity metadata.
- Revision/language/locator-scheme mismatches are rejected.
- Attach order respects Pack priority; bounded composition is enforced.
- Source state becomes `PRECISION_READY` while a Pack is attached and returns to `BASE` after the last Pack is detached.
- Source blocks and user Memory are not modified by attach/detach.

## 3. Measured quality delta
Odyssey Book 20 query: `헬렌 처음 어디서 나왔지?`
- No Pack: exact first mention recovered = **false**.
- Demo Alias/Companion Pack attached: query expands to `헬레네` / `Helen`; exact Source locator `odyssey:book:04:s1:row:002` recovered = **true**.
- Pack detached: exact recovery returns to **false**, proving reversible enhancement rather than Source mutation.

## 4. VERIFIED trust boundary
Marketplace-style JSON Pack trust metadata is self-declared until externally attested. A JSON artifact claiming `trustTier=curated` is treated as unverified unless a trusted host/registry `packVerifier` attests an effective verified tier. Even with attestation, `VERIFIED` answer provenance is emitted only when Pack evidence includes a locator that resolves against the active Source. The QA fixture attestation is local test infrastructure only.

## 5. Harness Pack safety
JSON Harness Packs may add soft configuration such as answer style, citation preference, terminology, domain instructions, or hint strategy. They cannot override hard runtime controls including Trust Mode, citation requirement, Strict UNKNOWN behavior, future/spoiler visibility, or workbook answer reveal. The negative Harness fixture attempted `trustMode=EXPLORE`, `revealAnswers=true`, and `allowFuture=true`; these were blocked while the actual context remained GROUNDED.

## 6. Negative gates
- Wrong Source fingerprint → `PACK_SOURCE_FINGERPRINT_MISMATCH`
- Stale Source revision → `PACK_SOURCE_REVISION_MISMATCH`
- Altered lightweight artifact fingerprint → `PACK_ARTIFACT_FINGERPRINT_MISMATCH`
- Missing explicit JSON compatibility identity → `PACK_COMPATIBILITY_IDENTITY_REQUIRED`

## 7. Regression
- SM-084 Pack runtime: PASS.
- Existing regression suite: **11/11 PASS**.
- Static corpus unchanged vs v3.4.2: 192 files / changed 0 / missing 0 / extra 0.
- JavaScript syntax: PASS.
- JSON Schema Draft 2020-12 validation for demo Pack: PASS.

## 8. Non-claims / deferred scope
SM-084 does not implement Marketplace registry/discovery, paid entitlement/settlement, public sharing, rating/fork flows, persistent account installation state, or a live remote Pack attestation service. The bundled Odyssey demo Pack is private QA-only and is not a production verified Marketplace asset. `artifactFingerprint` is intentionally only a lightweight runtime identity/integrity check, not a cryptographic signature. Arbitrary executable code is not accepted in Marketplace JSON Pack payloads. Mixed-Source Pack UI remains SM-087.

## 9. Mutation boundary
- NEON_MUTATION = NONE
- CLOUDFLARE_PORTAL_DNS_MUTATION = NONE
- BOOK21_PLUS_MANUAL_KNOWLEDGE = NONE
- DEPLOYMENT = DEFERRED_TO_BI_PORTAL
- PORTAL_TARGET_ROUTE = /b61/
