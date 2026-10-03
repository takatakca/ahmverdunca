# AHM Verdun — Team Content Ingestion Blueprint

Status: architecture blueprint only. No automatic publishing is enabled by this document.

## Goal

Create a safe future workflow where coaches, parents, volunteers and authorized association staff can send team updates by email or upload documents, and the AHM Verdun platform can turn those inputs into structured publication candidates for the correct team/category.

The system must make contributing easier without allowing unreviewed email, attachments or AI output to become public.

## Core rule

Incoming content is a **candidate**, never an authoritative publication.

Every candidate follows:

```
Source -> Intake -> Extraction -> Classification -> Safety checks -> Human review -> Publish -> Audit
```

No source skips human review until AHMV explicitly approves a narrower automation rule for that source.

## Sources

Initial supported sources can include:

- email sent to an AHMV-controlled address;
- forwarded association email;
- PDF/DOCX attachment;
- image or scanned notice;
- approved team Facebook/Instagram URL;
- official schedule/results provider;
- manual admin submission.

A future GROUPE TAKATAK integration may provide shared identity, permissions, audit and automation infrastructure. AHMV remains the owner of its hockey content and team-scoped publication decisions.

## Exact team routing

Never route by display name alone. Multiple teams can share names such as "LEAFS VERDUN".

Use this priority:

1. exact public team ID (for example the GameData/team directory identifier);
2. explicit category + level + team name;
3. known approved sender-to-team mapping;
4. manual reviewer selection.

If routing confidence is not high enough, leave the candidate unassigned.

## Intake record

Each submission should receive an immutable intake ID and preserve:

- source type;
- received timestamp;
- sender identity when permitted;
- subject/title;
- original attachment metadata;
- original source URL when applicable;
- candidate team/category;
- processing state;
- extraction version;
- reviewer;
- publication decision;
- final destination(s).

Suggested states:

`received -> extracting -> needs_review -> approved -> published`

Alternative terminal states:

`rejected`, `duplicate`, `quarantined`, `superseded`.

## Document processing

### Text-first

For PDF and office files, first attempt native text/document extraction. Preserve headings, tables, dates and links where possible.

Do **not** OCR a PDF merely because it is a PDF.

### Scanned/image documents

Use vision/OCR only when the page is actually image-based or usable text cannot be extracted natively.

OCR output is never treated as exact source text without validation, especially for:

- dates;
- times;
- team IDs;
- scores;
- addresses;
- email addresses;
- phone numbers;
- names.

Keep a reference to the source page for reviewer verification.

## Classification

The extraction layer may propose:

- content type: news, schedule, cancellation, registration, tournament, document, photo, team update, arena update;
- team/category;
- effective date;
- expiry date;
- title;
- summary;
- links;
- attachments;
- suggested destination section.

The classifier must return confidence/evidence, not only a label.

## Children and personal information

The public portal must not automatically extract or republish:

- player rosters;
- birth dates;
- private parent/player contact information;
- medical information;
- attendance/private team-chat data;
- school or home address;
- other unnecessary identifying information about minors.

If an attachment contains private information, the candidate may still be useful, but only the minimum approved public information should be extracted.

## Schedule and results authority

Official hockey systems remain authoritative for schedules, standings and results unless AHMV formally changes the source of authority.

The website can:

- deep-link to the exact team;
- mirror a verified public snapshot with source/time metadata;
- show a direct connector result;
- notify families of changes.

It must not create parallel invented scores or schedules.

Every mirrored result should retain:

- provider;
- provider team ID;
- source URL;
- fetched/published timestamp;
- status (live/verified/archive);
- last successful sync.

## Social accounts

Only association-approved accounts are rendered publicly.

Each exact-team social account should be keyed by the public team ID, not the display name.

Candidate social links found on the web remain non-public until verified.

Recommended lifecycle:

`candidate -> verified -> approved -> active -> retired`.

## Email workflow

A future email agent can:

1. detect a new AHMV submission;
2. store the source message reference;
3. extract attachments;
4. classify the submission;
5. identify the likely team/category;
6. detect duplicates or an update to an existing item;
7. create a structured draft;
8. notify a reviewer;
9. publish only after approval;
10. send an acknowledgement/status response.

Do not make email itself an unrestricted publishing API.

## Word/DOCX workflow

For Word files:

- parse document structure and text;
- preserve tables/lists where useful;
- extract embedded links/media metadata;
- convert content into a structured candidate;
- never publish tracked changes/comments/private metadata by default.

## Duplicate handling

Use a stable fingerprint based on source + attachment hash + normalized content + event date/team when available.

Repeated forwarding of the same PDF should update the existing candidate instead of producing several public posts.

## Publication targets

Approved content can route to one or several destinations:

- team/category page;
- news;
- weekly schedule alert;
- tournament;
- coaches/resources;
- gallery;
- arena notice;
- homepage alert;
- email/SMS/phone information layer.

The publication decision should record every destination.

## Future phone/SMS reuse

Structured approved content can later feed the AHMV phone/SMS information service.

Example:

`team ID -> current approved schedule snapshot -> voice/SMS response`

The phone layer should consume approved structured data; it should not independently interpret arbitrary incoming email.

## Audit

Every automated step and human change should be attributable.

Minimum audit fields:

- intake ID;
- source reference;
- processor/version;
- before/after structured data;
- reviewer identity;
- decision;
- publication timestamp;
- rollback/supersession reference.

## Rollout phases

### Phase 1 — now

- exact public team IDs;
- exact schedule/results links;
- approved social-link data model;
- email "suggest an update" entry point;
- manual review.

### Phase 2

- controlled email intake;
- native PDF/DOCX extraction;
- draft classification;
- reviewer queue.

### Phase 3

- social candidate discovery and approval;
- official results/schedule connector;
- structured team feeds.

### Phase 4

- notification fan-out;
- SMS/phone responses;
- team-specific communications;
- narrowly scoped auto-publish rules for trusted sources, if AHMV approves them.

## Non-negotiables

- No invented team data.
- No unverified social account published as official.
- No automatic public roster of minors.
- No silent source replacement.
- No AI-generated claim presented as an official result.
- No destructive overwrite without audit/rollback.
- Source authority and timestamp always remain traceable.
