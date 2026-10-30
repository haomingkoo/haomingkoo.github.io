"""Check every endpoint in endpoints.json; exit 1 if any is down.

--sync-issue opens, updates or closes the "Uptime:" GitHub issue via the gh CLI.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

ENDPOINTS_FILE = Path(__file__).with_name("endpoints.json")
TIMEOUT_SECONDS = 20
RETRY_DELAY_SECONDS = 10
ATTEMPTS = 2  # one retry so a single blip does not alert
MAX_WORKERS = 8
BODY_BYTES = 200_000
USER_AGENT = "kooexperience-uptime/1.0"
POST_HEADERS = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream"}
ISSUE_PREFIX = "Uptime:"
STATE_MARKER = "<!-- uptime-state "
RECOVERED_MESSAGE = "All services recovered"


def probe(ep: dict) -> str | None:
    """Return None if healthy, else a short failure reason."""
    data = json.dumps(ep["post"]).encode() if "post" in ep else None
    headers = {"User-Agent": USER_AGENT, **(POST_HEADERS if data else {})}
    req = urllib.request.Request(ep["url"], data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
            body = resp.read(BODY_BYTES).decode(errors="replace")
    except urllib.error.HTTPError as e:
        return f"HTTP {e.code}"
    except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
        return f"error: {getattr(e, 'reason', e)}"
    if ep.get("json_ok"):
        try:
            if json.loads(body).get("ok") is not True:
                return "JSON ok != true"
        except json.JSONDecodeError:
            return "invalid JSON"
    if "contains" in ep and ep["contains"] not in body:
        title = re.search(r"<title[^>]*>([^<]{0,80})", body, re.IGNORECASE)
        return f"missing marker {ep['contains']!r} (got {title.group(1).strip() if title else body[:80]!r})"
    return None


def check(ep: dict) -> str | None:
    for attempt in range(ATTEMPTS):
        reason = probe(ep)
        if reason is None or attempt == ATTEMPTS - 1:
            return reason
        time.sleep(RETRY_DELAY_SECONDS)


def gh(*args: str) -> str:
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout


def render(failures: dict[str, str], first_seen: dict[str, str], urls: dict[str, str]) -> str:
    rows = [f"| {n} | {urls[n]} | {r} | {first_seen[n]} |" for n, r in failures.items()]
    table = "\n".join(["| Service | URL | Status | First seen (UTC) |", "|---|---|---|---|", *rows])
    return f"{table}\n\n{STATE_MARKER}{json.dumps(first_seen)} -->"


def sync_issue(failures: dict[str, str], urls: dict[str, str], prefix: str = ISSUE_PREFIX) -> None:
    issues = json.loads(gh("issue", "list", "--state", "open", "--limit", "100", "--json", "number,title,body"))
    issue = next((i for i in issues if i["title"].startswith(prefix)), None)
    if not failures:
        if issue:
            gh("issue", "close", str(issue["number"]), "--comment", RECOVERED_MESSAGE)
        return
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    previous = {}
    if issue and STATE_MARKER in issue["body"]:
        previous = json.loads(issue["body"].split(STATE_MARKER, 1)[1].rsplit(" -->", 1)[0])
    first_seen = {n: previous.get(n, now) for n in failures}
    title = f"{prefix} {len(failures)} service(s) down"
    body = render(failures, first_seen, urls)
    if not issue:
        gh("issue", "create", "--title", title, "--body", body)
    elif set(first_seen) != set(previous):  # comment only when the failing set changes
        num = str(issue["number"])
        gh("issue", "edit", num, "--title", title, "--body", body)
        gh("issue", "comment", num, "--body", body.split(STATE_MARKER)[0])


def main() -> int:
    endpoints = json.loads(ENDPOINTS_FILE.read_text())
    with ThreadPoolExecutor(MAX_WORKERS) as pool:
        results = list(pool.map(check, endpoints))
    for ep, reason in zip(endpoints, results):
        print(f"{'DOWN' if reason else 'OK  '} {ep['name']:<38} {ep['url']} {reason or ''}")
    failures = {ep["name"]: r for ep, r in zip(endpoints, results) if r}
    if "--sync-issue" in sys.argv:
        sync_issue(failures, {ep["name"]: ep["url"] for ep in endpoints})
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
