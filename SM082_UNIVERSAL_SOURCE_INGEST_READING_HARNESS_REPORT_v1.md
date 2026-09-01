# SM-082 — Universal Source Ingest + Reading Harness v1

## Result

SM-082 = PASS at implementation + deterministic runtime-contract scope.

StoryMemory v3.4.0 extends the existing SM-057 bounded-context foundation into a Source-agnostic runtime while preserving the v3.3.6 production Book path. The implementation does not replace the existing Reader UI or production Hybrid AI routing; it adds a reusable runtime and a non-invasive current-Reader bridge.

## Authority

This work follows the 2026-08-27 v2.1 authority set. The historical `SM-082 Odyssey Book 21 Knowledge Expansion` is superseded. Odyssey Books 1–20 remain frozen Gold/evaluation material and Books 21–24 remain no-precompute blind evaluation material.

## Implemented contract

Runtime schema: `storymemory-universal-source-runtime-1.0` v1.0.0.

Common Source fields include Source identity/type, owner/rights scope, revision/fingerprint, language, structure, stable locators, ingest state, blocks, lexical index, and metadata. Source body and AI-derived data remain separate.

Visible ingest states:
1. RECEIVED
2. PARSING
3. STRUCTURING
4. SEARCH_READY
5. CONVERSATION_READY
6. ENRICHING (optional)
7. PRECISION_READY (optional)
8. FAILED_PARTIAL

Conversation-ready requires structural blocks + stable locators + cheap lexical search. It does not require entities, relationships, answer cards, embeddings, or a full knowledge graph.

## Supported fixture paths

### 1. Book

Existing `storyMemoryStatic` is reused. Odyssey Book 01 loaded 64 canonical passages. Canonical locators are preserved without translation into a new locator scheme. Book progress-bounded retrieval excludes evidence after the active ordinal/sequence.

Example locator: `odyssey:book:01:s1:row:001`.

### 2. PDF / document

The runtime accepts extracted page/block text and assigns stable document locators.

Fixture: 3 pages / 4 blocks.
Example locator: `doc:policy-pdf-v1:page:1:block:1`.
Lexical retrieval correctly returns the page/block containing the five-year retention rule.

### 3. URL / transcript

The runtime accepts captured/transcript segments with timestamps.

Fixture: 3 transcript segments.
Example locator: `url:retrieval-talk:t:0-20000`.
Lexical retrieval correctly finds the segment describing lazy semantic escalation.

## Reading Harness behavior

Question flow:
active Source + current locator/selection → lexical retrieval → user Memory lookup → optional Pack lookup → bounded evidence packet → Model Prior reasoning aid → Source-grounded provider call/fallback.

Provider packet guarantees exercised by QA:
- `fullSourceSent=false`
- evidence count bounded by contract
- evidence chars bounded by contract
- current Source fingerprint present
- Model Prior explicitly marked as a reasoning/retrieval aid
- Source-specific facts marked as requiring Source grounding
- no mandatory knowledge precompute

## Memory and Pack hooks

Local user Memory continuity passes in the generic runtime. The browser bridge also reads existing StoryMemory unified-store Memories for the active Book Source.

Pack is optional. A Source remains conversational without a Pack. SM-082 supports a bounded attach/search/augment hook plus Source fingerprint compatibility rejection. The full executable Pack lifecycle/format remains SM-084.

## Existing Reader bridge

The package exposes non-invasive browser helpers:
- `storyMemoryUniversalEnsureCurrentBookSource()`
- `storyMemoryBuildUniversalCurrentContext(question, selection)`
- `storyMemorySubmitUniversalQuestion(question, options)`
- `storyMemoryUniversalSourceStatus()`

Bridge QA bound the actual existing exact-resume fixture to:
- Source: `book:odyssey`
- Unit: 17
- Locator: `odyssey:book:17:s1:row:004`
- Memory bridge: PASS
- `fullSourceSent=false`

The current chat UI was not rebound. This avoids mixing SM-082 runtime work with SM-087 mixed-Source UI adaptation.

## Regression closure

Existing regressions after the final bridge patch:
- SM054 Static Adapter Contract = PASS
- SM057 Hybrid AI Context = PASS
- SM058 Production Runtime Contract = PASS
- SM058 Static Reader Regression = PASS
- SM058 Hybrid AI Regression = PASS

Static corpus remains 6 works / 185 units / 12,628 bilingual passages.

v3.3.6 → v3.4.0 `dist/content` byte regression:
- base files: 192
- new files: 192
- changed: 0
- missing: 0
- extra: 0

The only existing runtime HTML change before package metadata/report files is one additional external script load before `</body>`; the Universal runtime itself is a new file.

## Correctness fixes during implementation

1. Null ordinal handling: the first implementation treated `null` as numeric zero through JavaScript coercion, which incorrectly filtered generic document blocks. The `finite` helper now rejects null/undefined/empty explicitly.
2. Lexical current-position boost: initial current-position weighting could outrank a stronger term match. The current-location boost was reduced so lexical relevance remains primary while locality remains a tie/nearby aid.

Both fixes were made before final QA and no database mutation occurred.

## Explicit non-claims

SM-082 does not claim generic raw PDF byte parsing/OCR. It proves the runtime adapter after extraction. Binary acquisition/parser implementations belong to Source-type adapter work when needed.

SM-082 does not claim live URL crawling, YouTube/media download, STT, or transcript acquisition. It proves the runtime contract for authorized captured/transcript inputs.

SM-082 does not implement the final Trust Mode/provenance taxonomy (SM-083), full Pack runtime contract (SM-084), Marketplace (SM-085), or mixed-Source UI (SM-087).

## Mutation boundary

NEON_MUTATION = NONE
CLOUDFLARE_MUTATION = NONE
BI_PORTAL_MUTATION = NONE
DNS_MUTATION = NONE
DEPLOYMENT = DEFERRED_TO_BI_PORTAL
PORTAL_TARGET_ROUTE = /b61/
BOOK21_MANUAL_KNOWLEDGE = NONE

## Next pointer

SM-083 [P1][READY] Trust Modes + Answer Provenance.
