# Haoming Koo portfolio

Source for [kooexperience.com](https://kooexperience.com), a recruiter-facing AI engineering portfolio.

The site is built to make the proof easy to inspect: live apps, project screenshots, structured profile data, `llms.txt`, and a clear hiring path.

## What this site shows

- 8 live AI applications across job search, market research, travel intelligence, data quality, and source-backed search.
- A premium landing page that shows the working pattern behind the projects: inputs, tools, evals, review, and usable product UX.
- Search and AI-discovery surfaces: JSON-LD, `profile.json`, `llms.txt`, `llms-full.txt`, `sitemap.xml`, and RSS.

## Local preview

```bash
python3 -m http.server 4178
```

Open `http://127.0.0.1:4178/`.

## Demo recording

The app-demo recorder uses Playwright to capture short clips from the live apps:

```bash
python3 scripts/record_app_demos.py all --mp4
```

Raw clips go to `previews/demo-clips/`, which is ignored by git. Keep final public assets under `assets/`.

## Content sync

`profile.json` is the canonical profile source. After changing public profile facts, run:

```bash
python3 sync_site_content.py
python3 sync_profile_surfaces.py
python3 sync_profile_surfaces.py --check
```

## Portfolio chat

The chat widget calls a small Cloudflare Worker. It ranks sections from the public `llms.txt`, sends only the strongest source-linked evidence to SEA-LION, rejects unsupported questions, and derives citations from the retrieved chunks.

```bash
npx wrangler secret put SEALION_API_KEY
npx wrangler deploy
```

Set the deployed URL in the `portfolio-chat-endpoint` meta tag in `index.html`. Query `/v1/models` with the SEA-LION key before changing `SEALION_MODEL` in `wrangler.jsonc`.

Production chat is served at `https://chat.kooexperience.com`; the portfolio itself remains on GitHub Pages.

Worker Logs are enabled for private operational checks. Application events record status, latency, response length, and retrieved chunk IDs, but not the question or answer. Cloudflare's private request envelope still contains normal network metadata.

Run the production grounding and abuse suite without caching:

```bash
node --test worker/retrieval.test.mjs
PROMPTFOO_DISABLE_TELEMETRY=1 npx promptfoo@0.122.0 eval \
  -c evals/promptfooconfig.yaml --no-cache \
  --output .private/evals/latest.json
```

## Safety notes

- Do not commit `.env`, local MCP configs, raw recordings, generated frames, or private design exports.
- Keep client names, internal screenshots, schemas, hostnames, and private tickets out of the public site.
- Use `haomingkoo@gmail.com` as the public contact email.
