# TAKATAK Dashboard — AHMV Phone/SMS metrics contract

This endpoint is the read-only operational bridge from the AHMV communication edge to GROUPE TAKATAK.

## Authentication

Server-to-server only.

```
Authorization: Bearer <TAKATAK_AHMV_SERVICE_TOKEN>
```

Required server flag:

```
AHMV_PHONE_OPS_ENABLED=true
```

Never expose the service token in browser code.

## Endpoints

### GET /api/ahmv/phone-ops/health

Operational readiness:
- communication database tables available;
- public number configured;
- webhook origin configured;
- Twilio credential presence;
- TAKATAK integration presence.

### GET /api/ahmv/phone-ops/summary

Small dashboard counters:
- total contacts;
- active trials;
- premium contacts;
- marketing opt-ins;
- 24h / 7d interaction counts;
- recent SMS delivery counts.

### GET /api/ahmv/phone-ops/funnel

Seven-day operational funnel for dashboards and alerts.

Response shape:

```json
{
  "generatedAt": "2026-10-03T12:00:00.000Z",
  "windowDays": 7,
  "contacts": {
    "total": 0,
    "activeTrials": 0,
    "expiredTrials": 0,
    "premium": 0,
    "blocked": 0,
    "trialsEndingWithin72h": 0
  },
  "demand": {
    "interactions7d": 0,
    "voice7d": 0,
    "sms7d": 0,
    "membershipRequired7d": 0,
    "handoffRequests7d": 0,
    "topIntents": []
  },
  "delivery": {
    "attempted7d": 0,
    "sent7d": 0,
    "failed7d": 0,
    "pendingOrSending": 0,
    "successRatePct": null
  },
  "daily": [],
  "privacy": {
    "containsPhoneNumbers": false,
    "containsMessageBodies": false,
    "containsProviderSids": false
  },
  "limits": {
    "interactionRowsCapped": false,
    "messageRowsCapped": false
  }
}
```

## Privacy contract

The operational endpoints must never expose:
- raw phone numbers;
- Twilio MessageSid / CallSid;
- message bodies;
- Twilio credentials;
- Supabase credentials;
- TAKATAK service tokens.

Only aggregated counts and non-identifying operational categories are returned.

## Dashboard use

Recommended TAKATAK cards:
- Active 30-day trials
- Trials ending within 72 hours
- Premium members
- Membership-gated requests
- Human callback requests
- Voice vs SMS usage
- SMS delivery success rate
- Failed messages
- Top requested intents
- Seven-day activity chart

Do not interpret `premium / total contacts` as a true conversion rate until TAKATAK sends explicit subscription lifecycle events. The API deliberately reports counts rather than inventing attribution.

## Scale note

The seven-day interaction/message detail query is capped at 5,000 rows per source. If either cap is reached, the corresponding `limits.*Capped` flag becomes true. At that point, move the aggregation into a database view/RPC or TAKATAK analytics pipeline instead of silently undercounting.


## Human follow-up metric

`demand.handoffRequests7d` counts privacy-safe Voice AI callback requests recorded with:

- `intent = "human_handoff"`
- `outcome = "requested"`

The aggregate endpoint does not expose the caller phone number, CallSid, free-form caller text or provider identifiers. Callback fulfillment must be handled by an authorized server-side TAKATAK/AHMV operator workflow rather than exposing personal phone data in a public dashboard payload.


### GET /api/ahmv/phone-ops/value-report

Thirty-day, privacy-safe client value report for the managed Voice service.

It reports:

- Voice calls handled;
- automated Voice minutes/hours;
- average call duration;
- total conversational turns;
- FR/EN/ES usage;
- schedule and arena lookup counts;
- authoritative lookup responses;
- `verifiedDataHitRatePct`;
- human callback requests;
- recap SMS count;
- sent/failed message-job counts;
- tracked estimated provider cost from the configured cost model;
- cost-estimate coverage.

The endpoint is server-to-server only and uses the same protected ops bearer token.

It must never expose:

- phone numbers;
- CallSid / MessageSid;
- message bodies;
- raw transcripts;
- caller free-form explanations;
- secrets.

The cost block is an operational estimate only. It is explicitly marked `billingAuthority: false`; GROUPE TAKATAK billing remains authoritative.

#### Verified data hit rate

`verifiedDataHitRatePct` is:

```
authoritative schedule/arena lookup responses
------------------------------------------------ × 100
total schedule/arena lookup attempts
```

Expired, stale, unavailable or ambiguous schedule sources are not counted as authoritative. A verified `no_match` from a healthy official source is authoritative because it safely answers that no matching event was found.

This metric measures data quality/answer confidence, not customer satisfaction.
