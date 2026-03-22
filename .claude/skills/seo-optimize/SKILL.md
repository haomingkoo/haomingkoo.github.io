---
name: seo-optimize
description: Run when the user wants to optimize SEO for the portfolio site. Generates OG images via Playwright screenshots, updates meta tags, validates structured data, checks sitemap, and runs a full audit.
---

# SEO Optimize Skill

Automate SEO tasks for kooexperience.com portfolio site.

## What This Skill Does

### 1. Generate OG Images
For any new or updated blog post:
- Use Playwright to screenshot the live page at 1200x630
- Save to `/assets/og/[slug].png`
- Update the `og:image` meta tag in the HTML
- Update `twitter:image` if present
- Add `image` to BlogPosting JSON-LD schema

Command: `npx playwright screenshot --viewport-size="1200,630" --wait-for-timeout=3000 https://kooexperience.com/blog/posts/[slug].html ~/dev/portfolio/assets/og/[slug].png`

### 2. Update Sitemap
- Add new pages to `/sitemap.xml` with correct lastmod dates
- Remove redirects or dead pages
- Ensure all blog posts and travel posts are included

### 3. Update RSS Feed
- Add new blog posts to `/feed.xml`
- Ensure RFC 822 date format
- Keep posts ordered newest-first

### 4. Update llms.txt
- Add new blog post entries to `/llms.txt`
- Keep descriptions concise and keyword-rich

### 5. Validate Blog Post SEO
For each blog post, check:
- `<title>` exists and is 50-60 chars
- `<meta name="description">` exists
- `<link rel="canonical">` exists
- `<meta property="og:title">` exists
- `<meta property="og:description">` exists
- `<meta property="og:image">` points to unique image in `/assets/og/`
- `<meta name="twitter:card">` is `summary_large_image`
- `<meta name="twitter:image">` points to unique image
- `<meta name="robots">` has `max-image-preview:large`
- BlogPosting JSON-LD with headline, description, datePublished, dateModified, author, image
- BreadcrumbList JSON-LD
- Related Posts section exists with 2-3 cross-links
- RSS autodiscovery link in `<head>`

### 6. Run Full Audit
Check all of the above across all pages and report issues.

## File Locations
- Blog posts: `/blog/posts/[slug].html`
- Blog metadata: `/blog/posts.json`
- Sitemap: `/sitemap.xml`
- RSS feed: `/feed.xml`
- LLMs.txt: `/llms.txt`
- OG images: `/assets/og/[slug].png`
- Homepage OG: `/assets/og-image.png`
