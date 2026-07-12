# CLAUDE.md — portfolio

Static HTML/CSS/JS site for **kooexperience.com** (Haoming Koo's recruiter-facing AI engineering portfolio), deployed via GitHub Pages. No build step, no framework, no package.json.

## Deployment

- Repo: `haomingkoo/haomingkoo.github.io` (GitHub Pages serves `main` directly).
- `CNAME` → `kooexperience.com`. `.nojekyll` disables Jekyll processing.
- No CI/CD workflow — pushing to `main` is the deploy. Follow the global rule: feature branch + PR, merge to main only on explicit confirmation.
- Local preview: `python3 -m http.server 4178`.

## Structure

- `index.html` — homepage (hero, live-app grid, architecture story, stats).
- `about.html` — full experience/education/awards.
- `hire.html` — recruiter-facing pitch page.
- `projects/*.html` — individual project case studies (Trader Koo, Japan in Seasons, Photo Compliance Studio).
- `blog/` — `index.html` + `posts/*.html` + `posts.json` (post index).
- `travel/` — `index.html` + `posts/*.html` (+ `.kml` route files) + `posts.json`; uses `_template.html` for new posts.
- `system/` — shared CSS bundle (`tokens.css`, `base.css`, `atmosphere.css`, `nav.css`); import order matters, `tokens.css` first. See `system/README.md`. `hire.html` and `travel/` haven't migrated to this system yet.
- `assets/` — images, OG images, cinematic clips, demo clips.
- `wmss.html`, `wine.html` — standalone one-off pages (`wine.html` is a redirect stub to MinMax Wine).

## Content sync (source of truth: `profile.json`)

After editing profile facts, run:
```
python3 sync_site_content.py          # regenerates SEO/crawlable content, sitemap.xml, feed.xml
python3 sync_profile_surfaces.py      # syncs github-profile-readme.md from profile.json
python3 sync_profile_surfaces.py --check   # CI-style drift check
```

## AI-discovery surfaces

`llms.txt`, `llms-full.txt`, `profile.json`, `sitemap.xml`, `feed.xml` — keep in sync with page content via the scripts above, not by hand-editing.

## Safety notes (from README.md)

- Never commit `.env`, local MCP configs, raw recordings, or private design exports (`previews/` is gitignored).
- Keep client names, internal screenshots, schemas, and hostnames off the public site.
- Public contact email is `haomingkoo@gmail.com` (not the personal one).

## New blog/travel post

Use `./new-post.sh` for blog posts; copy `travel/_template.html` for travel posts.
