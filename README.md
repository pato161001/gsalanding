# GraySpark Audio — website

Static marketing site for GraySpark Audio. No build step, no dependencies to install:
every page is a self-contained HTML file with inline styles.

## Structure

```
index.html          Home
studio/             Studio services
ai-audio/           AI-leveraged music & sound design
voice-over/         Voice over
facility/           Our facility
blog/               Blog
pr/                 PR & awards
contact/            Contact
assets/             Photography
vendor/             support.js (render runtime), image-slot.js (image placeholders)
```

## Run locally

Paths are relative, so the pages open straight from disk. To exercise it the way a
host serves it:

```sh
cd site
python3 -m http.server 8080
# then open http://localhost:8080
```

Any static server works (`npx serve`, `caddy file-server`, etc.).

## Deploy

Publish the contents of `site/` as the web root. Works as-is on Netlify, Vercel,
Cloudflare Pages, S3/CloudFront, nginx, or GitHub Pages served from the repo root.
The folder-per-route layout gives each page its own directory, and relative asset
paths mean a subpath deploy (e.g. `user.github.io/grayspark/`) works without
changes.

Internal links point at `…/index.html` explicitly so the pages also work opened
straight from disk. If you want bare directory URLs (`/studio/`) in production,
strip the `index.html` from the `<a href>`s and the `href:` values in each page's
script block — every host resolves directory indexes on its own.

## Notes for developers

- Markup and styling are inline in each page; there is no shared stylesheet.
  Editing a page's copy or colors means editing that page.
- Page content and interactivity (service lists, work filters, packages, the hero
  video, modals) live in the `<script>` block at the bottom of each page as plain
  data arrays and handlers. Change copy there, not in the markup, where a value is
  rendered from a list.
- `vendor/support.js` is the small runtime that renders each page's template and
  logic. It is vendored deliberately so the site has no install step.
- Hero background videos are muted YouTube embeds, autoplayed while the hero is
  on screen. IDs are set per page via `heroVideoId`.
- Image placeholders (`<image-slot>`) mark spots awaiting final photography.
  Replace each with an `<img>` once real assets are ready.

## Outstanding

- Client logos in the brand marquee are wordmarks; real SVG logos still to drop in.
- Portfolio and facility photography still on placeholders.
