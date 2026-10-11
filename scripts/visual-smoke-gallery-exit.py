#!/usr/bin/env python3
"""Check real rendered photo viewer can always be exited on mobile and desktop."""
from __future__ import annotations
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get("AHMV_VISUAL_BASE_URL", "http://127.0.0.1:8080").rstrip("/")
OUT = Path("artifacts/ahmv-gallery-exit")
ROUTE = "/galerie/hockey-feminin-2026-2027"


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    findings = []
    problems = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        for width in [390, 1440]:
            page = browser.new_page(viewport={"width": width, "height": 900}, device_scale_factor=1)
            page.add_init_script("""(() => {
                try {
                    localStorage.setItem('ahmv-communications-preview-hidden', '1');
                    sessionStorage.setItem('ahmv-communications-preview-seen', '1');
                } catch (_) {}
            })()""")
            client_errors: list[str] = []
            page.on("pageerror", lambda error: client_errors.append(str(error)))
            page.on("console", lambda message: client_errors.append("console:"+message.text) if message.type == "error" else None)
            try:
                response = page.goto(BASE + ROUTE, wait_until="domcontentloaded", timeout=45000)
                page.locator('button[aria-label^="Ouvrir "]').first.wait_for(timeout=16000)
                # Require React's actual event handler rather than guessing a timeout.
                page.wait_for_function(
                    """() => {
                      const b = document.querySelector('button[aria-label^="Ouvrir "]');
                      return b && Object.keys(b).some(k => k.startsWith('__reactProps
                page.screenshot(path=str(OUT / f"gallery-{width}-before.png"), animations="disabled")
                page.locator('button[aria-label^="Ouvrir "]').first.click()
                page.wait_for_timeout(450)
                page.screenshot(path=str(OUT / f"gallery-{width}-after-click.png"), animations="disabled")
                opened = page.locator('[data-ahmv-attention-surface="media-viewer"]').count()
                print(json.dumps({"width":width,"viewerMountedAfterClick":opened,"urlAfterClick":page.url,"pageErrors":client_errors},ensure_ascii=False))
                viewer = page.locator('[data-ahmv-attention-surface="media-viewer"]')
                viewer.wait_for(state="visible", timeout=7000)
                visible_exit = viewer.locator('[data-ahmv-gallery-exit]')
                visible_exit.wait_for(state="visible")
                page.screenshot(path=str(OUT / f"gallery-{width}-open.png"), animations="disabled")
                size = visible_exit.bounding_box()
                if size is None or size["height"] < 44 or size["width"] < 100:
                    problems.append(f"{width}px: gallery exit is too small or missing")
                visible_exit.click()
                viewer.wait_for(state="hidden", timeout=7000)
                page.locator('button[aria-label^="Ouvrir "]').first.click()
                viewer.wait_for(state="visible", timeout=7000)
                page.keyboard.press("Escape")
                viewer.wait_for(state="hidden", timeout=7000)
                findings.append({"width": width, "http": response.status if response else None, "exitTap": True, "escape": True, "exitWidth": size["width"] if size else None})
            except Exception as exc:
                problems.append(f"{width}px: {str(exc)[:1300]} | pageErrors={client_errors[:3]}")
            finally:
                page.close()
        browser.close()
    report = {"route": ROUTE, "checks": findings, "errors": problems}
    (OUT / "summary.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return int(bool(problems))


if __name__ == "__main__":
    raise SystemExit(main())
) && typeof b[k]?.onClick === 'function');
                    }""",
                    timeout=12000,
                )
                page.screenshot(path=str(OUT / f"gallery-{width}-before.png"), animations="disabled")
                page.locator('button[aria-label^="Ouvrir "]').first.click()
                page.wait_for_timeout(450)
                page.screenshot(path=str(OUT / f"gallery-{width}-after-click.png"), animations="disabled")
                opened = page.locator('[data-ahmv-attention-surface="media-viewer"]').count()
                print(json.dumps({"width":width,"viewerMountedAfterClick":opened,"urlAfterClick":page.url,"pageErrors":client_errors},ensure_ascii=False))
                viewer = page.locator('[data-ahmv-attention-surface="media-viewer"]')
                viewer.wait_for(state="visible", timeout=7000)
                visible_exit = viewer.locator('[data-ahmv-gallery-exit]')
                visible_exit.wait_for(state="visible")
                page.screenshot(path=str(OUT / f"gallery-{width}-open.png"), animations="disabled")
                size = visible_exit.bounding_box()
                if size is None or size["height"] < 44 or size["width"] < 100:
                    problems.append(f"{width}px: gallery exit is too small or missing")
                visible_exit.click()
                viewer.wait_for(state="hidden", timeout=7000)
                page.locator('button[aria-label^="Ouvrir "]').first.click()
                viewer.wait_for(state="visible", timeout=7000)
                page.keyboard.press("Escape")
                viewer.wait_for(state="hidden", timeout=7000)
                findings.append({"width": width, "http": response.status if response else None, "exitTap": True, "escape": True, "exitWidth": size["width"] if size else None})
            except Exception as exc:
                problems.append(f"{width}px: {str(exc)[:1300]} | pageErrors={client_errors[:3]}")
            finally:
                page.close()
        browser.close()
    report = {"route": ROUTE, "checks": findings, "errors": problems}
    (OUT / "summary.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return int(bool(problems))


if __name__ == "__main__":
    raise SystemExit(main())
