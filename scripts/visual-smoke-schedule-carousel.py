#!/usr/bin/env python3
"""Actual rendered AHMV schedule page visual QA — not a screenshot mock-up."""
from __future__ import annotations
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, Error as PlaywrightError

BASE = os.environ.get("AHMV_VISUAL_BASE_URL", "http://127.0.0.1:8080").rstrip("/")
OUT = Path(os.environ.get("AHMV_SCHEDULE_ARTIFACT_DIR", "artifacts/schedule-team-first"))
WIDTHS = (320, 390, 768, 1440)
TRACK = "[data-ahmv-team-carousel-track]"
PICKER = "[data-ahmv-schedule-team-picker]"

def check(page, width: int) -> dict:
    response = page.goto(BASE + "/horaires", wait_until="domcontentloaded", timeout=45000)
    page.locator(PICKER).wait_for(state="visible", timeout=25000)
    page.locator('[data-ahmv-team-category="m7"]').wait_for(state="visible")
    # Avoid reporting the server-side skeleton before React mounts.
    page.wait_for_function(
        """() => {
          const b = document.querySelector('[data-ahmv-carousel-next]');
          const key = b && Object.keys(b).find(k => k.startsWith('__reactProps'));
          return !!key && typeof b[key]?.onClick === 'function';
        }""",
        timeout=15000,
    )
    # The global AHMV app-launch splash is intentional, but screenshots for
    # *schedule-page* visual QA must capture the real content AFTER it closes.
    page.locator('[role="status"][aria-label="Ouverture de l’application AHM Verdun"]').wait_for(
        state="hidden", timeout=15000
    )
    page.screenshot(path=str(OUT / f"schedule-{width}-first-screen.png"), animations="disabled")
    page.screenshot(path=str(OUT / f"schedule-{width}-full.png"), full_page=True, animations="disabled")
    info = page.evaluate(
        """() => {
          const picker = document.querySelector('[data-ahmv-schedule-team-picker]');
          const schedule = document.querySelector('#official-week-heading');
          const track = document.querySelector('[data-ahmv-team-carousel-track]');
          const heading = document.querySelector('#schedule-choose-team');
          const firstImg = document.querySelector('[data-ahmv-team-category="m5"] img');
          return {
            viewport: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            pickerTop: picker?.getBoundingClientRect().top,
            scheduleTop: schedule?.getBoundingClientRect().top,
            pickerHeading: heading?.textContent?.trim(),
            pickerHeadingPx: heading ? parseFloat(getComputedStyle(heading).fontSize) : 0,
            categoryCount: track?.querySelectorAll('[data-ahmv-team-category]').length,
            hasM5: !!track?.querySelector('[data-ahmv-team-category="m5"]'),
            hasM7: !!track?.querySelector('[data-ahmv-team-category="m7"]'),
            hasM9: !!track?.querySelector('[data-ahmv-team-category="m9"]'),
            hasFemale: !!track?.querySelector('[data-ahmv-team-category="feminin"]'),
            hasInventedM8: !!track?.querySelector('[data-ahmv-team-category="m8"]'),
            firstPhotoLoaded: !!firstImg && firstImg.complete && firstImg.naturalWidth > 0,
            trackScrollable: !!track && track.scrollWidth > track.clientWidth,
            nextTouchHeight: document.querySelector('[data-ahmv-carousel-next]')?.getBoundingClientRect().height ?? 0,
          };
        }"""
    )
    next_button = page.locator("[data-ahmv-carousel-next]")
    initial_scroll = page.locator(TRACK).evaluate("(el) => el.scrollLeft")
    next_button.click()
    page.wait_for_timeout(750)
    after_scroll = page.locator(TRACK).evaluate("(el) => el.scrollLeft")
    info["nextArrowMoves"] = after_scroll > initial_scroll + 50

    page.locator('[data-ahmv-team-category="m7"]').click()
    page.wait_for_url("**/horaires?team=m7#horaire-publie", timeout=12000)
    info["m7Selected"] = page.locator('[data-ahmv-team-category="m7"]').get_attribute("aria-current") == "page"
    info["scheduleFiltered"] = "M7" in page.locator('#horaire-publie h2').first.inner_text()

    if width == 390:
        page.goto(BASE + "/horaires?team=feminin", wait_until="domcontentloaded")
        page.locator('[data-ahmv-feminine-team-choices]').wait_for(state="visible", timeout=10000)
        page.screenshot(path=str(OUT / "schedule-390-feminine.png"), animations="disabled")
        info["feminineM12B"] = page.locator('[data-ahmv-feminine-team-choices] a[href="/equipes/louves-m12b"]').count() == 1
        info["historicalM12A"] = "historique" in page.locator('[data-ahmv-feminine-team-choices]').inner_text().lower()
    info["http"] = response.status if response else None
    info["width"] = width
    return info


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    findings = []
    failures = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
        try:
            for width in WIDTHS:
                page = browser.new_page(viewport={"width": width, "height": 900}, device_scale_factor=1)
                page.add_init_script("""(() => {
                  try {
                    localStorage.setItem('ahmv-communications-preview-hidden', '1');
                    sessionStorage.setItem('ahmv-communications-preview-seen', '1');
                  } catch (_) {}
                })()""")
                try:
                    result = check(page, width)
                    findings.append(result)
                    if result["http"] != 200:
                        failures.append(f"{width}px: unexpected status {result['http']}")
                    if result["documentWidth"] > result["viewport"] + 1:
                        failures.append(f"{width}px: horizontal overflow {result['documentWidth']}px")
                    if result["categoryCount"] != 10 or result["hasInventedM8"]:
                        failures.append(f"{width}px: category listing mismatch")
                    if not (result["hasM5"] and result["hasM7"] and result["hasM9"] and result["hasFemale"]):
                        failures.append(f"{width}px: expected official categories missing")
                    if not result["firstPhotoLoaded"]:
                        failures.append(f"{width}px: first approved team photo did not load")
                    if result["pickerTop"] is None or result["scheduleTop"] is None or result["pickerTop"] >= result["scheduleTop"]:
                        failures.append(f"{width}px: chooser not presented before the schedule")
                    if result["pickerHeadingPx"] < 28 or result["nextTouchHeight"] < 44:
                        failures.append(f"{width}px: important heading/touch control too small")
                    if not (result["trackScrollable"] and result["nextArrowMoves"]):
                        failures.append(f"{width}px: horizontal category slider not working")
                    if not (result["m7Selected"] and result["scheduleFiltered"]):
                        failures.append(f"{width}px: choosing M7 did not update schedule")
                    if width == 390 and not (result.get("feminineM12B") and result.get("historicalM12A")):
                        failures.append("390px: women's exact-team choices missing/misrepresented")
                except (PlaywrightError, AssertionError, ValueError) as exc:
                    failures.append(f"{width}px: browser failed: {str(exc)[:1600]}")
                finally:
                    page.close()
        finally:
            browser.close()
    summary = {"type": "actual-local-TanStack-React-page", "path": "/horaires", "results": findings, "errors": failures}
    (OUT / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
