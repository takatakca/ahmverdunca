#!/usr/bin/env python3
"""Browser-rendered QA of the real AHMV Louves route, never a mock-up.

Run against a locally started TanStack Start app. Captures are public-only;
do not supply any authentication cookies, private TeamLinkt links or secrets.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, Error as PlaywrightError

BASE = os.environ.get("AHMV_VISUAL_BASE_URL", "http://127.0.0.1:8080").rstrip("/")
ROUTE = "/equipes/louves-m12b"
OUTPUT = Path(os.environ.get("AHMV_VISUAL_ARTIFACT_DIR", "artifacts/louves-visual"))
VIEWPORTS = (320, 390, 768, 1440)


def inspect_page(page, width: int) -> dict:
    response = page.goto(BASE + ROUTE, wait_until="domcontentloaded", timeout=45000)
    page.locator("main").wait_for(state="visible", timeout=30000)
    # Wait for fonts without letting external font requests hold up the test.
    page.evaluate(
        """async () => {
          await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))])
        }"""
    )
    page.screenshot(path=str(OUTPUT / f"louves-{width}.png"), full_page=True, animations="disabled")

    facts = page.evaluate(
        """() => {
          const root = document.documentElement;
          const logo = document.querySelector('main img[src="/images/teams/louves-m12b-crest.webp"]');
          const details = document.querySelector('main details');
          const links = [...document.querySelectorAll('main a[href]')].map(a => a.getAttribute('href'));
          const main = document.querySelector('main');
          return {
            screenWidth: innerWidth,
            scrollWidth: root.scrollWidth,
            heroTitle: main?.querySelector('h1')?.textContent?.trim(),
            logoLoaded: !!logo && logo.complete && logo.naturalWidth > 0,
            navSchedule: links.some(h => h?.startsWith('/horaires?team=feminin')),
            navGallery: links.some(h => h === '/galerie/hockey-feminin-2026-2027'),
            detailsInitiallyClosed: !!details && !details.open,
            unreadableLinks: [...document.querySelectorAll('main a[href]')].filter(a => {
              const bounds = a.getBoundingClientRect();
              return bounds.width < 40 || bounds.height < 40;
            }).length,
            bodyBackground: getComputedStyle(main).backgroundColor,
            moduleCount: details?.querySelectorAll('article').length ?? 0,
          };
        }"""
    )
    facts["responseStatus"] = response.status if response is not None else None
    details = page.locator("main details")
    details.locator("summary").click()
    facts["detailsOpens"] = details.evaluate("(node) => node.open")
    facts["viewport"] = width
    return facts


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    findings: list[dict] = []
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
        try:
            for width in VIEWPORTS:
                page = browser.new_page(viewport={"width": width, "height": 900}, device_scale_factor=1)
                try:
                    facts = inspect_page(page, width)
                    findings.append(facts)
                    if facts["responseStatus"] is None or facts["responseStatus"] >= 400:
                        errors.append(f"{width}px: HTTP status {facts['responseStatus']}")
                    if facts["scrollWidth"] > facts["screenWidth"] + 1:
                        errors.append(f"{width}px: horizontal overflow {facts['scrollWidth']}px")
                    if "Louves" not in (facts["heroTitle"] or ""):
                        errors.append(f"{width}px: wrong/missing team heading")
                    if not facts["logoLoaded"]:
                        errors.append(f"{width}px: supplied Louves crest did not load")
                    if not facts["navSchedule"] or not facts["navGallery"]:
                        errors.append(f"{width}px: public schedule/gallery link missing")
                    if not facts["detailsInitiallyClosed"] or not facts["detailsOpens"]:
                        errors.append(f"{width}px: private/future services disclosure broken")
                    if facts["moduleCount"] != 7:
                        errors.append(f"{width}px: private/future module count changed")
                    if facts["unreadableLinks"]:
                        errors.append(f"{width}px: {facts['unreadableLinks']} links have small hit targets")
                except (PlaywrightError, AssertionError, ValueError) as exc:
                    errors.append(f"{width}px: browser QA failed: {str(exc)[:400]}")
                finally:
                    page.close()
        finally:
            browser.close()

    summary = {"route": ROUTE, "type": "rendered-local-tanstack-app", "findings": findings, "errors": errors}
    (OUTPUT / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
