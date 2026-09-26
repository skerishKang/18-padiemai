# LoveTree Design World V1

Status: **scaffold contract only** · tracks #34 / #75  
Source authority: Google Drive LoveTree SOURCE/CODEX folders  
Runtime/public route changes: **none**

## Purpose

LoveTree Design World is a source-first interactive archive. It must preserve the authored
SOURCE/CODEX identity and mechanics of each LoveTree work instead of flattening the works into
generic cards or treating an MP4 preview as the work itself.

This document defines the contract for the first V1 featured set. It does not authorize a public
runtime for any item.

## Authority order

1. **Drive SOURCE/CODEX folder** — authored source/master authority.
2. **Per-work canonical HTML/assets inside that folder** — UI/UX and interaction authority.
3. **GitHub registry contract** — identity, lifecycle and integration metadata only.
4. **PADIEM public route/media** — publication layer, never a replacement for source authority.

SOURCE/CODEX IDs are immutable identifiers. They must not be renumbered to match a gallery order.

## Runtime states

- **LIVE** — exact playable runtime whose public fidelity has been verified against source.
- **PREVIEW** — public or reviewable interaction that is intentionally incomplete relative to source.
- **VIDEO** — media evidence only; it is not a playable-source claim.
- **LAB** — experimental/internal integration.
- **HOLD** — source is registered, but no public runtime is authorized.

A work cannot move to LIVE merely because a video exists or because a route returns HTTP 200.

## V1 featured set

The registry contains exactly these 12 source families:

- SOURCE64 Welcome Orbit
- SOURCE58 Living Memory Pinboard
- SOURCE57 Living Glass Moment Card
- SOURCE56 Vertical Moment Network
- SOURCE60 3D Moment Cluster
- CODEX07 Living Character World
- CODEX18 Fragment Loader
- CODEX14 Rotating Memory Index
- CODEX13 Liquid Glass Infinite Video Wall
- CODEX15 Memory Biosphere
- SOURCE67 Memory Tape
- SOURCE72 Editorial Discovery Wall

All 12 Drive folder IDs were re-read successfully on 2026-09-26 before this contract was created.

CODEX14 is the only current item in this manifest with a public route. It remains **PREVIEW**, not
LIVE, because the current release intentionally defers the 85 shared C12 films and #73 is separately
hardening authored chrome fidelity.

## Interaction contract

Desktop intent:

- pointer/move where authored;
- scroll/wheel where authored;
- click/select/open;
- drag/pan/orbit where authored;
- keyboard parity when present in source;
- explicit user gesture before sound when audio exists.

Mobile intent:

- touch-first, never hover-only;
- tap/drag/hold/swipe/snap according to the authored mechanic;
- native proportions preserved;
- reduced rendering may change cost, not interaction meaning;
- no horizontal overflow caused by the gallery shell.

These are integration requirements, not permission to rewrite a source interaction into a different
metaphor.

## Runtime resource lifecycle

The gallery shell must eventually follow:

```text
poster/still
→ lightweight preview only after intent
→ one active preview maximum
→ full source runtime only after ENTER/open
→ teardown/pause when hidden or replaced
```

Large media is never committed to GitHub. Drive remains master authority; only approved public media
belongs on the production media origin.

## Fidelity boundary

Before an item can become LIVE:

1. re-read its current Drive source;
2. identify its canonical HTML/assets;
3. compare desktop and mobile interaction behavior;
4. preserve authored palette, typography, composition, controls and interaction metaphor;
5. add PADIEM attribution only under the archive attribution contract and only when it does not
   displace authored UI;
6. perform owner visual approval;
7. record exact public media dependencies and publication approval separately.

The registry is not fidelity evidence by itself.

## Registry contract

Canonical planning manifest:

`contracts/lovetree-experience-registry-v1.json`

Each item includes at least:

```text
id
namespace
sourceId
familyId
title
job
status
runtimeType
previewMode
interaction
audio
mobilePolicy
sourceDriveId
sourceDriveTitle
provenance
featured
```

The validation script:

`scripts/verify-lovetree-experience-registry.mjs`

fails closed on missing required fields, duplicate identities, SOURCE/CODEX ID drift, unverified
Drive provenance, unexpected featured count, or an unreviewed public-state expansion.

## Current publication boundary

This scaffold causes **no** public route, JavaScript runtime, media, R2, or Production mutation.

The next implementation slice under #34 should be a separately reviewed shell/resource-manager
preview. Individual source adapters should then be added one family at a time after a fresh source
audit.
