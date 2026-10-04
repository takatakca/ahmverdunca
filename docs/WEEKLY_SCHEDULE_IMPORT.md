# AHMV weekly PDF → structured schedule import

The public website must not make parents read a weekly PDF as the primary schedule experience. The PDF remains the official source, but its verified rows are transcribed into structured AHMV activities.

## Required workflow

1. Open the exact PDF listed in `WEEKLY_SCHEDULE_DOCUMENTS`.
2. Visually verify every page. Do not infer hidden, cropped, ambiguous or unpublished rows.
3. Create a temporary JSON transcription outside the public app using this shape:

```json
{
  "week": 5,
  "start": "2026-10-05",
  "end": "2026-10-11",
  "publishedAt": "2026-10-02",
  "sourceUrl": "https://ahmverdun.com/storage/90Cjd82i6cWwdFbIKvMD50CVxwud8InYzSR9S0v6.pdf",
  "method": "visual-transcription",
  "rows": [
    {
      "rowId": "page1-row1",
      "date": "2026-10-05",
      "start": "18:00",
      "end": "19:00",
      "venue": "À DENIS",
      "activity": "Pratique",
      "group": "M11 groupe 5",
      "sourcePage": 1
    }
  ]
}
```

4. Run:

```bash
bun run import:weekly-schedule -- /path/to/transcription.json
```

5. The import is refused when:
   - the week, date range, publication date or PDF URL differs from the registered official document;
   - a date/time is invalid or ambiguous;
   - venue/activity/group is missing;
   - a venue cannot be resolved to a verified arena.

6. Review the normalized JSON before integrating it into `OFFICIAL_WEEK_META` and `OFFICIAL_WEEK_ACTIVITIES`.

## Accuracy rules

- Never copy a row from an older week.
- Never guess a team, arena, opponent, score, time or cancellation.
- Never convert ambiguous text such as `9h12` into a start/end time without visual confirmation.
- Add a verified arena/alias first when the PDF uses a venue label the directory does not recognize.
- Preserve the PDF source URL and source page as provenance.

This pipeline is intentionally strict: refusing one uncertain row is better than sending a parent to the wrong rink or time.
