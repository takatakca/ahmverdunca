# AHM Verdun Voice AI — Bugbot Review Rules

Review Voice AI changes as production telephony infrastructure, not as ordinary application code.

Prioritize finding:
- broken Twilio signature validation;
- canonical URL mismatches behind reverse proxies;
- any bypass of the press-1 activation gate;
- unauthenticated bridge endpoints;
- secrets or credentials committed to git;
- raw transcript persistence;
- PII in health/readiness endpoints or logs;
- duplicate SMS paths;
- race conditions around reconnect/interruption/finalization;
- stale AI turns committing state after caller interruption;
- missing timeout/abort behavior;
- schedule answers that can fall back to guessed or stale data;
- private/anonymous caller SMS;
- loss of rollback capability;
- horizontal scaling while concurrency is process-local;
- missing FR/EN/ES behavior;
- new paid/premium logic that creates a second membership authority instead of TAKATAK entitlements;
- regressions in healthz/readyz, Docker, systemd, Nginx or graceful shutdown;
- dependency/security regressions.

For every Voice PR:
1. Check whether the change can affect a live caller.
2. Check whether failure is fail-closed.
3. Check whether the previous release can be restored quickly.
4. Check whether tests cover the failure mode that motivated the change.
5. Treat production-number routing changes as critical-risk.

Do not approve a Voice AI release solely because unit tests pass.
