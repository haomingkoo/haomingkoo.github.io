#!/usr/bin/env python3
"""Sync and audit public profile surfaces from profile.json.

This keeps the GitHub profile README aligned with the portfolio profile data.
Run with --check in CI to catch drift.
"""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
DEFAULT_GITHUB_PROFILE_README = ROOT.parent / "haomingkoo" / "README.md"
PORTFOLIO_README = ROOT / "github-profile-readme.md"

GITHUB_BIO = "Applied AI Engineer | Production LLM Systems | RAG & Agent Workflows | Evals | Ex-Micron"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text())


def first_tag(post: dict[str, Any]) -> str:
    tags = post.get("tags") or ["Writing"]
    return str(tags[0])


def post_url(post: dict[str, Any]) -> str:
    return f"https://kooexperience.com/blog/posts/{post['slug']}.html"


def render_blog_posts(posts: list[dict[str, Any]], limit: int = 12) -> str:
    grouped: dict[str, list[dict[str, Any]]] = {}
    for post in posts:
        grouped.setdefault(first_tag(post), []).append(post)

    preferred = ["Building", "Research", "LLMOps", "Travel"]
    sections: list[str] = []
    emitted = 0
    for group in preferred:
        group_posts = grouped.get(group, [])
        if not group_posts:
            continue
        sections.append(f"**{group}**")
        for post in group_posts:
            if emitted >= limit:
                break
            tags = [tag for tag in (post.get("tags") or []) if tag != group]
            summary = ", ".join(tags[:3]) if tags else post.get("readingTime", "Post")
            sections.append(f"- [{post['title']}]({post_url(post)}) - {summary}")
            emitted += 1
        sections.append("")
        if emitted >= limit:
            break
    return "\n".join(sections).rstrip()


def app_stack(app: dict[str, Any]) -> str:
    tech = app.get("tech") or []
    return ", ".join(str(item) for item in tech[:4])


def app_description(app: dict[str, Any]) -> str:
    overrides = {
        "Job Hunter SG": "Singapore job search product with RAG matching, ATS scoring, role-fit keyword checks, and fact-checked resume edits",
        "Trader Koo": "Market review workflow with signals, paper-trade records, reports, and source freshness",
        "Japan in Seasons": "Japan travel intelligence with 12 MCP tools, 1,700+ places, and seasonal signals",
        "Amex Explorer": "Source-backed benefit explorer with maps, official data tracking, and stale-source alerts",
        "LionWeather": "Singapore weather intelligence with ML rainfall forecasting and SHAP analysis",
        "Photo Compliance Studio": "Passport-photo compliance checks with country rules and guided corrections",
        "Preflight": "CSV and Parquet profiling with data health checks, automated EDA, and baseline ML",
        "MinMax Wine": "Wine price comparison with bundle-aware pricing, Vivino context, and daily refreshes",
    }
    return overrides.get(app["name"], app["description"])


def live_apps(profile: dict[str, Any]) -> list[dict[str, Any]]:
    apps = [app for app in profile["portfolioApps"] if app.get("url") and "#projects" not in app["url"]]
    expected = int(profile["keyMetrics"]["liveApps"])
    if len(apps) != expected:
        raise ValueError(f"profile.json liveApps={expected}, but portfolioApps has {len(apps)} live URLs")
    return apps


def render_readme(profile: dict[str, Any], posts: list[dict[str, Any]]) -> str:
    apps = live_apps(profile)
    metrics = profile["keyMetrics"]
    app_rows = "\n".join(
        f"| [**{app['name']}**]({app['url']}) | {app_description(app)} | {app_stack(app)} |"
        for app in apps
    )
    latest_posts = render_blog_posts(posts)
    return f"""<div align="center">

# {profile["name"]}

**Applied AI Engineer**

Production LLM systems, RAG, agent workflows, and enterprise AI delivery | AI Singapore | Ex-Micron ({metrics["businessImpact"]} impact) | MSc NUS

[![Website](https://img.shields.io/badge/kooexperience.com-3b82f6?style=flat&logo=google-chrome&logoColor=white)]({profile["website"]})
[![LinkedIn](https://img.shields.io/badge/LinkedIn-3b82f6?style=flat&logo=linkedin&logoColor=white)]({profile["linkedin"]})
[![Email](https://img.shields.io/badge/Email-3b82f6?style=flat&logo=gmail&logoColor=white)](mailto:{profile["email"]})

</div>

---

## What I'm Working On

- Building production ML systems at **AI Singapore (AIAP)** across vision, sequence modelling, NLP, and MLOps
- Building **RAG, agent workflows, evals, and LLM observability** into practical AI products
- Shipping [{metrics["liveApps"]} live applications]({profile["website"]}) that solve real problems, from job search to travel intelligence and source-backed data tools
- Building open-source tools: [japan-seasons-mcp](https://github.com/haomingkoo/japan-seasons-mcp) - MCP server giving AI assistants live Japan travel data

Previously led global AI-enabled transformation at **Micron Technology** for {metrics["yearsExperience"]} calendar years, aligning {metrics["engineersAligned"]} engineers across four fabs and driving {metrics["businessImpact"]} in business impact.

## Tech Stack

**ML & AI**\\
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat&logo=pytorch&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=flat&logo=tensorflow&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat&logo=scikitlearn&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat&logo=opencv&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-111111?style=flat)
![RAG](https://img.shields.io/badge/RAG-0f766e?style=flat)
![Evals](https://img.shields.io/badge/Evals-7c3aed?style=flat)

**Web & APIs**\\
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

**Infrastructure & MLOps**\\
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=googlecloud&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat&logo=amazonwebservices&logoColor=white)
![MLflow](https://img.shields.io/badge/MLflow-0194E2?style=flat&logo=mlflow&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)

## Live Apps

| Project | Description | Stack |
|---------|-------------|-------|
{app_rows}

## GitHub Stats

<div align="center">

<img src="./profile/top-langs.svg" alt="Top Languages" height="170" />

</div>

## Latest Blog Posts

{latest_posts}

## Connect

Open to conversations about applied AI, production LLM systems, RAG, agent workflows, evals, and practical AI product delivery.

- Website: [{profile["website"].replace("https://", "")}]({profile["website"]})
- LinkedIn: [{profile["linkedin"].replace("https://", "")}]({profile["linkedin"]})
- Email: [{profile["email"]}](mailto:{profile["email"]})
"""


def write_or_check(path: Path, content: str, check: bool) -> bool:
    current = path.read_text() if path.exists() else ""
    if current == content:
        return False
    if check:
        print(f"Drift detected: {path}", file=sys.stderr)
        return True
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    print(f"Wrote {path}")
    return True


def sync_github_profile() -> None:
    command = [
        "gh",
        "api",
        "user",
        "-X",
        "PATCH",
        "-f",
        f"bio={GITHUB_BIO}",
        "-f",
        "blog=https://kooexperience.com",
        "-f",
        "location=Singapore",
        "-F",
        "hireable=true",
    ]
    subprocess.run(command, check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if generated surfaces are stale")
    parser.add_argument("--github-profile-readme", type=Path, default=Path(os.environ.get("GITHUB_PROFILE_README", DEFAULT_GITHUB_PROFILE_README)))
    parser.add_argument("--update-github-profile", action="store_true", help="update live GitHub profile metadata via gh; requires gh auth user scope")
    args = parser.parse_args()

    profile = load_json(ROOT / "profile.json")
    posts = sorted(load_json(ROOT / "blog/posts.json"), key=lambda post: post["date"], reverse=True)
    readme = render_readme(profile, posts)

    drift = False
    drift |= write_or_check(PORTFOLIO_README, readme, args.check)
    drift |= write_or_check(args.github_profile_readme, readme, args.check)

    if args.update_github_profile:
      sync_github_profile()

    return 1 if drift and args.check else 0


if __name__ == "__main__":
    raise SystemExit(main())
