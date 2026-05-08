# Portfolio V2 Animation Plan

Goal: make the site feel interactive and cinematic without turning it into a slow demo reel.

The baseline is now stable. V2 should add motion in layers. Every animated surface needs a static fallback, clear text, and a performance budget.

## Phase 2.1: Animated Project Cards

Start here.

This gives the biggest improvement with the lowest risk.

### What to Build

- Replace static project thumbnails with short hover previews.
- Keep the current PNG as the poster image.
- Add a 4- to 6-second muted loop for each top project.
- Play video only on hover or when the card enters focus.
- Respect `prefers-reduced-motion`.

### Top Project Order

1. Job Hunter SG
2. Trader Koo
3. Japan in Seasons
4. Amex Explorer
5. Photo Compliance Studio

### Asset Shape

```text
assets/projects/job-hunter.png
assets/projects/job-hunter.mp4
assets/projects/job-hunter.webm
assets/projects/trader-koo.png
assets/projects/trader-koo.mp4
assets/projects/trader-koo.webm
```

### Recording Prompt for Manual Captures

Use Playwright or browser screen recording:

```text
Record a 5-second product preview.
Show the actual app.
No fake data overlays.
No private information.
Use one calm interaction:
open, hover, filter, or inspect.
End close to the starting state so it can loop.
```

### Generated Video Prompt for Abstract Cards

Use only when a real product screen is not enough:

```text
Create a 5-second loopable product-card background.
It should feel like a real software workflow, not a fake sci-fi interface.
Use clean UI motion, cursor-free interaction, and subtle depth.
No readable private data.
No logos.
No fake user numbers.
No testimonials.
Style: premium portfolio project preview, Apple product-page pacing, restrained motion.
```

## Phase 2.2: Hero Video

Use this after project cards work.

### What to Build

- Add one hero loop on `hire.html`.
- Use `assets/hero/haoming-hero-poster.jpg` as fallback.
- Use `assets/hero/haoming-hero-loop.mp4`.
- Do not autoplay audio.
- Keep the current portrait card if video fails.

### Visual Theme

`from lab bench to fabs to AI products`

The hero should show identity and craft, not a fantasy scene.

Use the prompts in `portfolio-video-prompts.md`:

- Character image
- World image
- Hero Landing clip

## Phase 2.3: Scroll Story

Add only after the hero and cards are stable.

### Sections

1. Clarify
2. Ground
3. Orchestrate
4. Verify

### Interaction

- Scroll progress lights each stage.
- The system diagram updates as the user scrolls.
- Copy stays short.
- No hidden content. Animation is enhancement only.

### Implementation

- Use CSS and small vanilla JS first.
- Avoid a heavy animation framework unless needed.
- If we use a library later, prefer GSAP only for timeline control.

## Phase 2.4: Recruiter Mode

This is the differentiator.

### What to Build

Add a toggle on the hire page:

- `Recruiter`
- `AI team`
- `Client`

The page already has a role-fit selector. V2 should make it deeper:

- Swap proof points.
- Reorder project cards.
- Change the CTA copy.
- Keep URLs and metadata stable.

### Why It Matters

Different visitors scan for different signals.

Recruiters need fit fast.
AI teams need technical depth.
Clients need scope and handoff.

## Phase 2.5: AI Discovery and SEO Hardening

Do this after visual changes.

### Checks

- `profile.json` still matches the visible site.
- `llms.txt` and `llms-full.txt` are still clean.
- `robots.txt` allows useful AI crawlers.
- `sitemap.xml` includes profile and LLM files.
- Page title and H1 still include Haoming Koo where needed.

### Validation

```bash
python3 sync_site_content.py
python3 sync_profile_surfaces.py --check
python3 -m json.tool profile.json >/dev/null
npx -y playwright@latest screenshot --full-page --viewport-size=1440,1400 http://127.0.0.1:4173/hire.html /tmp/hire-v2.png
npx -y playwright@latest screenshot --full-page --viewport-size=390,1200 http://127.0.0.1:4173/hire.html /tmp/hire-v2-mobile.png
```

## Performance Budget

- Hero video poster under 250 KB.
- Hero video under 2.5 MB.
- Project preview video under 1 MB each.
- No more than one autoplaying video at a time.
- Static images must load if video is blocked.
- Lighthouse performance should stay above 90 on desktop.

## Suggested V2 Timeline

### Day 1

- Record or generate project-card loops.
- Add video hover component.
- Validate desktop and mobile.

### Day 2

- Generate hero ingredients and hero video.
- Add poster fallback.
- Validate motion and performance.

### Day 3

- Add scroll story interaction.
- Tune copy and spacing.
- Validate accessibility and reduced-motion mode.

### Day 4

- Add recruiter/AI team/client modes.
- Re-run sync and SEO checks.
- Deploy and compare analytics.

## Decision

Start with Phase 2.1.

The project cards are the fastest way to make the site feel alive. They also prove the apps are real.
