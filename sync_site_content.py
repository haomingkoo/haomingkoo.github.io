#!/usr/bin/env python3
"""Regenerate crawlable content blocks and SEO artifacts for the portfolio site."""

from __future__ import annotations

import email.utils
import html
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
SGT = timezone(timedelta(hours=8))
STATIC_LASTMODS = {
    "https://kooexperience.com/about.html": "2026-03-12",
    "https://wine.kooexperience.com": "2026-03-20",
    "https://kooexperience.com/wmss.html": "2026-03-14",
}


def load_posts(relative_path: str) -> list[dict[str, Any]]:
    posts = json.loads((ROOT / relative_path).read_text())
    return sorted(posts, key=lambda post: post["date"], reverse=True)


def read_existing_lastmods() -> dict[str, str]:
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists():
        return {}

    matches = re.findall(
        r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>",
        sitemap.read_text(),
        flags=re.S,
    )
    return {loc: lastmod for loc, lastmod in matches}


def escape_text(value: str) -> str:
    return html.escape(value, quote=False)


def escape_attr(value: str) -> str:
    return html.escape(value, quote=True)


def format_month_day_year(date_str: str) -> str:
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return f"{dt.strftime('%b')} {dt.day}, {dt.year}"


def format_month_year(date_str: str) -> str:
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    return dt.strftime("%b %Y")


def replace_generated_block(path: Path, block_name: str, content: str) -> None:
    text = path.read_text()
    pattern = re.compile(
        rf"(?P<start>[ \t]*<!-- GENERATED:{re.escape(block_name)} START -->\n)"
        rf"(?P<body>.*?)"
        rf"(?P<end>[ \t]*<!-- GENERATED:{re.escape(block_name)} END -->)",
        flags=re.S,
    )
    match = pattern.search(text)
    if not match:
        raise ValueError(f"Missing generated block {block_name!r} in {path}")

    replacement = f"{match.group('start')}{content.rstrip()}\n{match.group('end')}"
    path.write_text(text[: match.start()] + replacement + text[match.end() :])


def render_home_cards(posts: list[dict[str, Any]], content_type: str) -> str:
    if not posts:
        empty = "No posts yet — check back soon." if content_type == "blog" else "No travel stories yet — check back soon."
        return f"          <div class=\"empty-state reveal\">{escape_text(empty)}</div>"

    cards: list[str] = []
    for post in posts[:3]:
        first_tag = escape_text((post.get("tags") or [content_type])[0])
        tag_class = "post-tag post-tag-travel" if content_type == "travel" else "post-tag"
        href = f"./{content_type}/posts/{post['slug']}.html"
        cards.append(f'          <a class="post-card reveal visible" href="{escape_attr(href)}">')
        if post.get("cover"):
            cards.append(
                f'            <img class="post-cover" src="{escape_attr(post["cover"])}" '
                f'alt="{escape_attr(post["title"])}" loading="lazy" />'
            )
        cards.append("            <div class=\"post-meta\">")
        cards.append(f'              <span class="{tag_class}">{first_tag}</span>')
        cards.append(f'              <span>{escape_text(format_month_day_year(post["date"]))}</span>')
        cards.append("            </div>")
        cards.append(f'            <p class="post-title">{escape_text(post["title"])}</p>')
        cards.append(f'            <p class="post-excerpt">{escape_text(post["excerpt"])}</p>')
        cards.append("            <span class=\"post-read\">Read &rsaquo;</span>")
        cards.append("          </a>")
    return "\n".join(cards)


def render_blog_archive(posts: list[dict[str, Any]]) -> str:
    if not posts:
        return '        <div class="empty-state">No posts yet — check back soon.</div>'

    items: list[str] = []
    for post in posts:
        items.append(f'        <a class="post-item" href="./posts/{escape_attr(post["slug"])}.html">')
        items.append(f'          <span class="post-date">{escape_text(format_month_day_year(post["date"]))}</span>')
        items.append('          <div class="post-body">')
        items.append(f'            <div class="post-title">{escape_text(post["title"])}</div>')
        items.append(f'            <div class="post-excerpt">{escape_text(post["excerpt"])}</div>')
        items.append('            <div class="post-tags">')
        for tag in post.get("tags", []):
            items.append(f'              <span class="post-tag">{escape_text(tag)}</span>')
        items.append('            </div>')
        items.append('          </div>')
        items.append(f'          <span class="post-reading">{escape_text(post.get("readingTime", ""))}</span>')
        items.append('        </a>')
    return "\n".join(items)


def render_travel_archive(posts: list[dict[str, Any]]) -> str:
    if not posts:
        return '        <div class="empty-state">No travel stories yet — check back soon.</div>'

    items: list[str] = []
    for post in posts:
        items.append(f'        <a class="post-card" href="./posts/{escape_attr(post["slug"])}.html">')
        if post.get("cover"):
            items.append(
                f'          <img class="post-cover" src="{escape_attr(post["cover"])}" '
                f'alt="{escape_attr(post["title"])}" loading="lazy" />'
            )
        else:
            items.append('          <div class="post-cover"></div>')
        items.append('          <div class="post-content">')
        items.append('            <div class="post-meta">')
        for tag in (post.get("tags") or [])[:2]:
            items.append(f'              <span class="post-tag">{escape_text(tag)}</span>')
        items.append(f'              <span>{escape_text(format_month_year(post["date"]))}</span>')
        items.append('            </div>')
        items.append(f'            <div class="post-title">{escape_text(post["title"])}</div>')
        items.append(f'            <div class="post-excerpt">{escape_text(post["excerpt"])}</div>')
        items.append('            <span class="post-read">Read &rsaquo;</span>')
        items.append('          </div>')
        items.append('        </a>')
    return "\n".join(items)


def file_lastmod(relative_path: str) -> str:
    path = ROOT / relative_path
    return datetime.fromtimestamp(path.stat().st_mtime).date().isoformat()


def recent_file_lastmod(relative_path: str) -> str | None:
    path = ROOT / relative_path
    mtime = datetime.fromtimestamp(path.stat().st_mtime).date()
    today = datetime.now(tz=SGT).date()
    if (today - mtime).days <= 1:
        return mtime.isoformat()
    return None


def render_sitemap(blog_posts: list[dict[str, Any]], travel_posts: list[dict[str, Any]]) -> str:
    entries = [
        {
            "loc": "https://kooexperience.com/",
            "lastmod": file_lastmod("index.html"),
            "changefreq": "weekly",
            "priority": "1.0",
        },
        {
            "loc": "https://kooexperience.com/about.html",
            "lastmod": STATIC_LASTMODS["https://kooexperience.com/about.html"],
            "changefreq": "monthly",
            "priority": "0.9",
        },
        {
            "loc": "https://wine.kooexperience.com",
            "lastmod": STATIC_LASTMODS["https://wine.kooexperience.com"],
            "changefreq": "daily",
            "priority": "0.9",
        },
        {
            "loc": "https://kooexperience.com/blog/",
            "lastmod": file_lastmod("blog/index.html"),
            "changefreq": "weekly",
            "priority": "0.8",
        },
        {
            "loc": "https://kooexperience.com/travel/",
            "lastmod": file_lastmod("travel/index.html"),
            "changefreq": "weekly",
            "priority": "0.8",
        },
    ]

    for post in blog_posts:
        loc = f"https://kooexperience.com/blog/posts/{post['slug']}.html"
        lastmod = post["date"]
        recent_lastmod = recent_file_lastmod(f"blog/posts/{post['slug']}.html")
        if recent_lastmod and recent_lastmod > lastmod:
            lastmod = recent_lastmod
        entries.append(
            {
                "loc": loc,
                "lastmod": lastmod,
                "changefreq": "monthly",
                "priority": "0.8",
            }
        )

    for post in travel_posts:
        loc = f"https://kooexperience.com/travel/posts/{post['slug']}.html"
        lastmod = post["date"]
        recent_lastmod = recent_file_lastmod(f"travel/posts/{post['slug']}.html")
        if recent_lastmod and recent_lastmod > lastmod:
            lastmod = recent_lastmod
        entries.append(
            {
                "loc": loc,
                "lastmod": lastmod,
                "changefreq": "monthly",
                "priority": "0.7",
            }
        )

    wmss_path = ROOT / "wmss.html"
    if wmss_path.exists():
        entries.append(
            {
                "loc": "https://kooexperience.com/wmss.html",
                "lastmod": STATIC_LASTMODS["https://kooexperience.com/wmss.html"],
                "changefreq": "monthly",
                "priority": "0.7",
            }
        )

    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for entry in entries:
        lines.extend(
            [
                "  <url>",
                f"    <loc>{entry['loc']}</loc>",
                f"    <lastmod>{entry['lastmod']}</lastmod>",
                f"    <changefreq>{entry['changefreq']}</changefreq>",
                f"    <priority>{entry['priority']}</priority>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def render_feed(blog_posts: list[dict[str, Any]]) -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        "  <channel>",
        "    <title>Haoming Koo - AI Systems Engineer Blog</title>",
        "    <link>https://kooexperience.com/blog/</link>",
        "    <description>Blog posts about AI, ML, and building production systems by Haoming Koo.</description>",
        "    <language>en-sg</language>",
        '    <atom:link href="https://kooexperience.com/feed.xml" rel="self" type="application/rss+xml"/>',
    ]

    for post in blog_posts:
        dt = datetime.strptime(post["date"], "%Y-%m-%d").replace(tzinfo=SGT)
        url = f"https://kooexperience.com/blog/posts/{post['slug']}.html"
        lines.extend(
            [
                "    <item>",
                f"      <title>{escape_text(post['title'])}</title>",
                f"      <link>{url}</link>",
                f"      <description>{escape_text(post['excerpt'])}</description>",
                f"      <pubDate>{email.utils.format_datetime(dt)}</pubDate>",
                f"      <guid>{url}</guid>",
                "    </item>",
            ]
        )

    lines.extend(["  </channel>", "</rss>"])
    return "\n".join(lines) + "\n"


def main() -> None:
    blog_posts = load_posts("blog/posts.json")
    travel_posts = load_posts("travel/posts.json")

    replace_generated_block(ROOT / "index.html", "home-blog", render_home_cards(blog_posts, "blog"))
    replace_generated_block(ROOT / "index.html", "home-travel", render_home_cards(travel_posts, "travel"))
    replace_generated_block(ROOT / "blog/index.html", "blog-count", f"        {len(blog_posts)} posts")
    replace_generated_block(ROOT / "blog/index.html", "blog-list", render_blog_archive(blog_posts))
    replace_generated_block(
        ROOT / "travel/index.html",
        "travel-count",
        f"        {len(travel_posts)} stor{'ies' if len(travel_posts) != 1 else 'y'}",
    )
    replace_generated_block(ROOT / "travel/index.html", "travel-list", render_travel_archive(travel_posts))

    (ROOT / "sitemap.xml").write_text(render_sitemap(blog_posts, travel_posts))
    (ROOT / "feed.xml").write_text(render_feed(blog_posts))


if __name__ == "__main__":
    main()
