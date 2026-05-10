# App demo recording workflow

Short product clips will make the portfolio feel more real than static screenshots. The goal is to show the apps responding to real interactions: search, filters, maps, charts, and review flows.

## What to record

- `portfolio`: cinematic landing page scroll.
- `job`: Job Hunter SG onboarding and resume/job workflow.
- `trader`: Trader Koo chart and market workflow.
- `trader-paper`: Trader Koo paper-trade review workflow.
- `seasons`: Japan in Seasons map search.
- `amex`: Amex Explorer filtering and map/table flow.

## Record clips

From the portfolio repo:

```bash
python3 scripts/record_app_demos.py all --mp4
```

Or record one app:

```bash
python3 scripts/record_app_demos.py trader --mp4
```

Outputs go to `previews/demo-clips/<timestamp>/`. That folder is ignored by git so raw takes do not bloat the repo.

## Editing rule

Use recorded clips as proof, not decoration:

- Keep clips under 8 seconds.
- Crop out slow loading or empty states.
- Add captions in HTML or the video editor, not through AI generation.
- Prefer one clear action per clip.
- Show real app URLs and real UI behavior.

## Suggested final reel

1. Hero animation: messy workflows become AI products.
2. Job Hunter SG: search roles, score/resume workflow.
3. Trader Koo: chart signal flow.
4. Trader Koo paper: simulated trade review flow.
5. Japan in Seasons: map search and seasonal layer.
6. Amex Explorer: filter venue, source-backed table/map.
7. End card: 8 live apps, GitHub, email.
