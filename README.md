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

## Safety notes

- Do not commit `.env`, local MCP configs, raw recordings, generated frames, or private design exports.
- Keep client names, internal screenshots, schemas, hostnames, and private tickets out of the public site.
- Use `haomingkoo@gmail.com` as the public contact email.
