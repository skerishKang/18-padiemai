# PADIEM × LoveTree Interactive World v1

Status: implementation scaffold for #34  
Production routes: unchanged in this phase

## 1. Product decision

PADIEM should not publish the LoveTree corpus as a wall of recorded MP4s.

The public system has two distinct layers:

1. **PADIEM Design World** — a public, Lusion-like interactive exhibition of PADIEM interaction structures.
2. **LoveTree Product World** — the actual LoveTree journey assembled from the strongest HOME / DISCOVER / SUBJECT / PATH / MOMENT / CAPTURE / MYTREE / ARCHIVE / TOOLS / MILESTONE families.

The 108 MP4 files are evaluation evidence, not 108 public products. Public indexing works from the normalized family layer.

Current Drive authority:

```text
RESULT_CORPUS_ROWS          = 108
WORKING_NORMALIZED_FAMILIES = 88
SOURCE_NUMBERED_FOLDERS     = 74
CODEX_DESIGN_FOLDERS        = 20
```

SOURCE and CODEX IDs are identity. They must not be renumbered to create a prettier public sequence.

## 2. Reference principles

### Lusion principles to borrow

- enormous editorial typography and strong negative space;
- Featured Work before exhaustive archive;
- project detail surfaces that can launch the real project;
- design + motion + 3D + development treated as one authored experience;
- selective WebGL instead of permanent maximum rendering load.

### Unseen principles to borrow

- the site is a world that can be dragged/explored, not only scrolled;
- audio is explicit and optional;
- click/hold/drag become first-class interaction verbs;
- mobile receives an authored interaction model rather than a shrunken desktop;
- immersive intent is retained while rendering cost is reduced.

### PADIEM / LoveTree principles that remain authority

- current PADIEM cinematic grammar remains the brand shell;
- MECHANICS FIRST → VISUAL FIDELITY → CONTENT;
- source-owned LoveTree interactions are ported faithfully before product reinterpretation;
- memory / emotion / relationship / movement are the semantic materials;
- no generic SaaS card wall.

## 3. Public information architecture

```text
PADIEM
├─ Home
├─ Products
│  └─ LoveTree
│     ├─ Enter LoveTree
│     ├─ Explore
│     ├─ Create
│     └─ My Tree
└─ Design
   └─ Interactive Works
      ├─ Featured
      ├─ Discover
      ├─ Subject
      ├─ Path
      ├─ Moment
      ├─ MyTree
      ├─ Archive
      ├─ Tools
      ├─ Milestone
      ├─ Campaign
      └─ Lab
```

`/design/` is the public exhibition world. `LoveTree` remains a product, not a synonym for the entire PADIEM design archive.

## 4. LoveTree product journey

The existing 108-result classification remains the product-job authority:

```text
LOVETREE / HOME
├─ Explore → DISCOVER → SUBJECT → PATH → MOMENT → Save / derive into My Tree
└─ Plant a Moment → CAPTURE → MYTREE → ARCHIVE / TOOLS → MILESTONE

SHELL wraps the entire journey.
CAMPAIGN is a special public experience layer.
LAB holds experiments and comparison material.
```

Do not force every strong visual prototype into HOME. A strong PATH or ARCHIVE mechanic should stay in the job where its meaning is strongest.

## 5. Gallery model

The gallery has three layers.

### A. Featured Work

8–12 authored large scenes. Asymmetric, editorial, high-motion, not equal cards.

### B. Explore the Archive

Filterable family index. Filters are semantic jobs, not visual styles.

### C. Experience detail / launch

Each family detail surface explains:

1. what human memory/emotion/workflow is organized;
2. what the interaction metaphor is;
3. what the user can physically do;
4. whether the exact runtime is public;
5. source/provenance state.

Primary calls to action:

```text
ENTER EXPERIENCE
TRY
REMIX
CREATE WITH AI
```

Only expose a CTA when the corresponding capability is real and public.

## 6. Runtime states

Public UI must distinguish runtime maturity.

| State | Meaning |
|---|---|
| `LIVE` | exact reviewed interactive runtime is public |
| `PREVIEW` | lightweight interactive preview is public; full runtime is not |
| `VIDEO` | approved media evidence only |
| `LAB` | experimental/internal; not a public product promise |
| `HOLD` | source/provenance/fidelity gate is unresolved |

Internal repository implementation state and public runtime state are separate fields.

## 7. Preview runtime contract

Do not mount dozens of heavy experiences at once.

```text
poster / still
    ↓ intent
lightweight preview adapter
    ↓ ENTER
full runtime
```

Rules:

- one active animated preview at a time on desktop;
- previews suspend when outside the viewport;
- full runtimes load only after explicit ENTER;
- large videos remain streamed media, never repository binaries;
- WebGL contexts are released on exit;
- `prefers-reduced-motion` receives a deliberate still/low-motion composition;
- low-power/mobile mode may replace a WebGL preview with DOM/CSS transform or short media while preserving the interaction metaphor.

## 8. Desktop interaction grammar

### Memory Field

Cursor movement affects a subtle field of LoveTree-native particles/fragments. It is not a copy of another studio's water ripple.

Inputs:

- pointer position;
- pointer velocity;
- proximity to an active work;
- click/press impulse.

Outputs:

- depth/parallax displacement;
- short fragment/light trail;
- low-amplitude local wave;
- optional tonal cue after audio unlock.

The field must remain subordinate to project media.

### Featured scenes

- native aspect ratios;
- asymmetric two-column and full-bleed alternation;
- title scale changes per work;
- metadata remains small and technical;
- hover may awaken preview, but click/keyboard always works.

## 9. Mobile interaction grammar

Mobile is not desktop minus hover.

Primary verbs:

```text
DRAG      explore a field / orbit / rail
TAP       select / focus
HOLD      reveal / special moment / quick preview
SWIPE     advance between authored scenes
SNAP      settle into a selected experience
```

Rendering policy:

- preserve full-screen composition;
- use touch velocity instead of pointer velocity for the Memory Field;
- only one animated canvas/runtime at a time;
- cap device pixel ratio for heavy scenes;
- reduce particle counts and post-processing before removing the interaction itself;
- keep readable touch targets and avoid the global bot covering key controls.

## 10. LoveTree bot

`CODEX:07 / 러브트리_살아있는캐릭터월드_V2` is the behavioral donor for the global LoveTree guide.

Desktop:

- free-flying with restrained idle path;
- draggable;
- may perch near the selected project;
- reacts to preview start / runtime launch / completion;
- can explain controls without becoming a mandatory tutorial.

Mobile:

- defaults to a docked/floating companion state;
- drag and hold remain available;
- expands only on intent;
- never blocks primary CTA or project media.

LUMI remains local to experiences such as Tree Keeper. Do not merge every character into one identity.

## 11. Initial featured set

V1 starts with 12 high-value families. This is a build queue, not a claim that all are already public.

| Ref | Name | Job | Initial role |
|---|---|---|---|
| SOURCE:64 | 부유모먼트 웰컴오빗 입장포털 | MYTREE / RETURN | entry / spatial motion |
| SOURCE:58 | 리빙메모리 핀보드 시네마틱 | MYTREE | living board |
| SOURCE:57 | 리빙글라스 모먼트카드 | MOMENT | focused moment |
| SOURCE:56 | 세로형 모먼트관계망 | PATH | relationship overview |
| SOURCE:60 | 3D 모먼트클러스터 | PATH | deep spatial exploration |
| CODEX:07 | 살아있는캐릭터월드 V2 | CAMPAIGN | global bot behavior donor |
| CODEX:18 | 프래그먼트로더 V1/V2 | SHELL | transition / loading |
| CODEX:14 | 로테이팅메모리인덱스 | ARCHIVE | tactile index |
| CODEX:13 | 리퀴드글라스 인피니트비디오월 | ARCHIVE | dense moving archive |
| CODEX:15 | 메모리바이오스피어 | HOME | high-visual world donor |
| SOURCE:67 | 메모리테이프 인터랙티브롤 | ARCHIVE | continuous memory metaphor |
| SOURCE:72 | 에디토리얼 모먼트 아카이브 | DISCOVER | mobile/editorial discovery |

SOURCE:73 is visually strong but remains outside the initial public set until third-party prompt/font/hero-media provenance is cleared.

## 12. V1 page composition

```text
[GLOBAL PADIEM SHELL]

01 HERO
   PADIEM / INTERACTIVE WORKS
   Designed to be felt.
   Drag / move / scroll cue
   Sound toggle

02 FEATURED FIELD
   2 large works, awake on intent

03 WORLDS
   LoveTree product world / Padiem AI / experimental interactions

04 ARCHIVE STREAM
   job filters + family index

05 LIVE GUIDE
   LoveTree bot and short control language

06 FOOTER / NEXT WORLD
```

The page should feel like one continuous environment, not six stacked SaaS sections.

## 13. Registry schema

The implementation registry lives in `static/js/padiem-experience-registry-v1.js`.

Required identity and governance fields:

```text
id
namespace
sourceId
familyId
titleKo
titleEn
job
featured
publicState
implementationState
runtimeType
previewMode
interaction[]
audio
mobilePolicy
sourceDriveId
provenanceState
```

Runtime/media URLs are added only after public approval.

## 14. Implementation sequence

### Phase A — scaffold
- architecture contract;
- experience manifest;
- no public route mutation.

### Phase B — gallery shell
- new Design World composition;
- Memory Field;
- desktop input engine;
- mobile drag/hold/snap engine;
- reduced-motion fallback.

### Phase C — runtime adapter
- poster → preview → full runtime lifecycle;
- iframe/native adapter boundaries;
- one-active-preview resource manager.

### Phase D — featured imports
- import exact reviewed runtimes one family at a time;
- fidelity/provenance gate for each.

### Phase E — LoveTree bot
- promote CODEX07 behavioral mechanics into global-guide adapter;
- retain source character-world runtime separately.

### Phase F — remaining archive
- map the remaining 88-family ledger into searchable/filterable public metadata;
- only publicize runtime status that has been proven.

## 15. Acceptance rules

```text
108_RECORDINGS_ARE_NOT_PUBLIC_PRODUCTS = YES
PUBLIC_INDEX_USES_NORMALIZED_FAMILIES = YES
SOURCE_CODEX_IDENTITIES_PRESERVED = YES
LARGE_MP4_IN_GIT = NO
ONE_ACTIVE_PREVIEW = YES
MOBILE_HOVER_DEPENDENCY = NO
SOURCE_PARITY_PRECEDES_REINTERPRETATION = YES
PADIEM_VISUAL_GRAMMAR_REMAINS_SHELL_AUTHORITY = YES
PRODUCTION_ROUTE_MUTATION_IN_PHASE_A = NO
```
