# /system/ — Shared CSS bundle

Design system source of truth. All pages should import these files via `<link>` tags.
Page-specific styles stay inline in each HTML file.

## Files

| File | Purpose |
|------|---------|
| `tokens.css` | Light + dark CSS custom properties (colors, fonts, easing, max-width) |
| `base.css` | Reset, base body styles, `::selection`, anchor inheritance |
| `atmosphere.css` | Grain overlay, cursor ring, cursor light, scroll progress bar, shared keyframes |
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

## Pages pending migration

- `/hire.html` — separate visual language; migrate in a follow-up
- `/travel/` — separate visual language; migrate in a follow-up
