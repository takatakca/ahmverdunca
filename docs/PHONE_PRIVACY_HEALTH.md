# AHMV Phone/SMS — privacy retention and internal health

## Privacy retention

The phone service intentionally does not store inbound SMS bodies or voice transcripts in the interaction audit.

Outbound message bodies may exist temporarily in `ahmv_phone_message_jobs.payload` so delivery can be operated and debugged.

Default retention policy:

- outbound message body / provider error details: 30 days;
- interaction audit: 90 days;
- completed message jobs: 180 days.

Configuration:

```
AHMV_PHONE_RETENTION_ENABLED=false
AHMV_PHONE_MESSAGE_BODY_RETENTION_DAYS=30
AHMV_PHONE_INTERACTION_RETENTION_DAYS=90
AHMV_PHONE_JOB_RETENTION_DAYS=180
```

Cron endpoint:

```
POST /api/ahmv/cron/phone-retention
Authorization: Bearer <LOVABLE_CRON_SECRET>
```

The endpoint remains 404 while retention is disabled.

The retention task does not purge communication contacts or TAKATAK membership identity. Those records require the master GROUPE TAKATAK retention/account policy rather than a generic AHMV log timer.

## Internal health

Protected endpoint:

```
GET /api/ahmv/phone-ops/health
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
```

Requires:

```
AHMV_PHONE_OPS_ENABLED=true
```

The response only reports booleans/state:

- phone enabled/public flags;
- expected public number configured;
- expected webhook origin configured;
- Twilio SID/token present or absent;
- communication tables reachable;
- TAKATAK entitlement/events integration configured;
- demo enabled/disabled.

It never returns:

- secret values;
- Supabase service key;
- Twilio Auth Token;
- phone contact records;
- SMS bodies;
- transcripts.

The endpoint returns 503 when core phone database tables are not ready, making it useful for launch diagnostics without exposing operational secrets.
