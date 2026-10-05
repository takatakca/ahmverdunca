import { buildOfficialWeekSnapshot } from "../src/lib/official-week-snapshot";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const sourceUpdatedAt = process.env.AHMV_WEEKLY_SOURCE_UPDATED_AT?.trim();

if (!sourceUpdatedAt) {
  console.error(
    "Missing AHMV_WEEKLY_SOURCE_UPDATED_AT. Supply the real offset-aware source publication timestamp; it is never inferred.",
  );
  process.exit(2);
}

let snapshot;
try {
  snapshot = buildOfficialWeekSnapshot(sourceUpdatedAt);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Invalid weekly schedule snapshot.");
  process.exit(2);
}

if (!apply) {
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        status: snapshot.status,
        updatedAt: snapshot.updatedAt,
        sourceUrl: snapshot.sourceUrl,
        eventCount: snapshot.events.length,
        firstEvent: snapshot.events[0]?.startsAt ?? null,
        lastEvent: snapshot.events.at(-1)?.endsAt ?? null,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const ingestUrl = process.env.TAKATAK_AHMV_SCHEDULE_INGEST_URL?.trim();
const ingestToken = process.env.TAKATAK_AHMV_INGEST_TOKEN?.trim();

if (!ingestUrl || !ingestToken) {
  console.error(
    "Apply mode requires TAKATAK_AHMV_SCHEDULE_INGEST_URL and TAKATAK_AHMV_INGEST_TOKEN.",
  );
  process.exit(2);
}

let parsedUrl: URL;
try {
  parsedUrl = new URL(ingestUrl);
} catch {
  console.error("TAKATAK_AHMV_SCHEDULE_INGEST_URL must be a valid HTTPS URL.");
  process.exit(2);
}
if (parsedUrl.protocol !== "https:") {
  console.error("TAKATAK_AHMV_SCHEDULE_INGEST_URL must use HTTPS.");
  process.exit(2);
}
if (ingestToken.length < 32) {
  console.error("TAKATAK_AHMV_INGEST_TOKEN must be at least 32 characters.");
  process.exit(2);
}

const response = await fetch(parsedUrl, {
  method: "POST",
  headers: {
    authorization: `Bearer ${ingestToken}`,
    "content-type": "application/json",
    "x-ahmv-tenant": "ahmverdun",
  },
  body: JSON.stringify(snapshot),
  signal: AbortSignal.timeout(15_000),
});

const body = await response.text();
let parsed: unknown = body;
try {
  parsed = JSON.parse(body);
} catch {
  // Preserve non-JSON provider error text without printing any request secret.
}

if (!response.ok) {
  console.error(
    JSON.stringify({
      ok: false,
      status: response.status,
      response: parsed,
    }),
  );
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    status: response.status,
    response: parsed,
  }),
);
