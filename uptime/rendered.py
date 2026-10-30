"""Load each site in rendered_sites.json in Chromium; exit 1 if any renders broken.

Catches what check.py cannot: console errors, failed first-party requests,
banned or unexpected third-party hosts, blank map tiles and empty pages.
--sync-issue opens, updates or closes the "Rendered:" GitHub issue.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import Page, sync_playwright

from check import sync_issue

CONFIG_FILE = Path(__file__).with_name("rendered_sites.json")
SCREENSHOT_DIR = Path("rendered-screenshots")
ISSUE_PREFIX = "Rendered:"
ATTEMPTS = 2
GOTO_TIMEOUT_MS = 45_000
IDLE_TIMEOUT_MS = 15_000
SETTLE_MS = 3_000
TILE_TIMEOUT_MS = 15_000
MIN_CONTENT_CHARS = 40
MAX_REASONS = 3
VIEWPORT = {"width": 1366, "height": 900}

CONTENT_JS = """() => {
  const main = document.querySelector('main, [role=main], #root, #app') || document.body;
  return (main.innerText || '').trim().length;
}"""


def host_matches(host: str, suffixes: list[str]) -> bool:
    return any(host == s or host.endswith(f".{s}") for s in suffixes)


def classify(url: str, cfg: dict) -> str:
    host = urlparse(url).hostname or ""
    if not host:  # data:, blob:
        return "local"
    if any(b in host for b in cfg["banned_host_substrings"]):
        return "banned"
    if host_matches(host, cfg["first_party_suffixes"]):
        return "first"
    if host_matches(host, cfg["allowed_third_party_hosts"]):
        return "allowed"
    return "unexpected"


def watch(page: Page, cfg: dict) -> tuple[list[str], list[str]]:
    problems: list[str] = []
    vector_tiles: list[str] = []
    ignored = [re.compile(p) for p in cfg["ignored_problem_patterns"]]

    def add(problem: str, context: str = "") -> None:
        if not any(p.search(f"{problem} {context}") for p in ignored):
            problems.append(problem)

    def on_console(msg) -> None:
        if msg.type == "error":
            add(f"console: {msg.text[:160]}", msg.location.get("url", ""))

    def on_request(req) -> None:
        kind = classify(req.url, cfg)
        if kind in ("banned", "unexpected"):
            add(f"{kind} host: {urlparse(req.url).hostname}")

    def on_response(resp) -> None:
        if resp.status >= 400 and classify(resp.url, cfg) == "first":
            add(f"HTTP {resp.status}: {resp.url[:120]}")
        if resp.ok and urlparse(resp.url).path.endswith(".pbf"):
            vector_tiles.append(resp.url)

    def on_failed(req) -> None:
        failure = req.failure or ""
        if classify(req.url, cfg) == "first" and "ERR_ABORTED" not in failure:
            add(f"failed {failure}: {req.url[:120]}")

    page.on("console", on_console)
    page.on("pageerror", lambda e: add(f"pageerror: {str(e)[:160]}"))
    page.on("request", on_request)
    page.on("response", on_response)
    page.on("requestfailed", on_failed)
    return problems, vector_tiles


def render_checks(page: Page, vector_tiles: list[str]) -> list[str]:
    problems = []
    if page.evaluate(CONTENT_JS) < MIN_CONTENT_CHARS:
        problems.append("main content empty")
    # A MapLibre layer draws vector tiles on a canvas, so count the tiles it fetched.
    if page.locator(".leaflet-container .maplibregl-canvas").count():
        if not vector_tiles:
            problems.append("vector map fetched no tiles")
    elif page.locator(".leaflet-container").count():
        try:
            page.wait_for_selector("img.leaflet-tile-loaded", timeout=TILE_TIMEOUT_MS)
        except PlaywrightError:
            problems.append("leaflet map has no loaded tiles")
    return problems


def visit(browser, site: dict, cfg: dict) -> list[str]:
    page = browser.new_page(viewport=VIEWPORT)
    problems, vector_tiles = watch(page, cfg)
    try:
        page.goto(site["url"], wait_until="load", timeout=GOTO_TIMEOUT_MS)
        try:
            page.wait_for_load_state("networkidle", timeout=IDLE_TIMEOUT_MS)
        except PlaywrightError:
            pass  # pages that poll never go idle; the settle wait still runs
        page.wait_for_timeout(SETTLE_MS)
        problems += render_checks(page, vector_tiles)
    except PlaywrightError as e:
        problems.append(f"load error: {str(e).splitlines()[0][:160]}")
    slug = re.sub(r"[^a-z0-9]+", "-", site["name"].lower()).strip("-")
    try:
        page.screenshot(path=str(SCREENSHOT_DIR / f"{slug}.png"), full_page=False)
    except PlaywrightError:
        pass
    page.close()
    return list(dict.fromkeys(problems))  # dedupe, keep order


def check_site(browser, site: dict, cfg: dict) -> list[str]:
    for attempt in range(ATTEMPTS):
        problems = visit(browser, site, cfg)
        if not problems or attempt == ATTEMPTS - 1:
            return problems


def summarize(problems: list[str]) -> str:
    extra = f" (+{len(problems) - MAX_REASONS} more)" if len(problems) > MAX_REASONS else ""
    return "; ".join(problems[:MAX_REASONS]).replace("|", "/") + extra


def main() -> int:
    cfg = json.loads(CONFIG_FILE.read_text())
    SCREENSHOT_DIR.mkdir(exist_ok=True)
    failures: dict[str, str] = {}
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for site in cfg["sites"]:
            problems = check_site(browser, site, cfg)
            print(f"{'FAIL' if problems else 'OK  '} {site['name']:<18} {site['url']}")
            for p in problems:
                print(f"       {p}")
            if problems:
                failures[site["name"]] = summarize(problems)
        browser.close()
    if "--sync-issue" in sys.argv:
        sync_issue(failures, {s["name"]: s["url"] for s in cfg["sites"]}, ISSUE_PREFIX)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
