# CLAUDE.md — portfolio

## Run and test
- Static site, no build step. Preview: `python3 -m http.server 4178`.
- `npm test` (worker retrieval tests), `npm run check:js`, `npm run check:worker` (wrangler dry run).
- No PR CI. Workflows are monitors only: `Uptime` (every 15 min, `uptime/endpoints.json`) and `Rendered pages` (every 6 h, `uptime/rendered_sites.json`). Both open issues on failure. Add new app subdomains to those files.

## Deploys
- GitHub Pages (legacy build) serves `main` at `/`. A merge is a deploy.
- The chat Cloudflare Worker (`worker/`, `wrangler.jsonc`) deploys manually with `npx wrangler deploy`. It bundles `llms.txt` at deploy time, so `llms.txt` edits reach the chat only after a redeploy.
- Check SEA-LION `/v1/models` before changing `SEALION_MODEL` in `wrangler.jsonc`.

## Content
- `python3 sync_site_content.py` regenerates the blog and travel archive blocks, `sitemap.xml` and `feed.xml` from `blog/posts.json` and `travel/posts.json`. Run it after adding a post.
- `python3 sync_profile_surfaces.py` writes the GitHub profile README (default `../haomingkoo/README.md`) from `profile.json`. `--check` reports drift.
- `llms.txt` and `llms-full.txt` are hand-maintained. Keep them consistent with page content.
- New posts: `./new-post.sh` (blog or travel) creates the file, updates `posts.json` and runs the sync. Re-run the sync after editing title or excerpt.
- `system/` CSS: load `tokens.css` first. See `system/README.md`.

## Safety
- Never commit `.env`, local MCP configs, raw recordings or private design exports (`previews/` is gitignored).
- Keep client names, internal screenshots, schemas and hostnames off the public site.
- Public contact email is `haomingkoo@gmail.com`.
