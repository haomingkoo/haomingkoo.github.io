# Cinematic landing page storyboard

The homepage should make a recruiter feel this quickly:

> Haoming turns messy real-world work into shipped AI products.

The creative direction is **AI alchemist / magical engineer**, not a literal sci-fi dashboard. It should feel warm, cinematic, intelligent, and memorable. The character can resemble Haoming if a reference photo is provided, but the final result should still look professional enough for a recruiter-facing AI engineering portfolio.

## Storyline

1. Haoming is working late in a warm studio. Messy inputs float around the desk: job posts, market signals, maps, source documents, workflow tickets, and code notes.
2. He gestures over the desk. Thin glowing threads connect the fragments.
3. The fragments organize into an AI system layer: RAG, tools, evals, guardrails, observability, and human review.
4. The system resolves into four live product windows: Job Hunter SG, Trader Koo, Japan in Seasons, and Amex Explorer.
5. The final frame gives the recruiter the proof: 8 live apps, 7 years of systems experience, AI Singapore, and a clear contact path.

## Output files

Use these exact filenames so the landing page can pick up the generated assets without code changes:

- `assets/cinematic/keyframe-01-ai-alchemist.png`
- `assets/cinematic/keyframe-02-live-products.png`
- `assets/cinematic/kooexperience-scroll-reel.mp4`

## Image generation settings

Use these settings before the prompt whenever the tool supports them:

- Aspect ratio: `16:9`
- Orientation: landscape, website hero background
- Preferred size: `3840x2160`, `2560x1440`, or `1920x1080`
- Do not generate a poster, portrait, phone wallpaper, book cover, or vertical frame.
- Avoid large rendered text inside the image. The website will overlay the real text in HTML so spelling stays correct.

If the model ignores the setting, start the prompt with:

```text
WIDE LANDSCAPE WEBSITE HERO, 16:9 ONLY. Not portrait. Not vertical. Not poster art.
```

## If using a photo reference

Add this block to both image prompts:

```text
Use the provided photo only as a light likeness reference for Haoming Koo.
Keep the resemblance recognizable but tasteful.
Do not make a caricature.
Do not copy the exact photo pose, outfit, lighting, or background.
Render him as a modern AI engineer in a warm cinematic animated-film style.
```

## Static keyframe 1

Use this prompt in Nano Banana or another image model.

```text
WIDE LANDSCAPE WEBSITE HERO, 16:9 ONLY. Not portrait. Not vertical. Not poster art.

Create a premium cinematic animated-film hero keyframe for a recruiter-facing AI engineering portfolio.

Concept:
AI alchemist / magical engineer. Haoming is a calm modern AI engineer working late in a warm studio. He is not wearing a wizard costume. He looks focused, capable, and grounded.

Scene:
Haoming sits at a large wooden desk with a laptop, notebook, and clean technical tools. Around him, messy real-world inputs float in the air: job posts, market charts, map pins, source documents, workflow tickets, and code notes.

Magical realism:
As Haoming raises one hand over the desk, thin glowing threads connect the fragments. The fragments begin sorting themselves into a clean system. The moment should feel like craft, intelligence, and problem-solving, not random fantasy magic.

Subtle system layer:
Show small elegant UI chips or symbols for:
RAG
Tools
Evals
Guardrails
Human Review

Mood:
Warm, cinematic, imaginative, premium. Hand-painted animated-film feeling with beautiful lighting and depth. Professional enough for a serious AI engineering portfolio. The composition should feel memorable, not childish.

Composition:
Wide 16:9 landscape frame. Leave clean negative space for website hero copy. Keep Haoming and the glowing transformation as the focal point. Avoid clutter.

Text:
Do not render large hero text in the image. The website will overlay the real text in HTML.

Avoid:
direct Studio Ghibli imitation, Detective Conan imitation, childish wizard hat, fantasy robe, wand, cyberpunk city, robots, generic AI brain, fake company logos, fake money, fake trading profits, crowded dashboard UI, watermark, sparkle icon.
```

## Static keyframe 2

Use this prompt in Nano Banana or another image model.

```text
WIDE LANDSCAPE WEBSITE HERO, 16:9 ONLY. Not portrait. Not vertical. Not poster art.

Create the final keyframe for the same cinematic animated-film AI engineering portfolio story.

Concept:
The messy fragments have transformed into a beautiful organized AI product system around Haoming.

Scene:
Haoming stands or sits calmly at the center of the warm studio. Around him are four polished floating product windows. They should look like refined software products, not fake noisy dashboards.

Product windows:
1. Job Hunter SG: resume scoring, RAG matching, fact-checked edits.
2. Trader Koo: market research, source freshness, paper-trade audit trail.
3. Japan in Seasons: map intelligence, MCP tools, seasonal signals.
4. Amex Explorer: source-backed benefit search, stale-source checks.

Subtle architecture path:
Show a clean visual path behind the product windows:
Inputs -> Retrieval -> Tools -> Evals -> Human Review -> Live Product

Mood:
Warm, cinematic, elegant, magical realism, premium software portfolio. It should feel like the satisfying final moment where chaos becomes order.

Composition:
Wide 16:9 landscape frame. Product windows should have depth, spacing, and a clear hierarchy. Leave enough negative space for website overlay text.

Text:
Avoid large rendered text. Tiny abstract product labels are okay, but spelling must not dominate the image.

Avoid:
direct Studio Ghibli imitation, Detective Conan imitation, childish fantasy, wizard hat, wand, robots, people crowd, fake company logos, fake performance charts, fake trading profits, excessive glow, watermark, sparkle icon.
```

## Video prompt for Google Veo or Kimi 2.6

Use keyframe 1 as the first frame and keyframe 2 as the final frame.

```text
Create a 10-second cinematic animated-film style portfolio video.

Use the first provided image as the opening frame and the second provided image as the ending frame.

Story:
0-2s: Haoming works at a warm studio desk surrounded by messy floating inputs: job posts, market charts, map pins, source documents, workflow tickets, and code notes.
2-4s: He gestures over the desk. Thin glowing threads connect the fragments. The messy inputs begin sorting themselves.
4-6s: The fragments form an AI system layer with elegant labels: RAG, Tools, Evals, Guardrails, Human Review.
6-8s: Four polished product windows unfold around him: Job Hunter SG, Trader Koo, Japan in Seasons, Amex Explorer.
8-10s: The scene resolves into a calm final composition. The website will overlay the real text, so keep the video mostly visual.

Motion:
Smooth camera push, gentle parallax, warm light, floating papers transforming into clean UI panels, elegant glowing threads, no frantic motion.

Style:
Premium cinematic animated-film look, magical realism, professional AI portfolio, warm studio lighting, clean composition, tasteful and memorable.

Brand and safety constraints:
Do not show Binance, Micron, AI Singapore, OpenAI, Google, or any other company logo.
Do not show fake trading profits, fake portfolio values, fake user counts, fake testimonials, or fake exchange execution.
Do not use robots, generic AI brain imagery, company logos, or copied anime/franchise styling.

Output:
16:9 landscape, 1920x1080 or 3840x2160, 10 seconds, silent MP4.
```

## Final one-more-try video prompt

Use this if the generated video has misspelled labels. This version avoids text inside the video and leaves the real words to the website HTML.

```text
Create an 8-10 second cinematic animated-film style portfolio video.

Use the first provided image as the opening style/reference frame and the second provided image as the final style/reference frame.

MOST IMPORTANT:
Do not render any readable words, labels, names, letters, paragraphs, headings, or UI text inside the video.
If the reference images contain words, convert them into abstract grey placeholder lines, icons, chips, and shapes.
The website will overlay all real text in HTML after the video is generated.

Story:
0-2s: A modern AI engineer works late in a warm studio. Messy floating inputs surround the desk: documents, charts, maps, tickets, and code notes. These should be visual objects only, with no readable text.
2-4s: He raises one hand. Thin warm-gold and soft-cyan threads connect the fragments. The fragments start moving with purpose.
4-6s: The messy objects spiral into a clean invisible system layer. Show abstract glowing nodes and neat UI chips, but no readable labels.
6-8s: Four polished floating product windows unfold around him. The windows should look like refined software interfaces, but all text areas must be abstract placeholder lines and icons only.
8-10s: The scene resolves into a calm final composition: the engineer centered, four clean product windows around him, warm studio lighting, organized system lines, enough empty dark space for website overlay text.

Motion:
Smooth camera push, gentle parallax, graceful paper movement, no frantic spinning, no shaky camera, no fast cuts.

Style:
Premium cinematic animated-film look, magical realism, warm studio lighting, professional AI portfolio, elegant and memorable. Keep the character likeness and the warm studio mood from the reference images.

Avoid:
Any readable text, misspelled labels, logos, watermarks, fake money, fake trading profits, fake company names, fake testimonials, robots, wizard hat, wand, cyberpunk city, generic AI brain imagery, extra characters, sparkle watermark.

Output:
16:9 landscape, 1920x1080 or higher, silent MP4.
```

## After generation

1. Save the video as `assets/cinematic/kooexperience-scroll-reel.mp4`.
2. Save the stills as:
   - `assets/cinematic/keyframe-01-ai-alchemist.png`
   - `assets/cinematic/keyframe-02-live-products.png`
3. Reload the homepage. The scroll section will use the MP4 when present and fall back to product screenshots while the video is missing.
4. Check mobile and desktop. The animation should support the story, not bury the proof.
