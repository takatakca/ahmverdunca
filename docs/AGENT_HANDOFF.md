# AHM Verdun — active agent handoff

**Updated 2026-11-07 (UTC).** Read this file after `AGENTS.md`, then `docs/TASK_QUEUE.md`, top of `WORKLOG.md` and live GitHub state. Do not assume that the last source/doc SHA equals the deployed compiled SHA.

## Read first: production moved to a Contabo VPS (Coolify)

- `ahmverdun.ca` / `www` resolve to **209.145.49.63** (`vmi3681142.contaboserver.net`, Let's Encrypt cert from 2026-10-26). MochaHost (209.42.24.127) no longer serves the domain. The cutover was done outside this repo; no Coolify config, webhook or deploy key exists in GitHub.
- The VPS runs a **pre-2026-11-06 build**: `/horaires` shows "mise à jour du 2 octobre 2026" (weeks 4–5), and `/healthz` returns `{"ok":true,"service":"ahmverdun-web","release":"unversioned"}`.
- `deploy-production-auto.yml` (MochaHost) keeps running. Run [42320393675](https://github.com/takatakca/ahmverdunca/actions/runs/42320393675) activated 369da9d on MochaHost, failed "Verify health" (the public URL reaches the VPS) and rolled MochaHost back to `039111a`. That red run does not touch the live site.

## Work completed in this session (all on `main`, main CI green)

1. **801b2f9**: weeks 9–11 (2026-11-02 → 11-22, 119 activities) from the official AHMV PDFs; each activity cites its own week's PDF; validator enforces contiguous integrated weeks; SMS "SEMAINE" stops at Sunday. Louves A and Louves B shown as two teams (`/equipes/feminin` card for Louves B, `#horaire-equipe` on `/equipes/louves-m12b`). No invented directory ID for Louves B.
2. **369da9d**: high audit findings cleared — vite 8.1.6, zod ^4.6.7 (no patched 3.x), in-range follow-redirects/launch-editor, Voice `package-lock.json` follow-redirects. Main CI [42320332963](https://github.com/takatakca/ahmverdunca/actions/runs/42320332963) and Voice CI success.
3. **Coolify deploy path** (commit after 369da9d; query `main`): `.github/workflows/deploy-coolify.yml` + `/healthz` runtime fallback to Coolify `SOURCE_COMMIT` (hex only, verified locally on the built server) + validator assertions. Skips with a notice until secrets exist.

## Owner actions that unblock production (cannot be done by an agent)

1. In Coolify, open the ahmverdun application and **Redeploy** branch `main`.
2. In the app's Advanced settings, enable **Include Source Commit in Build**, so `/healthz` reports the commit.
3. Add GitHub secrets `COOLIFY_DEPLOY_WEBHOOK` (the app's Deploy Webhook URL) and `COOLIFY_API_TOKEN`. After that, every green `main` deploys automatically with SHA proof.
4. Decide when to disable the MochaHost auto-deploy (kept for now as rollback).

## Still owner-gated (unchanged)

- Issue #400 / draft PR #401 (Louves M12B app rebuild) and draft PR #403 (Horaires photo selector) need owner visual approval; green CI is not authorization. PR #412 is a draft with no live publish.
- TAKATAK Auth/Parent Premium entitlements #120, Phone/SMS/Voice #127, Supabase access, youth photo consent and provider OAuth remain external gates.

## Exact next action

1. Query `main`, Actions runs and `https://ahmverdun.ca/healthz`. If it reports the `main` SHA, verify `/horaires` (weeks 9–11, five PDF buttons), `/equipes/feminin` (Louves B card) and `/equipes/louves-m12b#horaire-equipe`, then record the proof in `docs/DEPLOYMENT.md`.
2. If still `unversioned`/old, the owner actions above are pending; continue independent product work (it ships on the next Coolify deploy).
3. Never disable `bun audit --audit-level=high`; never put Coolify/VPS secrets in git.

**Status:** source complete and green for the schedule, Louves A/B and audit fix; **not yet live** pending a Coolify redeploy.
