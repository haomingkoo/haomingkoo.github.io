#!/usr/bin/env python3
"""Record short portfolio app demos with Playwright.

The script records real browser interactions into previews/demo-clips/.
Those clips are intentionally kept out of git until a final edit is chosen.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from playwright.sync_api import Page, TimeoutError, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "previews" / "demo-clips"
VIEWPORT = {"width": 1440, "height": 960}


@dataclass(frozen=True)
class Scenario:
    slug: str
    title: str
    url: str
    action: Callable[[Page], None]


def pause(page: Page, ms: int = 700) -> None:
    page.wait_for_timeout(ms)


def goto(page: Page, url: str) -> None:
    page.goto(url, wait_until="domcontentloaded", timeout=45_000)
    pause(page, 1800)


def click_text(page: Page, text: str, timeout: int = 4_000) -> bool:
    try:
        page.get_by_text(text, exact=False).first.click(timeout=timeout)
        pause(page)
        return True
    except TimeoutError:
        return False


def click_first_text(page: Page, text: str, timeout: int = 4_000) -> bool:
    try:
        page.get_by_text(text, exact=False).first.click(timeout=timeout)
        pause(page)
        return True
    except TimeoutError:
        return False


def click_role(page: Page, role: str, name: str, timeout: int = 4_000) -> bool:
    try:
        page.get_by_role(role, name=name).first.click(timeout=timeout)
        pause(page)
        return True
    except TimeoutError:
        return False


def fill_visible(page: Page, selector: str, value: str, timeout: int = 4_000) -> bool:
    try:
        page.locator(selector).first.fill(value, timeout=timeout)
        pause(page)
        return True
    except TimeoutError:
        return False


def fill_first_search(page: Page, value: str) -> bool:
    selectors = [
        "input[type='search']",
        "input[placeholder*='Search' i]",
        "input[placeholder*='Venue' i]",
        "input[type='text']",
    ]
    for selector in selectors:
        try:
            locator = page.locator(selector).first
            locator.fill(value, timeout=3_000)
            pause(page, 900)
            return True
        except TimeoutError:
            continue
    return False


def smooth_scroll(page: Page, amount: int = 680, steps: int = 3) -> None:
    for _ in range(steps):
        page.mouse.wheel(0, amount)
        pause(page, 700)


def action_portfolio(page: Page) -> None:
    goto(page, "https://kooexperience.com/")
    smooth_scroll(page, 720, 4)
    page.mouse.wheel(0, -360)
    pause(page, 1000)


def action_job_hunter(page: Page) -> None:
    goto(page, "https://job.kooexperience.com/")
    click_role(page, "button", "Start exploring")
    pause(page, 1800)
    click_first_text(page, "Tailor Resume", timeout=6_000)
    pause(page, 1200)
    click_text(page, "Try Demo", timeout=5_000)
    pause(page, 1200)
    click_first_text(page, "Replace", timeout=3_000)
    pause(page, 900)


def action_trader(page: Page) -> None:
    goto(page, "https://trader.kooexperience.com/chart")
    pause(page, 7800)
    page.mouse.move(700, 620)
    pause(page, 900)
    page.mouse.move(1050, 520)
    pause(page, 1200)


def action_trader_paper(page: Page) -> None:
    goto(page, "https://trader.kooexperience.com/paper-trades")
    pause(page, 2600)
    click_text(page, "How Paper Trading Works", timeout=3_000)
    pause(page, 900)
    click_text(page, "Draft Manual Trade", timeout=3_000)
    pause(page, 1000)


def action_seasons(page: Page) -> None:
    goto(page, "https://seasons.kooexperience.com/")
    fill_visible(page, 'input[placeholder="Search city or spot name..."]', "Kyoto")
    pause(page, 1300)
    click_role(page, "button", "Autumn Leaves")
    pause(page, 1200)
    click_role(page, "button", "Fruit Picking")
    pause(page, 1000)


def action_amex(page: Page) -> None:
    goto(page, "https://amex-explorer.kooexperience.com/")
    click_text(page, "Skip", timeout=3_000) or click_text(page, "Enter app", timeout=3_000)
    pause(page, 1000)
    click_role(page, "button", "Refine All filters off", timeout=5_000)
    pause(page, 700)
    fill_visible(page, "input:visible", "Tokyo")
    pause(page, 1200)
    click_text(page, "Table for Two", timeout=4_000)
    pause(page, 1200)


SCENARIOS: dict[str, Scenario] = {
    "portfolio": Scenario("portfolio", "Portfolio cinematic landing", "https://kooexperience.com/", action_portfolio),
    "job": Scenario("job", "Job Hunter SG", "https://job.kooexperience.com/", action_job_hunter),
    "trader": Scenario("trader", "Trader Koo chart workflow", "https://trader.kooexperience.com/chart", action_trader),
    "trader-paper": Scenario(
        "trader-paper",
        "Trader Koo paper-trade workflow",
        "https://trader.kooexperience.com/paper-trades",
        action_trader_paper,
    ),
    "seasons": Scenario("seasons", "Japan in Seasons map workflow", "https://seasons.kooexperience.com/", action_seasons),
    "amex": Scenario("amex", "Amex Explorer filter workflow", "https://amex-explorer.kooexperience.com/", action_amex),
}


def convert_to_mp4(webm: Path, mp4: Path) -> None:
    if not shutil.which("ffmpeg"):
        print(f"ffmpeg not found; kept WebM at {webm}")
        return
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(webm),
            "-an",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(mp4),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def run_scenario(scenario: Scenario, out_dir: Path, mp4: bool) -> None:
    scenario_dir = out_dir / scenario.slug
    scenario_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(
            viewport=VIEWPORT,
            record_video_dir=str(scenario_dir),
            record_video_size={"width": 1440, "height": 960},
            device_scale_factor=1,
        )
        page = context.new_page()
        scenario.action(page)
        pause(page, 900)
        page.close()
        context.close()
        browser.close()

    videos = sorted(scenario_dir.glob("*.webm"), key=lambda path: path.stat().st_mtime)
    if not videos:
        print(f"{scenario.slug}: no video produced", file=sys.stderr)
        return

    webm = videos[-1]
    final_webm = scenario_dir / f"{scenario.slug}.webm"
    if webm != final_webm:
        webm.replace(final_webm)

    if mp4:
        convert_to_mp4(final_webm, scenario_dir / f"{scenario.slug}.mp4")

    print(f"{scenario.slug}: {final_webm}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Record short demos from live portfolio apps.")
    parser.add_argument(
        "scenarios",
        nargs="*",
        choices=sorted(SCENARIOS.keys()) + ["all"],
        default=["all"],
        help="Scenario slugs to record.",
    )
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="Output directory.")
    parser.add_argument("--mp4", action="store_true", help="Also convert WebM clips to MP4 with ffmpeg.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    chosen = list(SCENARIOS) if "all" in args.scenarios else args.scenarios
    stamp = time.strftime("%Y%m%d-%H%M%S")
    out_dir = args.out / stamp
    for slug in chosen:
        run_scenario(SCENARIOS[slug], out_dir, args.mp4)
    print(f"\nClips written under: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
