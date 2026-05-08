# Portfolio Cinematic Prompt Pack

Use this for phase 2 of the site. The goal is not a generic AI reel. The goal is a visual system that feels personal, technical, and credible.

## Visual Direction

Theme: `from lab bench to fabs to AI products`

Mood: calm, precise, cinematic, warm, curious.

Avoid: superhero poses, luxury offices, fake robots, company logos, sensitive factory details, dramatic cyberpunk overload, exaggerated self-praise.

Style language to use:

- warm hand-painted animated-film atmosphere
- soft watercolor light
- premium Apple product-page motion
- precise interface details
- Singapore-born builder energy
- calm technical worldbuilding

Style language to avoid:

- direct named-studio references
- anime cosplay
- fantasy office scenes
- fake robot assistants
- unreadable cyberpunk dashboards

Use two ingredient images first:

1. `Character image`: a consistent illustrated version of Haoming.
2. `World image`: the environment language for the site.

Then use both images as Veo ingredients for every clip.

## Nano Banana / Gemini Image Prompt 1: Character

Use the real portrait as reference.

```text
Create a polished editorial illustration of Haoming Koo, a Singapore-based AI engineer.
Keep the face identity close to the reference photo.
Professional but approachable expression.
Black blazer, clean shirt, modern technical founder energy.
Lighting is soft and cinematic.
Background is abstract, not a real office.
Add subtle visual hints of AI systems: small trace lines, retrieval nodes, evaluation ticks, and product interface glass layers.
No company logos.
No text.
No exaggerated muscles.
No sci-fi armor.
Style: premium product-launch illustration, Apple keynote still, Studio Ghibli warmth, clean modern web hero.
Aspect ratio 4:5.
High detail.
```

If a generator blocks named-studio wording, use this safer style line instead:

```text
Style: warm hand-painted animated-film portrait, soft watercolor lighting, premium product-launch still, clean modern web hero.
```

## Nano Banana / Gemini Image Prompt 2: World

```text
Create a cinematic world image for a personal AI engineering portfolio.
The story is: lab bench to semiconductor operations to production AI products.
Show a calm abstract landscape, not a literal factory.
Foreground: a clean path of connected nodes, specs, traces, validation gates, and product screens.
Middle ground: subtle silhouettes of lab glassware, wafer-like geometry, dashboards, maps, and search interfaces.
Background: warm dawn light over a modern technical city.
No brand logos.
No readable text.
No private diagrams.
No server-room cliches.
Style: premium Apple product page, cinematic editorial, soft depth, refined color, high trust, high craft.
Aspect ratio 16:9.
High detail.
```

## Veo / Google Flow Clip 1: Hero Landing

Use both ingredient images.

```text
8-second cinematic website hero loop.
The illustrated Haoming stands calmly in an abstract technical world.
Subtle camera push-in.
Soft green and blue light moves across floating traces, retrieval nodes, and validation checks.
Small interface panels form and dissolve behind him.
No readable text.
No logos.
No dramatic gestures.
No talking.
Mood: precise, warm, quietly confident.
Style: Apple product page motion, premium editorial, clean depth of field.
Output 16:9, high fidelity, loopable ending.
```

## Required Video Inventory

Generate these in order.

Do not generate everything at once. The first three assets decide the visual language.

### A. Ingredient Images

| Asset | Use | Ratio | Priority |
| --- | --- | --- | --- |
| `character-haoming.png` | Consistent illustrated identity | 4:5 | Must have |
| `world-lab-fab-ai.png` | Visual world and color system | 16:9 | Must have |
| `project-constellation.png` | Poster for project section | 16:9 | Nice to have |

### B. Core Site Videos

| File | Length | Ratio | Where it goes | Why |
| --- | ---: | --- | --- | --- |
| `hero-loop.mp4` | 8s | 16:9 | Hire page hero | First emotional hook |
| `operating-loop.mp4` | 8s | 16:9 | Operating Loop section | Shows your method |
| `project-constellation.mp4` | 8s | 16:9 | Selected Work intro | Makes projects feel alive |
| `private-work-safe.mp4` | 8s | 16:9 | Private work section | Shows agent planning safely |

### C. Project Card Videos

These are the most important for making the page feel interactive.

| File | Length | Ratio | Source | Motion |
| --- | ---: | --- | --- | --- |
| `job-hunter-card.mp4` | 5s | 16:9 | Real app capture preferred | Search to match to resume signal |
| `trader-koo-card.mp4` | 5s | 16:9 | Real app capture preferred | Dashboard review, source freshness, chart signal |
| `japan-seasons-card.mp4` | 5s | 16:9 | Real app capture preferred | Map pan, seasonal layer, MCP tool hint |
| `amex-explorer-card.mp4` | 5s | 16:9 | Real app capture preferred | Map/filter/source-review signal |
| `photo-compliance-card.mp4` | 5s | 16:9 | Real app capture preferred | Face landmark/rule checks, no real ID data |

### D. Optional Background Loops

Only generate these after the page works.

| File | Length | Use |
| --- | ---: | --- |
| `lab-to-ai-transition.mp4` | 8s | Story section |
| `eval-trace-loop.mp4` | 6s | LLM observability proof |
| `cta-system-loop.mp4` | 6s | Final CTA background |

## Veo / Google Flow Clip 2: Operating Loop

```text
8-second cinematic loop showing an AI system moving from ambiguity to reviewed output.
Four abstract stages appear as physical objects: spec, retrieve, orchestrate, verify.
A path of light connects them.
Data cards flow into a central workflow.
Validation gates light up only after checks pass.
Human review appears as a calm handoff moment, not a person typing frantically.
No readable text.
No logos.
No real company or factory details.
Style: Apple product visualization, elegant glass UI, cinematic lighting.
Output 16:9, loopable.
```

## Veo / Google Flow Clip 3: Project Constellation

```text
8-second cinematic loop.
Show five product worlds orbiting one builder identity:
job search, market review, Japan travel, source-backed benefits, and photo compliance.
Each world appears as a small abstract product surface.
Screens should feel real but contain no readable text.
The camera glides through the constellation.
Use warm depth, clean shadows, and precise motion.
No logos.
No fake testimonials.
No exaggerated claims.
Style: premium product launch, interactive portfolio, Apple-like pacing.
Output 16:9, loopable.
```

## Veo / Google Flow Clip 4: Private Work, Public-Safe

```text
8-second cinematic loop.
Visualize complex enterprise planning without revealing any real client or system.
Show a neutral planning board becoming a traceable workflow:
requirements, retrieval, tool calls, validation, human review, audit trail.
Use abstract shapes and safe synthetic UI.
No brand names.
No factory floor.
No proprietary diagrams.
No readable operational data.
Style: calm enterprise AI, precise, trustworthy, high-end product page.
Output 16:9, loopable.
```

## Kimi K2.6 Storyboard Critique Prompt

Use Kimi as the reviewer before spending generations.

```text
You are reviewing a cinematic portfolio storyboard for Haoming Koo.

Goal:
The website should help recruiters, AI teams, and clients understand that Haoming builds production LLM systems, RAG workflows, agent orchestration, evals, observability, and usable AI products.

Constraints:
- Do not expose sensitive client details.
- Do not imply any company approved public disclosure.
- Avoid generic AI visuals.
- Avoid self-praise.
- Keep the story credible and specific.
- Use short, readable copy.

Storyboard:
[paste the four Veo prompts here]

Critique the storyboard in three passes:
1. What feels generic or AI-slop?
2. What could create trust with recruiters?
3. What should be removed for safety or credibility?

Then rewrite the prompts to be cleaner, more cinematic, and safer.
```

## Frame Extraction After Video

After generating videos, export stills for fallback images and Open Graph cards.

```bash
ffmpeg -i hero-loop.mp4 -vf "fps=1,scale=1600:-1" frames/hero-%02d.jpg
ffmpeg -i operating-loop.mp4 -vf "select=eq(n\\,24),scale=1600:-1" -vframes 1 frames/operating-loop.jpg
ffmpeg -i project-constellation.mp4 -vf "select=eq(n\\,24),scale=1600:-1" -vframes 1 frames/project-constellation.jpg
```

## Best Phase 2 Website Use

- Use `hero-loop.mp4` only on the hire page hero.
- Keep a JPG poster fallback.
- Respect `prefers-reduced-motion`.
- Do not autoplay audio.
- Keep homepage lighter for performance and SEO.
- Reuse extracted stills as project story section backgrounds.
