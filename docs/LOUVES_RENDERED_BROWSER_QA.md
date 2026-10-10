# Louves M12B — Real React browser QA

**Purpose:** close the visual-verification gap in the Louves pilot (#395) and mobile polish (#396). Previous screenshots were from an offline design reconstruction; they were not screenshots of the production app.

## What runs

The opt-in / scoped PR workflow `.github/workflows/ahmv-louves-visual.yml` runs a real `bun run dev` instance of this repository, starts an isolated Chromium from Playwright and examines **the actual TanStack/React route** `/equipes/louves-m12b`.

The browser script `scripts/visual-smoke-louves.py` records the actual page at four widths (320, 390, 768, 1440 pixels), plus `summary.json` with:
- route HTTP response, heading, local crest image load status;
- document width vs viewport width (horizontal overflow);
- presence of public schedule/gallery links;
- seven future/private modules collapsed initially and revealed through native `details` interaction;
- basic minimum tap-target sizes within the microsite.

The workflow uploads screenshots and metrics as a GitHub Actions artifact for human review; if the page fails checks, the browser job fails. No secrets or private provider data are required. This workflow does not deploy or trigger MochaHost.

## How to run

1. On your laptop/runner, install locked dependencies with `bun install --frozen-lockfile`.
2. Start the site via `bun run dev -- --host 127.0.0.1 --port 8080`.
3. Install Playwright into a standalone Python virtual environment: `python -m venv .venv-visual`, `.venv-visual/bin/pip install playwright==1.55.0`, `.venv-visual/bin/python -m playwright install chromium`.
4. Run `.venv-visual/bin/python scripts/visual-smoke-louves.py`.
5. Inspect `artifacts/louves-visual/louves-{width}.png` and `summary.json`.

CI installs Chromium dependencies in the runner. Avoid committing the screenshots: they are review outputs, not source assets.

## Important limits

- Captures are **locally rendered React application** screenshots. They do not verify MochaHost deployment, real production health, or connectivity to TeamLinkt, which is still not configured.
- Public image-host failures and visual subjectivity require additional manual review. The test's overflow/touch thresholds are smoke checks, not full WCAG certification.
- Do not claim production verified until **green main CI + successful MochaHost deploy + matching health SHA + live route/mobile verification**.
- Only add corresponding visual checks for another team once its exact team metadata and media are approved.

No changes to the site home, general navigation, TAKATAK master application, mail integration, or private team content are part of this increment.


## Verified browser result — PR #397 (2026-10-10)

- **AHM Verdun CI #1202: SUCCESS** on commit `25001ab1987f41dcdd20605180a2a66175f86df0`.
- **AHMV Louves Visual QA #4: SUCCESS**, run `38084952618`. [Workflow run](https://github.com/takatakca/ahmverdunca/actions/runs/38084952618); [screenshot and JSON artifact](https://github.com/takatakca/ahmverdunca/actions/runs/38084952618/artifacts/11682660075).
- Real local React/TanStack HTTP route: **200** on 320, 390, 768 and 1440px viewports.
- `scrollWidth === innerWidth` at each width (320/320, 390/390, 768/768, 1440/1440).
- Genuine Louves crest asset loaded at every width; expected M12B heading present, calendar/gallery public links available, details collapsed then opened, and all seven private/future modules remain inside the disclosure. No sub-40px links within the microsite section.
- Corrected a real accessibility defect in the microsite layout: nested `main` landmarks caused the initial browser QA run to fail. The team component is now a semantic `section` inside the existing global `main`. Browser now records **one** main landmark at every tested width.

### One visual issue outside this PR's scope

Real 320px and 390px screenshots reveal the *global* floating mobile Assistant launcher overlapping the `VOTRE ACCÈS RAPIDE / PRÊT POUR LA GLACE` heading above the bottom navigation. This is owned by **PR #391**, which is already addressing the global Assistant launcher. Evidence and reproduction were [posted to its PR discussion](https://github.com/takatakca/ahmverdunca/pull/391). Do not duplicate or conflict with that agent's mobile nav fixes. After #391 merges, repeat the same viewport screenshots to confirm no occlusion.

The screenshots are produced from GitHub Actions' **local dev server** running the real AHMV source. They are **not production screenshots**, and no MochaHost live SHA, health endpoint or DNS was confirmed in this run.
