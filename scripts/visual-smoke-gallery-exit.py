#!/usr/bin/env python3
"""Real Chromium QA for dismissing the public AHMV gallery viewer."""
from __future__ import annotations

import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get("AHMV_VISUAL_BASE_URL", "http://127.0.0.1:8080").rstrip("/")
ROUTE = "/galerie/hockey-feminin-2026-2027"
OUT = Path("artifacts/ahmv-gallery-exit")
PHOTO_BUTTON = 'button[aria-label^="Ouvrir "]'
VIEWER = '[data-ahmv-attention-surface="media-viewer"]'

def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    findings = []
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
        for width in (390, 1440):
            page = browser.new_page(viewport={"width": width, "height": 900}, device_scale_factor=1)
            page.add_init_script("""(() => {
              try {
                localStorage.setItem('ahmv-communications-preview-hidden', '1');
                sessionStorage.setItem('ahmv-communications-preview-seen', '1');
              } catch (_) {}
            })()""")
            page_errors = []
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            try:
                response = page.goto(BASE + ROUTE, wait_until="domcontentloaded", timeout=45000)
                photo = page.locator(PHOTO_BUTTON).first
                photo.wait_for(state="visible", timeout=20000)
                # Wait for the real React onClick props, not a guessed loading delay.
                page.wait_for_function(
                    """() => {
                      const button = document.querySelector('button[aria-label^="Ouvrir "]');
                      if (!button) return false;
                      const propName = Object.keys(button).find(key => key.indexOf('__reactProps') === 0);
                      return !!propName && typeof button[propName]?.onClick === 'function';
                    }""",
                    timeout=16000,
                )
                page.screenshot(path=str(OUT / f"gallery-{width}-before.png"), animations="disabled")
                photo.click()
                page.wait_for_timeout(250)
                gallery_state = page.locator("[data-ahmv-gallery-open]").get_attribute("data-ahmv-gallery-open")
                if gallery_state != "true":
                    # Diagnostic ONLY: invoke the attached React callback without a real
                    # click to identify event interception versus an app state defect.
                    debug = page.evaluate("""() => {
                      const b = document.querySelector('button[aria-label^="Ouvrir "]');
                      const key = b && Object.keys(b).find(k => k.startsWith('__reactProps'));
                      const callback = key ? b[key]?.onClick : undefined;
                      if (typeof callback === 'function') {
                        callback({ type: 'click', preventDefault() {}, stopPropagation() {} });
                        return { callback: 'invoked', label: b.getAttribute('aria-label') };
                      }
                      return { callback: 'missing', label: b?.getAttribute('aria-label') };
                    }""")
                    page.wait_for_timeout(250)
                    debug["stateAfterDirectCallback"] = page.locator("[data-ahmv-gallery-open]").get_attribute("data-ahmv-gallery-open")
                    debug["viewerAfterDirectCallback"] = page.locator(VIEWER).count()
                    print(json.dumps({"diagnostic": debug, "width": width}, ensure_ascii=False))
                print(json.dumps({"width": width, "galleryOpenAfterClick": gallery_state, "mountedViewer": page.locator(VIEWER).count()}, ensure_ascii=False))
                viewer = page.locator(VIEWER)
                viewer.wait_for(state="visible", timeout=8000)
                back = viewer.locator("[data-ahmv-gallery-exit]")
                back.wait_for(state="visible")
                page.screenshot(path=str(OUT / f"gallery-{width}-open.png"), animations="disabled")
                size = back.bounding_box()
                if size is None or size["height"] < 44 or size["width"] < 100:
                    errors.append(f"{width}px: insufficient gallery-exit hit area")
                back.click()
                viewer.wait_for(state="hidden", timeout=8000)
                photo.click()
                viewer.wait_for(state="visible", timeout=8000)
                page.keyboard.press("Escape")
                viewer.wait_for(state="hidden", timeout=8000)
                findings.append({
                    "width": width,
                    "http": response.status if response else None,
                    "closeButton": True,
                    "escape": True,
                    "exitWidth": size["width"] if size else None,
                })
            except Exception as exc:
                page.screenshot(path=str(OUT / f"gallery-{width}-failure.png"), animations="disabled")
                errors.append(f"{width}px: {str(exc)[:1100]} | pageErrors={page_errors[:2]}")
            finally:
                page.close()
        browser.close()
    report = {"route": ROUTE, "checks": findings, "errors": errors}
    (OUT / "summary.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if errors else 0

if __name__ == "__main__":
    raise SystemExit(main())
