# AHMV Facebook team album reconciliation

## Authority

The canonical expected team list is generated from `PUBLIC_TEAM_DIRECTORY` in:

`src/data/facebook-team-albums.ts`

Each manifest entry contains:

- exact AHMV public team ID;
- category and level;
- exact public team name;
- current AHMV season;
- a stable reconciliation key;
- the expected Facebook album name;
- FR/EN public description copy.

No Facebook album ID, access token or provider URL is stored in this manifest.

## Naming

Default format:

`AHMV | <category/level> | <exact team name> | <season>`

If two public teams would otherwise receive the same album name, the manifest adds the last four digits of the public team ID. This keeps reconciliation deterministic without inventing “team 1/team 2” labels.

## Authorized reconciliation workflow

When Facebook Page access is available:

1. Read the current manifest from the exact deployed/current-main SHA.
2. List the existing albums on the authorized AHM Verdun Facebook Page.
3. Match an existing album only when the exact team/season identity is unambiguous.
4. Create a missing album using `expectedAlbumName` and the approved description.
5. Never delete or rename an existing album solely because the display name is similar.
6. Record the real Facebook album ID in the TAKATAK connector/back-office mapping keyed by `reconciliationKey`.
7. Do not commit Facebook access tokens, Page tokens or provider secrets to this repository.
8. Do not place a Facebook provider album ID into AHMV source until an explicit architecture decision requires a public, non-secret identifier.
9. After reconciliation, verify that every current public team has exactly one mapped album and that no provider album is mapped to two public team IDs.

## Safety boundary

The manifest is planning/reconciliation data only. It does not prove that an album exists on Facebook and must never cause the public AHMV site to claim that an album is live before the provider mapping is verified.
