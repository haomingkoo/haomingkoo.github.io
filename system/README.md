# /system/ — Shared CSS bundle

Design system source of truth. All pages should import these files via `<link>` tags.
Complex page-specific styles and behavior live in matching files under
`/assets/styles/` and `/assets/scripts/`; HTML stays focused on content and
semantics.

## Files

| File | Purpose |
|------|---------|
| `tokens.css` | Light + dark CSS custom properties (colors, fonts, easing, max-width) |
| `base.css` | Reset, base body styles, `::selection`, anchor inheritance |
| `atmosphere.css` | Grain overlay and scroll progress bar |
| `nav.css` | Top navigation bar, clock pill, theme toggle |

## Required font imports (in `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

## Required import order

```html
<link rel="stylesheet" href="/system/tokens.css" />
<link rel="stylesheet" href="/system/base.css" />
<link rel="stylesheet" href="/system/atmosphere.css" />
<link rel="stylesheet" href="/system/nav.css" />
```

`tokens.css` must come first — every other file references its custom properties.

## Pages currently consuming

- `/index.html` — homepage
- `/about.html` — about + experience
- `/blog/index.html` — blog index

`/travel/` keeps a separate visual language.

## Project structure

Homepage-specific features stay out of the shared design system:

| Path | Purpose |
|------|---------|
| `/assets/styles/` | Feature CSS for the hero, galleries, and chat launcher |
| `/assets/scripts/` | Browser behavior for motion, galleries, and chat |
| `/assets/images/projects/<project>/` | Reviewed product screenshots grouped by app |
| `/assets/images/portraits/` | Source and alternate portrait treatments |
| `/worker/` | Portfolio chat endpoint and retrieval logic |
| `/evals/` | Retrieval, grounding, and safety evaluations |
| `/.private/` | Ignored screenshots, raw eval output, and design audit notes |

The root `package.json` contains verification commands only. The public site
remains static and has no frontend build step.

Keep matching CSS and JavaScript module names together, for example
`hero-atmosphere.css` and `hero-atmosphere.js`. Public screenshots belong under
the project they document; generated people and fake application screens do not.

The homepage entry pair is `home.css` and `home.js`. Smaller interactive modules
such as `project-gallery` and `chat` keep their own pair so they can be changed or
tested without opening the page entry module.
