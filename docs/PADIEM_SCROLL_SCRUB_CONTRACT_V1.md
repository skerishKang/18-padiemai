# PADIEM Scroll-Scrub Interaction Contract v1

Authority issue: #10

## Why this exists

PADIEM's cinematic identity is not only a palette, typography system, or frosted-glass treatment.
The homepage uses scroll as a timeline controller: the visitor moves through the page and the fixed background visual advances with that movement.

This is a core interaction rule.

```text
scroll position
→ normalized progress
→ smoothed cinematic timeline
→ background video currentTime
→ foreground scene change
```

The visitor should feel that they are advancing through one continuous PADIEM scene, not scrolling past static cards.

## Canonical behavior

Home already implements this principle with a fixed full-viewport video layer and scroll-linked seeking.
Products and Design must preserve the same interaction grammar.

Required:

- fixed full-viewport cinematic background layer;
- background media remains behind foreground copy and scene structures;
- vertical scroll drives media timeline rather than autonomous playback;
- seeking is smoothed so the background does not jitter on wheel/touch input;
- progress line and background timeline derive from the same page-scroll progress;
- foreground sections may be full-height scenes, but must not become independent generic cards;
- if media fails, a dark PADIEM atmospheric poster/gradient remains as fallback;
- `prefers-reduced-motion` disables the moving video surface and keeps a static fallback;
- large video binaries are not committed to this repository.

## Public worlds

```text
/           Home cinematic narrative
/products/ Products cinematic world
/design/   Design cinematic world
```

All three should feel like one brand environment.

Rule:

```text
route changed
world did not change
```

## Current media policy

Until a dedicated approved Products or Design background sequence exists, the approved homepage cinematic video may be reused as the shared corporate scroll-scrub background.

Per-world media can later override the default through:

```html
<body data-world-scroll-video="https://approved-media.example/video.mp4">
```

The interaction engine must remain the same even when the media source changes.

## Runtime

Shared runtime:

```text
static/js/padiem-scroll-scrub-v1.js
```

Canonical build injects this runtime into Products and Design outputs.

## QA

A Products/Design PR is not visually complete unless the following pass:

```text
SCROLL_SCRUB_BACKGROUND = PASS
BACKGROUND_FIXED = PASS
SCROLL_DRIVES_VIDEO_TIME = PASS
AUTOPLAY_INDEPENDENT_OF_SCROLL = NO
FOREGROUND_READABILITY = PASS
MOBILE_SCROLL = PASS
REDUCED_MOTION_FALLBACK = PASS
MEDIA_FAILURE_FALLBACK = PASS
```

A static gradient-only background may be used only as failure/reduced-motion fallback, not as the normal final interaction surface.
