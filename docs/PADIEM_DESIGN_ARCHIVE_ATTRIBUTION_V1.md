# PADIEM Design Archive Attribution v1

Status: implementation authority for Issue #42

## 1. Purpose

PADIEM Design may eventually publish roughly 100 interactive works. Each work must preserve its own authored identity while still being recognizably part of PADIEM.

This document defines the shared attribution/frame layer for those works.

It is subordinate to `docs/PADIEM_VISUAL_GRAMMAR_V1.md`.

The intent is not to restyle every work into the PADIEM homepage. The intent is to add a restrained, reusable authorship/archive layer that identifies PADIEM without overpowering the work.

## 2. Core principle

```text
ARTWORK FIRST
PADIEM VISIBLE
PADIEM NOT DOMINANT
```

Rules:

- the work/product name remains the primary visual identity;
- PADIEM appears as maker/archive attribution;
- preserve original colors, typography, interaction, composition and media unless a separate redesign is explicitly approved;
- attribution should use small technical/editorial metadata rather than large corporate branding;
- do not force every work into an identical frame if that would damage its authored composition;
- reuse the same semantic attribution system even when exact placement changes by work.

## 3. Primary lockup — `<WORK> BY PADIEM`

Preferred pattern when the work already has a visible wordmark/name:

```text
LoveTree BY PADIEM
```

The work name owns hierarchy. `BY PADIEM` acts as a maker signature.

### Typography

- keep the work's existing wordmark/font when available;
- `BY PADIEM` should normally be smaller;
- uppercase is preferred for the attribution label;
- use restrained tracking / letter spacing;
- use a muted tone derived from the work when possible;
- avoid a divider when the two labels already read as one lockup.

### Alignment

The approved LoveTree pilot establishes this rule:

> The visible lower edges of the work name and `BY PADIEM` should align as one optical bottom line.

This is not merely `align-items:center` and should not be approximated by repeatedly pushing the attribution up/down with arbitrary transforms.

Preferred implementation model:

- work-name text and `BY PADIEM` share one bottom-aligned flex row;
- icons/marks may be vertically centered independently;
- both text labels use controlled line-height;
- apply at most a minimal final optical correction if the two fonts have materially different glyph metrics.

Acceptance:

```text
WORK_NAME_PRIMARY = YES
BY_PADIEM_ADJACENT = YES
BY_PADIEM_BOTTOM_EDGE_ALIGNED = YES
DIVIDER_REQUIRED = NO
```

## 4. Archive metadata

A work may expose restrained archive metadata such as:

```text
DESIGN ARCHIVE / STUDY 04    2026
```

The exact placement may vary by composition, but the metadata should remain secondary to the work.

Permitted fields include:

- `DESIGN ARCHIVE`
- `STUDY XX`
- year
- category / interaction family
- short state/status when meaningful

Do not turn this area into a full navigation/header unless the work itself requires it.

## 5. Archive signature

A secondary archive signature may appear near the bottom or another low-attention edge:

```text
PADIEM DESIGN ARCHIVE · 04 / MEMORY · MOTION · INTERACTION
```

Rules:

- small size;
- muted color;
- non-interactive unless a real archive destination exists;
- should not compete with the work controls or main copy;
- vocabulary may be tailored to the work.

## 6. About this work

An optional disclosure may expose provenance/context without cluttering the primary scene.

Suggested trigger:

```text
PADIEM / ABOUT THIS WORK
```

Suggested content:

- work title;
- one concise explanation of the interaction concept;
- `CREATED BY PADIEM`;
- `FOR <PRODUCT/CLIENT/PROJECT>` when applicable;
- year;
- archive/study index.

This panel is optional. Do not add it when the work already communicates sufficient provenance or when it damages interaction space.

## 7. Fidelity rule

PADIEM attribution must be minimally invasive.

Do not:

- replace the original work palette simply to match the PADIEM homepage;
- replace the original wordmark with a PADIEM font without explicit approval;
- change the interaction metaphor only to make the work feel more 'PADIEM';
- add large company copy over authored content;
- wrap the work in a generic browser frame, card shell or iframe presentation;
- convert a full-page authored experience into a small embedded demo;
- make PADIEM branding visually larger than the work identity by default.

The PADIEM Visual Grammar remains relevant, but should be expressed through restraint, hierarchy, metadata, typography discipline, negative space and motion rather than through forced skinning.

## 8. First reference implementation

### LoveTree — Living Media Sphere

Reference pilot:

```text
/design/living-media-sphere-padiem/
```

Source experience:

```text
/design/living-media-sphere/
```

Approved attribution direction:

#### Top-left

```text
LoveTree BY PADIEM
```

- existing LoveTree wordmark retained;
- `BY PADIEM` smaller and tracked;
- no separator line;
- both text labels aligned on the same visible lower edge;
- LoveTree remains dominant.

#### Top-right

```text
DESIGN ARCHIVE / STUDY 04    2026
```

#### Bottom archive signature

```text
PADIEM DESIGN ARCHIVE · 04 / MEMORY · MOTION · INTERACTION
```

#### Optional context

```text
PADIEM / ABOUT THIS WORK
```

The original sphere, media library, controls, motion system, hero typography and media remain the authored LoveTree experience.

## 9. Reuse across future works

For each new Design work, determine:

1. What is the work's existing primary identity?
2. Where can `BY PADIEM` appear without displacing that identity?
3. Can the product/work name and attribution use a bottom-aligned lockup?
4. Which archive metadata is actually useful?
5. Is an About panel needed?
6. Where can an archive signature live without colliding with native controls?
7. Does the change preserve the original interaction fidelity?

Do not solve these questions by blindly copying absolute pixel positions from LoveTree.

Reuse the **semantic contract**, not necessarily identical coordinates.

## 10. 100-work operating model

The common contract for a future archive work should be recorded as:

```text
WORK_SLUG=
WORK_TITLE=
SOURCE_AUTHORITY=
VISUAL_AUTHORITY=
PADIEM_ATTRIBUTION=YES/NO
BY_PADIEM_LOCKUP=YES/NO
ARCHIVE_INDEX=
YEAR=
CATEGORY=
ABOUT_PANEL=YES/NO
ORIGINAL_FIDELITY_PRESERVED=YES/NO
OWNER_VISUAL_APPROVAL=YES/NO
```

Each work remains independently authored while the archive develops a recognizable PADIEM authorship system.

## 11. Acceptance

```text
ARTWORK_IDENTITY_FIRST = YES
PADIEM_ATTRIBUTION_VISIBLE = YES
PADIEM_ATTRIBUTION_DOMINANT = NO
ORIGINAL_ARTWORK_FIDELITY_PRESERVED = YES
BY_PADIEM_BOTTOM_ALIGNMENT = YES_WHEN_APPLICABLE
ARCHIVE_META_AVAILABLE = YES
ABOUT_PANEL_OPTIONAL = YES
GENERIC_PORTFOLIO_SHELL = NO
REUSABLE_FOR_100_WORKS = YES
VISUAL_OWNER_REVIEW_REQUIRED = YES
```
