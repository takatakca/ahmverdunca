# AHMV continuation — 2026-10-06

## Verified starting point

The last Claude Code session stopped at 11:22 America/New_York on October 6 after preparing local commit `bd3756b` (article discussions), five Facebook images and one mirrored comment. Its next stated task was reviewing the official Instagram account `ahm_verdun`.

The older handoff and its stashes are historical: welcome, correction pens, association media, zoom/pan and the recent Facebook article batches have already reached `main`. Do not reapply or merge those changes again.

At this continuation's start, `main` and `GET https://ahmverdun.ca/healthz` both reported `df0d017f4b43a34a7eaee17e90fcb4bd182f6854`. CI #1074 and production deployment #843 succeeded. A source commit alone does not certify deployment; check the `release` field of `/healthz` after each subsequent deployment.

## This publication lot

- Recover the article discussion section and five locally saved Facebook images.
- Mirror the verified October 3 comment with an abbreviated author name and an exact comment permalink. Unknown comment dates may be omitted; supplied dates must be valid calendar dates.
- Use a validated identified Facebook post for the discussion action, including an approved source correction. Page-only sources offer the official contact route instead of an invented thread.
- Validate local article image files and comment provenance during `check:data`.
- Keep welcome-to-assistant keyboard focus in the assistant, trap Tab/Shift+Tab, close with Escape, and restore focus to the opener.
- Constrain article grid columns on mobile so body and discussion content do not extend beyond the viewport.

Browser validation covered the welcome/assistant handoff, initial focus, Tab wrap, Escape return, the verified comment and its source links, and a 390 px article viewport. Full public-site CI-equivalent gates and a production artifact build are required before merge. Voice remains a separate service; its syntax/tests and production dependency audit also passed, without starting the service.

## Open work after this lot

- Review and publish verified Instagram archives using their original dates and seasons. The latest publicly visible post examined is January 11, 2026, not a current-season announcement.
- Reconcile Facebook coverage against actual post permalinks. There are 51 articles at this checkpoint, including 17 identified Facebook posts, two page-only Facebook sources and one verified comment. The old phrase “about 39 posts” is not an enumerable completion manifest.
- Resolve source ambiguity for the Denis-Savard cancellation wording and the two page-only posts; do not infer missing exact dates or links.
- Member comment submission, authentication and moderation remain unimplemented in this discussion lot. Links to Facebook are functional; they are not an automatic Meta import.
- Automatic Meta ingestion, live provider feeds, newsletter delivery, commercial services and VPS migration need their actual configured services and verification. Existing phone/provider/indexing safeguards remain in force.

The entire product is not certified complete by this publication. Maintain this distinction in status updates and subsequent handoffs.
