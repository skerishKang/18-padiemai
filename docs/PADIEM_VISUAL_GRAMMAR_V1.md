# PADIEM Visual Grammar v1

Status: implementation authority for Issue #10

## 1. Canonical visual authority

The current `padiem.net` cinematic first screen is the primary public visual authority.

Do not treat the existing `/products/`, `/design/`, `/about/`, or `/contact/` legacy page shell as design authority.

The public identity must preserve the first-screen grammar:

- dark navy-black / graphite field around `#06080d`;
- pearl/frosted glass, not generic flat cards;
- white / silver primary typography;
- restrained PADIEM blue signal around `#88c9ff`;
- restrained warm-gold signal around `#efc984`;
- SUIT/SUITE + Manrope family;
- large editorial Korean typography;
- small mono/technical notation;
- thin translucent rules;
- large negative space;
- cinematic media as part of the composition;
- quiet, restrained motion.

The goal is not merely to copy colors. The composition and interaction hierarchy must remain recognizably PADIEM.

## 2. Evidence from existing PADIEM design work

### B62 Padiem Chat cinematic QA

The accepted continuity review records:

- homepage -> Padiem Chat brand continuity;
- `#06080d` dark cinematic field;
- pearl glass;
- `#88c9ff` blue signal;
- `#efc984` warm gold;
- editorial typography;
- thin translucent rules;
- restrained motion;
- explicit rejection of generic AI SaaS visual language.

This means the homepage is not an isolated marketing skin. It is already acting as a first-party PADIEM product-language authority.

### LoveTree / Memory Tape work

The Memory Tape design work establishes another PADIEM-family principle:

> interaction metaphor must be structurally credible, not merely decorated to resemble the metaphor.

The accepted direction is `MECHANICS FIRST -> VISUAL FIDELITY -> CONTENT`.

For homepage work this translates to:

- do not fake “cinematic” with gradients alone;
- layout, scrolling, depth and transition must support the concept;
- Products and Design should behave like exhibition scenes, not legacy cards with a cinematic background pasted behind them.

### LoveTree editorial archive work

The editorial archive work establishes:

- content should appear before UI chrome;
- native media ratio matters;
- different content deserves different scale;
- large and small surfaces should create editorial rhythm;
- negative space is active structure;
- avoid forcing every item into the same card frame;
- many-at-a-glance views can still be curated rather than dashboard-like.

For `padiem.net`, this means Products/Design scenes may use full-bleed media, asymmetric editorial layouts and different scene structures instead of repeated identical card rows.

## 3. Site information architecture

PADIEM uses three internal navigation grammars plus one external product exit.

### A. Home scroll narrative

```text
Hero
  -> Solutions
  -> Evolution
```

These remain a continuous vertical cinematic narrative on `/`.

### B. Primary cinematic destinations

```text
Products -> /products/
Design   -> /design/
```

These are independent URLs because they are expandable content worlds.

However:

```text
route changed
world did not change
```

The header, atmosphere, typography, signals, spacing and motion must remain in the same PADIEM visual world.

### C. Side information drawer

```text
Company
  -> Company
  -> Team
  -> Contact
```

Company/Team/Contact are information surfaces, not primary exhibition worlds. They should use the existing right-side pearl/frosted drawer language rather than navigate into generic standalone pages.

Direct `/about/` and `/contact/` URLs may remain for compatibility/SEO, but they are not primary visual-navigation authority and should eventually resolve into or faithfully reproduce the drawer experience.

### D. External product entry

```text
Padiem Chat -> https://chat.padiem.net
```

The public homepage must not revert to the Workers origin URL.

## 4. Global navigation contract

Recommended desktop navigation:

```text
PADIEM   Solutions   Evolution   Products   Design   Company        KO / EN   [Padiem Chat]
```

Rules:

- PADIEM logo -> `/`;
- Solutions -> `/#solutions`;
- Evolution -> `/#evolution`;
- Products -> `/products/`;
- Design -> `/design/`;
- Company -> right drawer;
- Padiem Chat -> `https://chat.padiem.net`;
- no separate Home label is required when the logo already owns Home;
- do not mix “About means page on one route, drawer on another”.

## 5. Products world

Products must be a cinematic exhibition, not a repeating left-right showcase template.

Primary public set:

1. Padiem Chat
2. StoryMemory
3. LoveTree
4. 단지온
5. AI 무료 레이더 (secondary / preparing)

Scene principle:

```text
one product = one authored scene
```

Each scene should combine:

- small technical index (`PRODUCT / 01`);
- a large editorial product statement;
- a media field or safe media placeholder;
- restrained status metadata;
- short, concrete product meaning;
- CTA only when the destination is public and approved.

Padiem Chat remains the clear live CTA.

Do not expose unfinished product URLs.

## 6. Design world

Design is not an agency portfolio. It is evidence of how PADIEM invents interaction structures.

Primary archive candidates:

- 사람별 기억책장
- LP 플레이어
- 메모리테이프
- 인피니트 비디오월
- 3D 기억책장
- 로테이팅 메모리 인덱스
- 모먼트 리빌

Each scene should answer:

1. What human memory/workflow/emotion is being organized?
2. What is the interaction metaphor?
3. What makes the structure specifically PADIEM-like?

Do not reduce these to a generic feature list.

Use varying scene scales, native media proportions and editorial rhythm where real media becomes available.

## 7. Company drawer

The right-side drawer is a first-party PADIEM pattern and should be retained/refined.

The Company surface should expose three internal destinations:

```text
01 COMPANY
02 TEAM
03 CONTACT
```

The current pearl panel language is appropriate:

- translucent pale surface;
- heavy blur;
- asymmetric rounded shape;
- strong dark/light contrast against the cinematic scene;
- no full-site context loss.

## 8. Explicit rejects

Do not use as the forward design system:

- legacy `PadiemAI` blue logo/header;
- generic blue SaaS navigation;
- identical card walls;
- alternating image-left/text-right template rows as the dominant page grammar;
- startup-template statistics or unverified claims;
- unrelated stock imagery;
- large MP4 binaries committed into the repository;
- generic About/Contact template pages as primary navigation destinations;
- restoring Hugo/PaperMod.

## 9. Implementation order

```text
1. lock Visual Grammar
2. unify global cinematic shell/navigation
3. rebuild Products as cinematic scenes
4. rebuild Design as cinematic exhibition scenes
5. refine Company drawer -> Company / Team / Contact
6. reconcile direct About/Contact URLs
7. add real media from approved YouTube/streaming sources
8. browser visual QA
9. production rollout
```

## 10. Acceptance

```text
HOME_CANONICAL_VISUAL_AUTHORITY = YES
GLOBAL_NAVIGATION_GRAMMAR = CONSISTENT
PRODUCTS = CINEMATIC_WORLD
DESIGN = CINEMATIC_WORLD
COMPANY_TEAM_CONTACT = SIDE_DRAWER
PADIEM_CHAT_PUBLIC_URL = https://chat.padiem.net
GENERIC_PADIEMAI_SHELL = NOT_AUTHORITY
CARD_WALL_AS_PRIMARY_GRAMMAR = NO
DRIVE_DESIGN_EVIDENCE_REVIEWED = YES
VISUAL_OWNER_REVIEW_REQUIRED = YES
```
