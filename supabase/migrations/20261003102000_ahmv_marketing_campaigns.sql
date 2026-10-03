-- AHMV marketing consent evidence + TAKATAK campaign execution projection.
alter table public.ahmv_phone_contacts
  add column if not exists marketing_sms_consented_at timestamptz,
  add column if not exists marketing_sms_consent_source text,
  add column if not exists marketing_sms_revoked_at timestamptz;

do $$
begin
  alter table public.ahmv_phone_contacts
    add constraint ahmv_phone_contacts_marketing_consent_source_check
    check (
      marketing_sms_consent_source is null
      or marketing_sms_consent_source in (
        'sms_keyword',
        'takatak_verified'
      )
    );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.ahmv_phone_campaign_executions (
  id uuid primary key default gen_random_uuid(),
  takatak_campaign_id text not null unique,
  campaign_name text not null,
  body_fr text not null,
  body_en text not null,
  audience jsonb not null,
  legal_info_url text not null,
  scheduled_at timestamptz not null,
  status text not null default 'queued'
    check (status in ('queued','dispatching','completed','cancelled','failed')),
  target_count integer not null default 0 check (target_count >= 0),
  queued_count integer not null default 0 check (queued_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ahmv_phone_campaign_executions_schedule
  on public.ahmv_phone_campaign_executions(status, scheduled_at);

alter table public.ahmv_phone_campaign_executions enable row level security;
grant all on public.ahmv_phone_campaign_executions to service_role;

comment on column public.ahmv_phone_contacts.marketing_sms_consented_at is
  'Evidence timestamp for explicit marketing SMS consent.';
comment on column public.ahmv_phone_contacts.marketing_sms_consent_source is
  'Source of explicit marketing consent. Inbound service use never grants this consent.';
comment on column public.ahmv_phone_contacts.marketing_sms_revoked_at is
  'Timestamp of the most recent marketing consent revocation.';
comment on table public.ahmv_phone_campaign_executions is
  'Read/write execution projection for TAKATAK-owned AHMV marketing campaigns. Message recipients remain consent-gated.';
