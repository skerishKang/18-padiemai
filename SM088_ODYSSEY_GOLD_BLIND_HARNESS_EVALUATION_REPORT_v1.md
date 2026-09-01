# SM-088 Odyssey Gold + Book21–24 Blind Harness Evaluation Report v1

## Status
PASS — implementation/evaluation scope.

## Purpose
Validate whether the StoryMemory Universal Source Harness can retrieve trustworthy source evidence without making per-book knowledge DB construction the production prerequisite. Frozen Odyssey Books 1–20 curated data is used only as a scoring oracle. Books 21–24 remain a zero-precompute blind set.

## Evaluation boundary
- Gold injected into Harness: NO
- Precision/Knowledge Pack attached: NO
- Books 21–24 Neon knowledge rows: mentions 0 / relationships 0 / answer cards 0 / citations 0
- Canonical body authority: Static Corpus
- External LLM semantic-answer benchmark: NOT CLAIMED in SM-088; the separately developed right-side AI engine is not live-wired here.

## Baseline v3.4.1
- Entity exact Gold locator hit@8: 84.62%
- Relationship exact Gold locator hit@8: 60.00%
- Cross-unit first-mention recall hit@8: 0.00%
- Spoiler leakage: 0%

The baseline exposed a structural defect: the Book bridge searched only the currently loaded unit, so Book 20 could not recall evidence from earlier Books.

## Runtime repairs in v3.4.2 / runtime 1.3.0
1. Full-block lexical indexing; passage indexing no longer stops after the first 16 unique terms.
2. Bounded containment/stem matching for attached Korean particles and a tiny disambiguating one-syllable noun allowlist.
3. Visible-boundary fallback if exact postings exist only in future content.
4. Body-text scoring takes precedence over section-title-only matches.
5. Lazy prior-unit Static Corpus lookback for history/first-appearance queries and no-hit recall.
6. First-appearance queries can prefer earliest matching evidence.
7. Optional Retrieval Planner hook accepts query hints from the external AI engine without sending the whole Source or Gold DB to the planner.

## Books 1–20 Gold results after repair
- Entity exact locator hit@8: 92.31% (36/39)
- Relationship exact locator hit@8: 95.00% (19/20)
- Entity same-section evidence hit@8: 100.00%
- Relationship same-section evidence hit@8: 100.00%
- Cross-unit first-mention recall hit@8: 90.00% (9/10)
- Spoiler leakage: 0%
- Argos dog same-name disambiguation: PASS
- User Memory continuity: PASS

The remaining exact-locator entity/relationship misses are all same-section adjacent evidence. The only cross-unit lexical miss is `헬렌` versus the Static Korean spelling `헬레네`.

## Retrieval Planner variant
A mock external planner receives only question + Source metadata/position/trust context and returns query hints `헬레네`, `Helen`. The Harness then restores the exact first mention `odyssey:book:04:s1:row:002` as rank 1. `fullSourceSent=false` remains true to the bounded-context policy.

This demonstrates the intended division of labor: the AI engine can help understand the user's wording and expand retrieval queries, while the Harness remains responsible for source-bounded evidence retrieval and spoiler safety.

## Books 21–24 blind results
No manual knowledge DB or Pack was created.
- Rare source-term exact locator hit@8: 100% (24/24)
- Section retrieval hit@8: 100% (16/16)
- Cross-unit recall hit@8: 100% (9/9)
- Spoiler leakage: 0% (5 boundary cases)
- Grounded deterministic route/provenance: 100% (4/4)

The rare-term fixtures are deterministic retrieval plumbing tests, not a claim that they independently prove high-level literary comprehension.

## Architecture decision
Default production retrieval should be:

`lexical-first → lazy prior-unit lookback → AI Retrieval Planner/query expansion → lazy semantic retrieval only if still needed → optional Precision Pack for repeated/high-stakes accuracy`

SM-088 does not justify eager full-library embeddings. It also does not justify returning to mandatory per-book entity/relationship/card precompute.

## Regression / boundaries
- Static `dist/content`: 192 files, changed 0 / missing 0 / extra 0 vs v3.4.1
- Book21+ manual knowledge construction: NONE
- Neon mutation: NONE; reads only
- Cloudflare / BI Portal / DNS mutation: NONE
- Deployment: DEFERRED_TO_BI_PORTAL
- Portal route: /b61/

## Next
SM-084 Precision Pack Runtime + Attach/Detach. The Pack layer can now be evaluated as an optional accuracy upgrade against a measured no-Pack Harness baseline rather than as a prerequisite for conversation.
