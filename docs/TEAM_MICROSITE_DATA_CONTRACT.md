# AHMV team mini-site data contract

This document describes the public-data shape the AHM Verdun website is already prepared to consume. It is an integration contract for the website, not a private roster or membership database.

## Public endpoint implemented by the website

`GET /api/ahmv/team-games?teamId={PUBLIC_TEAM_ID}`

The AHMV server implements this endpoint as a sanitized, fail-closed proxy to GROUPE TAKATAK. It reuses the existing server-only `TAKATAK_AHMV_SERVICE_TOKEN` already shared by the AHMV schedule/Voice boundary instead of introducing a second credential. If that credential is missing, the central source is unavailable, or the exact team has not been mapped by the authoritative hockey feed, the website automatically falls back to the official public schedule/results links and never fabricates a game time or score.

Configuration:

- `TAKATAK_AHMV_SERVICE_TOKEN=...` — existing shared server credential
- `TAKATAK_TEAM_GAMES_ORIGIN=https://takatak.ca` — optional origin override; defaults to TAKATAK
- `TAKATAK_TEAM_GAMES_ENABLED=false` — optional emergency kill switch; absent/true allows the guarded connector to run

The normalized upstream contract is `GET /api/integrations/ahmv/team-games?teamId={PUBLIC_TEAM_ID}` on the configured HTTPS origin. Authentication and the exact-team scope header stay server-side and the public AHMV response is reduced to the approved fields documented below.

## Response

```json
{
  "status": "active",
  "updatedAt": "2026-10-03T12:00:00-04:00",
  "sourceUrl": "https://official-public-source.example/team",
  "nextGame": {
    "id": "public-game-id",
    "startsAt": "2026-10-17T18:30:00-04:00",
    "homeTeam": "COYOTES VERDUN",
    "awayTeam": "OPPONENT",
    "venue": "Arena name",
    "venueAddress": "Full public arena address",
    "status": "scheduled",
    "officialUrl": "https://official-public-source.example/game"
  },
  "latestResult": {
    "id": "public-game-id",
    "startsAt": "2026-10-10T18:30:00-04:00",
    "homeTeam": "COYOTES VERDUN",
    "awayTeam": "OPPONENT",
    "homeScore": 4,
    "awayScore": 2,
    "venue": "Arena name",
    "status": "final",
    "officialUrl": "https://official-public-source.example/game",
    "scoresheetUrl": "https://official-public-source.example/scoresheet"
  },
  "recentResults": [],
  "standing": {
    "rank": 2,
    "gamesPlayed": 8,
    "wins": 6,
    "losses": 2,
    "ties": 0,
    "points": 12
  }
}
```

## Rules

- Never invent or infer an official time, opponent, score, penalty, standing or venue.
- Cache public sports data and retain the source URL used for every imported record.
- Treat AHMV/GameData/Scoresheets or WLLV as the sport-data authority according to the team/circuit.
- Keep the public team identifier as the stable join key between the website and the connector.
- Do not mirror player birth dates, private contacts, medical information, authentication data or any other private roster data.
- If a venue address is present, the website automatically exposes Google Maps, Waze and Apple Maps directions.
- If the connector is down or not ready, return a non-active status or a non-2xx response; the site will show official source buttons instead of stale-looking fake data.

## Website surfaces already wired

- top-of-page next-game card
- latest result
- standings
- official schedule
- scoresheet/results handoff
- arena and directions
- team mini-site navigation
- future recent-results expansion

The website therefore does not need to be redesigned when the connector is activated. The integration only needs to satisfy this public contract.
