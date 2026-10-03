-- GROUPE TAKATAK membership projection for the AHMV communication edge.
alter table public.ahmv_phone_contacts
  add column if not exists premium_expires_at timestamptz;

create table if not exists public.ahmv_phone_entitlement_sync_events (
  event_id text primary key,
  contact_id uuid references public.ahmv_phone_contacts(id) on delete set null,
  takatak_identity_id text,
  product_code text not null,
  membership_status text not null
    check (membership_status in ('active','inactive','blocked')),
  entitlement_expires_at timestamptz,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index if not exists idx_ahmv_phone_entitlement_sync_contact
  on public.ahmv_phone_entitlement_sync_events(contact_id, received_at desc);

alter table public.ahmv_phone_entitlement_sync_events enable row level security;
grant all on public.ahmv_phone_entitlement_sync_events to service_role;

comment on column public.ahmv_phone_contacts.premium_expires_at is
  'Cached TAKATAK membership expiry. TAKATAK remains the authoritative billing and entitlement system.';
comment on table public.ahmv_phone_entitlement_sync_events is
  'Idempotency/audit projection for TAKATAK membership lifecycle events. Does not grant marketing consent.';
