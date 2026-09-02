# PADIEM Website

`18-padiemai` is the source repository for the live `padiem.net` homepage.

## Current production path

This project is **not** a Hugo/PaperMod site in the active deployment path.

Netlify builds the current cinematic homepage with:

```toml
[build]
  publish = "public"
  command = "node scripts/build-cinematic-site.mjs"
```

The build script uses:

```text
static/html/index1.html  ->  public/index.html
static/css/**            ->  public/css/**
static/js/**             ->  public/js/**
static/images/**         ->  public/images/**
```

## Active source files

```text
static/html/index1.html          # main cinematic homepage source
static/css/padiem-cinematic-*.css
static/js/padiem-cinematic-*.js
static/images/**
scripts/build-cinematic-site.mjs
netlify.toml
robots.txt
sitemap.xml
googlef7d3aa2eaecfa367.html
naver973c7ccb11cec92fb48885106f1bf365.html
```

## Deployment

```text
GitHub push
-> Netlify build
-> public/
-> padiem.net
```

## Legacy Hugo cleanup

The earlier Hugo/PaperMod experiment has been moved out of the repository root to avoid confusing future work.

Archived location:

```text
backup/hugo-legacy-20260902/
```

Archived items:

```text
config.toml
content/
themes/
.hugo_build.lock
.gitmodules
```

Do not use `content/products`, `content/design`, or `config.toml` for the current live homepage.

## Planned homepage direction

The current live site is a cinematic single-page PADIEM homepage. New public work should extend that surface, not revive the Hugo blog structure.

Recommended next sections:

```text
Products  # product demo video showroom
Design    # design/showreel video album
```

Product and design media should be embedded from YouTube or another streaming host. Do not commit large MP4 files directly into this repository unless explicitly approved.

## Source of truth policy

- GitHub is the durable code ledger.
- Google Drive synced folder is an indirect local sync surface.
- The current live homepage source is `static/html/index1.html`.
- `public/` is generated output for Netlify publish.
- Legacy Hugo files are archival only.
