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

## Verified publication and follow-up lot

PR #364 merged with green PR CI #1075 and main CI #1076. Production deployment #845 succeeded, and `/healthz` reported `aa3fd84c590bda4a8e311a13f682a55855ad5d12`. The public M11/M13 article showed its verified discussion and the recovered image.

The follow-up lot adds ten bilingual Instagram archives covering twelve identified public posts, with twelve locally saved initial images and links to the full original carousels. Dates are converted to Montreal and historical seasons remain explicit. The Denis-Savard post date is corrected to September 22; two September 25 comments are separately attributed with their exact permalinks.

Installation help can be reopened from Bienvenue and the footer even after automatic dismissal. A native installation action is offered only when the browser actually supplies it; otherwise the guide uses the real iOS/Chrome path. The helper handles an already installed site. One shared Montreal alert policy is used on the home, header and welcome, with inclusive publication/expiry boundaries and future notices excluded.

The content bridge now reads its three private server settings from `process.env` at request time. Tests confirm configuration supplied after import takes effect without exposing credentials. Defaults and provider activation safeguards remain unchanged; this code correction does not certify a connected backend.

Full CI-equivalent gates and the final production artifact passed for this lot. Browser checks confirmed a 390 px installation dialog, keyboard focus/close/return, and the Nouvelles Instagram filter displaying ten archives. A subsequent successful deployment and matching `release` JSON field returned by `GET /healthz` are still required before certifying this follow-up as live.

## Article media and publication precision

The third lot makes every article cover expandable and shows all three verified initial photos in the grouped volunteer archive. The shared article/gallery viewer uses a portal above the sticky header, keyboard focus containment, Escape and return focus; zoom, pan and navigation remain available. Article margins use the existing navy palette with readable sidebar headings.

Publication metadata now distinguishes an exact timestamp, a calendar day and an unknown date. The rolling hour requires a verified instant; today and the 7/30-day windows use Montreal calendar dates. Missing dates never acquire a fabricated noon or summer UTC offset. Invalid dates/corrections remain safe, and displayed labels and JSON-LD use the corrected verified metadata. The clock refreshes each minute and when returning to the page.

Checks: all CI-equivalent gates, production build and artifact validation passed; the data suite has 26 tests and 160 assertions. Browser checks covered the third volunteer image, circular navigation/zoom/Escape, the existing eight-image girls gallery, and the actual compiled Node artifact with no rendering errors. The Instagram filter returned ten archives, including January 11 at the verified 10:05 Montreal time; the today filter returned no articles for the current day. This third lot still requires its own successful production deployment and matching runtime identity.

## Open work after these lots

- Verify the Instagram follow-up deployment. The latest public post examined is January 11, 2026, not a current-season announcement. Twelve initial images are mirrored; original links expose the complete carousels.
- Reconcile Facebook coverage against actual post permalinks. There are now 61 articles, including ten Instagram archives and three verified Facebook comments. The old phrase “about 39 posts” is not an enumerable completion manifest.
- Resolve the two page-only Facebook sources; do not infer missing exact dates or links.
- Member comment submission, authentication and moderation remain unimplemented in this discussion lot. Links to Facebook are functional; they are not an automatic Meta import.
- Automatic Meta ingestion, live provider feeds, newsletter delivery, commercial services and VPS migration need their actual configured services and verification. Existing phone/provider/indexing safeguards remain in force.

The entire product is not certified complete by this publication. Maintain this distinction in status updates and subsequent handoffs.
