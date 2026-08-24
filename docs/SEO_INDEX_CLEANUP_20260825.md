# PADIEM Search Index Cleanup — 2026-08-25

## Problem confirmed in Google Search Console

The canonical homepage and multiple legacy PadiemAI URLs were simultaneously indexed. Legacy URLs were still being crawled successfully because the Netlify build published the old Hugo/static site alongside the new cinematic homepage.

## Intended production state

- `https://padiem.net/` is the only sitemap URL and canonical homepage.
- Legacy homepage aliases (`/index1`, `/index1.html`, `/html/index1*`) permanently redirect to `/`.
- Legacy Company, Team, Contact, AI technology, and service pages that were consolidated into the cinematic homepage permanently redirect to `/`.
- Removed legacy pages without a current equivalent return a real HTTP 404 with a `noindex` 404 page.
- The Netlify publish directory is rebuilt from scratch and contains only the cinematic homepage, required assets, SEO files, redirects, and verification files.

## Verification gates before production

1. Build succeeds from a clean checkout.
2. `/` returns HTTP 200 and preserves the cinematic UI/interactions.
3. `/index1`, `/index1.html`, `/html/index1.html`, and `/html/pages/about/team` resolve through HTTP 301 to `/`.
4. `/html/pages/success/manufacturing` and `/html/pages/success/security` return HTTP 404.
5. `/robots.txt` returns HTTP 200 and references `https://padiem.net/sitemap.xml`.
6. `/sitemap.xml` returns HTTP 200 and contains only `https://padiem.net/`.
7. The homepage contains the production title and `rel=canonical` pointing to `https://padiem.net/`.
8. After production deploy, re-run Google URL Inspection for the canonical and sampled legacy URLs.
