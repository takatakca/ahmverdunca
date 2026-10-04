# AHMV association access from TAKATAK

AHMV association management is not a default TAKATAK Dashboard feature.

A hockey association receives AHMV managed-service access only when TAKATAK provides a valid organization-scoped control grant.

## Grant requirements

The grant must bind:

- exact TAKATAK organization;
- exact actor;
- role;
- subscription identifier;
- configurable product code;
- subscription state;
- enabled managed services;
- explicit expiry.

Accepted states are:

- trialing;
- active;
- grace.

Suspended and cancelled grants do not authorize the control plane.

Prices are deliberately absent from this AHMV repository. GROUPE TAKATAK remains the pricing, card payment, credits and billing authority.

## Service-level subscription scope

An association may subscribe to a subset of services.

Example:

```text
organization: ahmv
enabled: website, hosting, seo, social
disabled: voice, sms, reviews
```

A role permission is never enough by itself. The requested service must also be enabled in the organization grant.

## Connectors

AHMV does not store provider credentials for managed integrations.

It may store/use opaque references such as:

```text
connectorId
provider
accountRef
service
secretLocation = takatak_vault
```

Actual Twilio, Google, Meta, Stripe or other provider secret material remains inside the TAKATAK integration/vault layer.

This lets the provider implementation change without coupling AHMV application code to one provider.

## Usage and credits

AHMV may emit metering facts such as a number of SMS segments, voice seconds, emails, automation executions or other measurable service units.

AHMV does not decide the credit price and does not charge a card.

TAKATAK receives the usage event and remains authoritative for:

- credit conversion;
- rate cards;
- included allowance;
- overage;
- invoice/card charge;
- refunds/adjustments.

That keeps commercial logic out of the standalone AHMV application.
