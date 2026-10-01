# AHM Verdun — GROUPE TAKATAK integration boundary

This document is the current architectural rule for the AHM Verdun project.

## 1. Core rule

AHM Verdun keeps the authority for **hockey itself**.

GROUPE TAKATAK can progressively manage the **digital, communication, marketing, sponsor and customer-experience layer** around the association.

The public website must make hockey information easier to find without pretending TAKATAK owns the official hockey records.

## 2. Hockey systems remain authoritative

Do not rebuild or become the source of truth for:

- official hockey registration
- player files or rosters
- official team administration
- hockey payments
- medical or confidential player records
- game results and standings
- league operations
- official tournament operations
- official schedule decisions
- coach or referee operational systems already established by the association, league or provider

When an established platform such as Spordle, WLLV or an official tournament system owns the operation, the AHMV site should present a clear, polished gateway and send the user to the authoritative service.

## 3. What GROUPE TAKATAK may manage

The TAKATAK workspace for AHM Verdun can progressively cover:

- website content and presentation
- general public information
- newsletters and communication preferences
- marketing and campaign management
- Facebook, Instagram and other approved social channels
- Google presence, SEO, analytics and reporting
- sponsors, partnerships, renewals and visibility
- public events and promotional campaigns
- digital media and approved assets
- lead/contact follow-up for non-hockey commercial or communication purposes
- subscription and service billing between AHM Verdun and GROUPE TAKATAK
- AI-assisted content preparation with human approval
- future public-information assistant by web, phone, SMS or other approved channels

## 4. Public schedule experience

The website may provide a much better schedule experience for parents.

A future ingestion service may read an approved email, PDF, feed or export and normalize it for display.

That normalized calendar is a **presentation layer**, not a replacement for the association's authoritative schedule process.

Every imported schedule version should retain provenance, timestamps and validation status.

## 5. Authentication

Do not create a second AHM Verdun operational dashboard.

The public AHM Verdun site must not attach its own local authentication middleware or create volunteer/admin roles for hockey operations. Any historical prototype authentication/database scaffolding is non-authoritative and must remain disconnected from the public experience.

TAKATAK staff/client access belongs in the central GROUPE TAKATAK dashboard using the existing TAKATAK access model.

Parents do not need a TAKATAK account merely to read schedules, news, arenas or registration information.

Newsletter subscribers are communication contacts with consent; they are not automatically workspace users.

## 6. Sponsors

Sponsors and partnerships are in TAKATAK scope.

The future workspace may manage sponsor profiles, packages, terms, renewals, campaign visibility, approved assets, invoices/reporting and follow-up.

The public AHMV site must never invent sponsor logos or partnership levels. Only approved assets and validated terms may be published.

## 7. AI and automation

AI is a copilot.

It may draft, classify, summarize, search approved knowledge, prepare campaigns and suggest improvements.

Human approval remains required where appropriate, especially for sensitive communications, paid campaigns, major website changes or content involving minors.

The AI assistant must never invent an official hockey schedule, result, rule or registration decision.

## 8. Phone and voice

The reserved public number is:

- Display: 1 (581) 666-6AHM
- Dial: +1 581 666 6246

A future voice assistant may answer from the same approved public-information knowledge layer used by the website.

If an answer is not supported by validated information, the assistant must say so and direct the caller to the appropriate official source.

## 9. Failure boundary

AHM Verdun's official hockey operations must continue even if TAKATAK is unavailable.

Marketing, analytics, newsletter or AI outages must never block registration, schedules, results or other official hockey systems.
