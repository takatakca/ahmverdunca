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
    page.locator('[data-ahmv-team-microsite="louves-m12b"]').wait_for(state="visible", timeout=30000)
    # Wait for fonts without letting external font requests hold up the test.
    page.evaluate(
        """async () => {
          await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 3000))])
        }"""
    )
    page.screenshot(path=str(OUTPUT / f"louves-{width}.png"), full_page=True, animations="disabled")
    page.screenshot(path=str(OUTPUT / f"louves-{width}-first-screen.png"), full_page=False, animations="disabled")

    facts = page.evaluate(
        """() => {
          const root = document.documentElement;
          const team = document.querySelector('[data-ahmv-team-microsite="louves-m12b"]');
          const logo = team?.querySelector('img[src="/images/teams/louves-m12b-crest.webp"]');
          const details = team?.querySelector('details');
          const links = [...(team?.querySelectorAll('a[href]') ?? [])].map(a => a.getAttribute('href'));
          const landmarkCount = document.querySelectorAll('main').length;
          return {
            screenWidth: innerWidth,
            scrollWidth: root.scrollWidth,
            heroTitle: team?.querySelector('h1')?.textContent?.trim(),
            mainLandmarkCount: landmarkCount,
            h1FontSize: Number.parseFloat(getComputedStyle(team.querySelector('h1')).fontSize),
            hasGeneralFooter: !!document.querySelector('footer.bg-competition'),
            hasTeamNavigation: !!team.querySelector('nav[aria-label="Navigation de l’équipe"]'),
            hasScorePanel: !!team.querySelector('#pointages'),
            hasSchedulePanel: !!team.querySelector('#calendrier'),
            hasNewsPanel: !!team.querySelector('#vie-equipe'),
            hasTeamGallery: !!team.querySelector('#photos-equipe'),
            logoLoaded: !!logo && logo.complete && logo.naturalWidth > 0,
            navSchedule: links.some(h => h?.startsWith('/horaires?team=feminin')),
            navGallery: links.some(h => h === '/galerie/hockey-feminin-2026-2027'),
            detailsInitiallyClosed: !!details && !details.open,
            unreadableLinks: [...(team?.querySelectorAll('a[href]') ?? [])].filter(a => {
              const bounds = a.getBoundingClientRect();
              const style = getComputedStyle(a);
              if (!a.getClientRects().length || style.visibility === 'hidden' || a.classList.contains('sr-only')) return false;
              return bounds.width < 40 || bounds.height < 40;
            }).length,
            bodyBackground: team ? getComputedStyle(team).backgroundColor : 'missing',
            moduleCount: details?.querySelectorAll('article').length ?? 0,
          };
        }"""
    )
    share = page.locator('[data-ahmv-team-share] button[data-ahmv-share-ready="true"]')
    share.click(timeout=8000)
    page.wait_for_timeout(450)
    facts["shareUrl"] = page.evaluate('() => window.__ahmvTestSharedUrl || null')
    facts["shareOutcome"] = page.locator('[data-ahmv-share-status]').inner_text().strip()
    facts["shareStatusVisible"] = facts["shareOutcome"] != ""
    facts["responseStatus"] = response.status if response is not None else None
    details = page.locator('[data-ahmv-team-microsite="louves-m12b"] details')
    details.locator("summary").click()
    facts["detailsOpens"] = details.evaluate("(node) => node.open")
    bag = page.locator('[data-ahmv-parent-checklist]')
    bag.locator('[data-ahmv-checklist-toggle]').click(timeout=6000)
    skates = bag.locator('[data-ahmv-ice-bag-item="skates"]')
    # The native checkbox is visually hidden for accessibility; click its visible label.
    visible_label = skates.locator("..")
    # Keep the target above the global mobile bottom navigation and Assistant.
    visible_label.evaluate("(element) => { element.scrollIntoView({block: 'start', behavior: 'instant'}); window.scrollBy(0, -160); }")
    page.screenshot(path=str(OUTPUT / f"louves-{width}-checklist-open.png"), animations="disabled")
    # Test a real keyboard interaction on the native checkbox.
    # Pointer occlusion by the global Assistant is tracked separately in PR #391.
    skates.focus()
    page.keyboard.press("Space")
    page.wait_for_function(
        '() => localStorage.getItem("ahmv:ice-bag:v1:louves-m12b")?.includes("skates")',
        timeout=5000,
    )
    facts["checklistToggles"] = skates.is_checked()
    page.reload(wait_until="domcontentloaded")
    bag = page.locator('[data-ahmv-parent-checklist]')
    bag.locator('[data-ahmv-checklist-toggle]').click(timeout=6000)
    facts["checklistPersists"] = bag.locator('[data-ahmv-ice-bag-item="skates"]').is_checked()
    reset = bag.locator('[data-ahmv-checklist-reset]')
    reset.evaluate("(el) => { el.scrollIntoView({block: 'start', behavior: 'instant'}); window.scrollBy(0, -130); }")
    reset.click(timeout=6000)
    facts["checklistResets"] = not bag.locator('[data-ahmv-ice-bag-item="skates"]').is_checked()
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
                # Isolate microsite interactions from the optional timed site-wide welcome dialog.
                # The welcome experience has its own test scope and is unchanged in production.
                page.add_init_script("""(() => {
                  try {
                    localStorage.setItem('ahmv-communications-preview-hidden', '1');
                    sessionStorage.setItem('ahmv-communications-preview-seen', '1');
                  } catch (_) {}
                })()""")
                page.add_init_script("""(() => {
                  // Replace OS-native sharing only for this isolated test tab.
                  Object.defineProperty(navigator, 'share', {
                    configurable: true,
                    value: async (data) => { window.__ahmvTestSharedUrl = data.url; },
                  });
                })()""")
                try:
                    facts = inspect_page(page, width)
                    findings.append(facts)
                    if facts["responseStatus"] is None or facts["responseStatus"] >= 400:
                        errors.append(f"{width}px: HTTP status {facts['responseStatus']}")
                    if facts["scrollWidth"] > facts["screenWidth"] + 1:
                        errors.append(f"{width}px: horizontal overflow {facts['scrollWidth']}px")
                    if facts["hasGeneralFooter"]:
                        errors.append(f"{width}px: general association footer incorrectly mounted in team app")
                    if not all(facts[k] for k in ("hasTeamNavigation", "hasScorePanel", "hasSchedulePanel", "hasNewsPanel", "hasTeamGallery")):
                        errors.append(f"{width}px: important visible team-app sections are missing")
                    if facts["h1FontSize"] < 42:
                        errors.append(f"{width}px: team name is too small at {facts['h1FontSize']}px")
                    if facts["mainLandmarkCount"] != 1:
                        errors.append(f"{width}px: expected one main landmark, found {facts['mainLandmarkCount']}")
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
                    if not facts["shareStatusVisible"] or facts["shareUrl"] != BASE + "/equipes/louves-m12b":
                        errors.append(f"{width}px: share mismatch: url={facts['shareUrl']!r}, status={facts['shareOutcome']!r}")
                    if not (facts["checklistToggles"] and facts["checklistPersists"] and facts["checklistResets"]):
                        errors.append(f"{width}px: parent bag checklist toggle/persistence/reset failed")
                except (PlaywrightError, AssertionError, ValueError) as exc:
                    errors.append(f"{width}px: browser QA failed: {str(exc)[:2200]}")
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
