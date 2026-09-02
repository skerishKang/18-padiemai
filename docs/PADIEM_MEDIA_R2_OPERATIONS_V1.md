# PADIEM Media R2 Operations v1

Status: **PRODUCTION MEDIA GATE**  
Canonical tracking issue: **#17**  
Repository: `skerishKang/18-padiemai`

## 1. Purpose

PADIEM uses Cloudflare R2 as the media origin for short Product/Design videos while keeping the public homepage on Netlify. This document defines the operating boundary required before any production page references an R2-hosted video.

The priority order is:

1. **Homepage availability**
2. **Cost safety / abuse containment**
3. **Media availability**

If media traffic becomes abnormal or spend risk appears, disable media delivery first. Do not allow a media incident to take down `padiem.net`.

## 2. Authority and hosting split

- `padiem.net` — Netlify homepage/application surface
- `media.padiem.net` — Cloudflare custom domain for public media delivery
- R2 bucket — media origin only
- GitHub — source and operating contracts only; large MP4 masters are not stored in the repository
- Google Drive — original/master media archive
- YouTube — optional promotional or fallback distribution, not the primary production asset origin under this contract

Target R2 bucket name: `padiem-media`.

## 3. Public access boundary

Production media must not use an `*.r2.dev` public URL.

Required state:

```text
R2_PUBLIC_R2DEV = OFF
MEDIA_CUSTOM_DOMAIN = media.padiem.net
```

The custom domain is required so that Cloudflare cache/WAF/rate-limit controls can sit in front of the R2 origin.

## 4. Object naming and immutability

Media URLs are versioned by filename rather than query string.

Examples:

```text
/design/orbitmorph-v1.mp4
/design/emotion-path-helix-v1.mp4
/design/rotating-memory-index-v1.mp4
/design/living-media-sphere-v1.mp4
```

A changed asset receives a new versioned filename (`-v2`, `-v3`, etc.). Existing public objects are treated as immutable.

This enables long cache TTLs without relying on query-string cache busting.

## 5. Cache policy

The production requirement is to maximize CDN cache hits and minimize R2 origin reads.

For media routes such as `/design/*` and `/products/*`:

- mark eligible media responses for CDN caching;
- use a long edge TTL appropriate for immutable versioned objects;
- ensure query strings do not fragment the cache key for these media objects;
- do not build application behavior that depends on media query-string variants;
- enable Smart Tiered Cache for the R2 custom domain if available and compatible with the account/plan.

The operational acceptance field is:

```text
CDN_CACHE = ON
QUERY_CACHE_BUST_GUARD = ON
SMART_TIERED_CACHE = ON | NOT_AVAILABLE
```

## 6. Range requests

Browser video playback may use HTTP Range requests. Cost or abuse controls must not break ordinary playback, seek, replay, or mobile inline playback.

Before production integration:

- confirm MP4 playback works through `media.padiem.net`;
- confirm ordinary Range requests return correctly;
- confirm rate-limit rules do not block normal playback behavior.

Acceptance:

```text
NORMAL_VIDEO_RANGE = PASS
```

## 7. Abuse and rate limiting

A repeated loop of the same cached media object is not by itself a reason to block a user. The main abuse case is a client generating unusually high request rates, repeated Range churn, or cache-busting requests intended to increase origin reads.

Apply a Cloudflare WAF/rate-limit rule to public media paths with a deliberately generous threshold that allows normal browser playback and seeking.

The rule must be validated with a small deterministic smoke test. Do not perform load testing or simulate a real denial-of-service attack.

Acceptance:

```text
RATE_LIMIT = ON
NORMAL_VIDEO_RANGE = PASS
```

## 8. Emergency media kill switch

An emergency rule must exist or be ready to activate that blocks only public media paths, for example:

```text
media.padiem.net/design/*
media.padiem.net/products/*
```

The kill switch is for abnormal usage, suspected abuse, or unexpected billing risk.

Activation policy:

1. block or disable public media delivery;
2. leave `padiem.net` running;
3. show the normal poster/fallback UI instead of failing the page;
4. inspect R2/Cloudflare usage before restoring media.

Acceptance:

```text
EMERGENCY_MEDIA_BLOCK = READY
HOMEPAGE_SURVIVES_MEDIA_FAILURE = YES
```

## 9. Homepage fallback contract

The homepage must never require a successful video response in order to render the page or navigate the site.

Every public video exhibit must have a first-party static fallback that does not depend on the R2 media origin. JavaScript should treat video loading/playback failure as a non-fatal state.

Expected behavior:

- video unavailable → fallback remains visible;
- media custom domain unavailable → page remains usable;
- media emergency block active → page remains usable;
- `prefers-reduced-motion` → static/reduced-motion presentation is used without requiring video playback.

The fallback may be lightweight HTML/CSS rather than a separate image object. A poster hosted only on the same R2 origin does **not** satisfy the independent-fallback requirement by itself.

## 10. Billing and budget alerts

Cloudflare budget alerts are informational controls, not a hard billing cap. They do not replace cache, rate-limit, or emergency shutdown controls.

Required operations:

- configure a low/appropriate budget alert for the account;
- review R2 storage, Class A operations, and Class B operations monthly;
- if usage moves unexpectedly, investigate before adding more media or increasing traffic exposure;
- never treat the R2 free tier as a guaranteed hard-stop boundary.

Acceptance:

```text
BUDGET_ALERT = ON | EXISTING | MANUAL_REQUIRED
MONTHLY_USAGE_REVIEW = DOCUMENTED
```

## 11. Monthly review checklist

At least once per month while R2-hosted public media is active, review:

- R2 stored GB-month;
- Class A operations;
- Class B operations;
- unusual request spikes;
- cache effectiveness / unexpected cache misses;
- WAF/rate-limit events that might indicate abuse;
- whether emergency block readiness is still valid;
- whether media inventory is still intentional and in use.

If a public asset is no longer used, retire it from the public media inventory rather than accumulating unused production objects indefinitely.

## 12. Initial Design media inventory

The first approved Design candidates are:

1. OrbitMorph Portal — approximately 17.8 s
2. Emotion Path Helix — approximately 17 s
3. Rotating Memory Index — approximately 17 s
4. Living Media Sphere — approximately 20 s

Homepage behavior target:

- muted;
- `playsinline`;
- loop where appropriate;
- load/play only when the exhibit is near/in the viewport;
- pause when out of view;
- independent first-party static fallback always present.

Final media object names and checksums are recorded at upload/integration time; they are not embedded in this operations contract in advance.

## 13. Production integration gate

No production Design/Product page may reference `media.padiem.net` until the following is accepted against current infrastructure:

```text
R2_PUBLIC_R2DEV = OFF
MEDIA_CUSTOM_DOMAIN = media.padiem.net
CUSTOM_DOMAIN_STATUS = ACTIVE
CDN_CACHE = ON
QUERY_CACHE_BUST_GUARD = ON
RATE_LIMIT = ON
NORMAL_VIDEO_RANGE = PASS
EMERGENCY_MEDIA_BLOCK = READY
HOMEPAGE_SURVIVES_MEDIA_FAILURE = YES
BUDGET_ALERT = ON | EXISTING | MANUAL_REQUIRED_ACCEPTED
MONTHLY_USAGE_REVIEW = DOCUMENTED
PRODUCTION_MEDIA_LINK = ALLOWED
```

If any safety-critical item fails, disposition is:

```text
HOLD_R2_PRODUCTION_MEDIA_INTEGRATION
```

## 14. Change control

Changes to R2 bucket exposure, custom-domain routing, cache-key behavior, WAF/rate limits, billing safeguards, or emergency behavior are operational changes and must be reflected in Issue #17 or a successor canonical issue before production rollout.

Do not weaken a cost-safety control merely to keep videos playing. Media availability is deliberately the lowest-priority item in the failure hierarchy.
