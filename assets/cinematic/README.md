# Cinematic homepage media

The homepage uses abstract ambient video only. Do not place important words inside the videos; all recruiter-facing claims live in HTML so search engines, screen readers, and LLM crawlers can read them.

## Current assets

- `hero-ambient-v2.webm` / `hero-ambient-v2.mp4` - dark aurora background for the default hero.
- `hero-ambient-v2-poster.jpg` - poster for the dark hero video.
- `hero-ambient-light.webm` / `hero-ambient-light.mp4` - lighter cobalt/cream background for the optional light theme.
- `hero-ambient-light.jpg` - poster for the light hero video.
- `signature-ink.webm` / `signature-ink.mp4` - abstract ink background for the workflow section.
- `signature-ink-poster.jpg` - poster for the workflow video.

## Rules

- Keep videos abstract: light, particles, ribbons, ink, grids, or atmosphere.
- No generated UI text inside video frames.
- No generated human faces in the hero.
- Keep MP4 and WebM under roughly 4 MB each where possible.
- Always provide a still poster.
- Respect `prefers-reduced-motion`; the page already hides videos for reduced-motion users.

## Next background prompt

Use this when regenerating the hero background in Veo, Kimi, or another video model:

```text
Create an 8-second seamless looping abstract background for a premium AI engineering portfolio. No people, no faces, no readable text, no logos, no watermark.

Visual direction: dark cobalt and near-black "signal observatory" atmosphere. Slow translucent data ribbons cross the frame like silk in water. Fine graph nodes and hairline connections appear faintly in the distance, then drift away. Subtle film grain, deep depth of field, restrained editorial lighting, expensive software-company launch feel. Keep the center-left darker so white serif typography remains readable. Keep the right side softly lit for a portrait cutout. 16:9, 4K, slow camera drift, seamless loop.

Avoid: cyberpunk neon, spaceships, UI dashboards, generated words, cartoon style, busy particles, glowing blobs, fantasy symbols, fake product screens, stock-photo people.
```
