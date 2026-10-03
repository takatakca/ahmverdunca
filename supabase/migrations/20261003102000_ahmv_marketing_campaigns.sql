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

create table if not exists public.ahmv_phone_marketing_consent_events (
  event_id text primary key,
  contact_id uuid not null references public.ahmv_phone_contacts(id) on delete cascade,
  consent boolean not null,
  source text not null
    check (source in ('sms_keyword','takatak_verified','carrier_opt_out')),
  occurred_at timestamptz not null,
  applied boolean not null default false,
  received_at timestamptz not null default now()
);

create index if not exists idx_ahmv_phone_marketing_consent_events_contact
  on public.ahmv_phone_marketing_consent_events(contact_id, occurred_at desc);

alter table public.ahmv_phone_marketing_consent_events enable row level security;
grant all on public.ahmv_phone_marketing_consent_events to service_role;

create or replace function public.ahmv_apply_marketing_consent_event(
  p_event_id text,
  p_contact_id uuid,
  p_source text,
  p_consent boolean,
  p_occurred_at timestamptz,
  p_now timestamptz default now()
)
returns table (
  duplicate boolean,
  applied boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_latest timestamptz;
begin
  if
    p_event_id is null or btrim(p_event_id) = ''
    or p_contact_id is null
    or p_source not in ('sms_keyword','takatak_verified','carrier_opt_out')
    or p_occurred_at is null
    or p_occurred_at > p_now + interval '5 minutes'
  then
    raise exception 'invalid AHMV marketing consent event'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('marketing-consent|' || p_contact_id::text, 0)
  );

  if exists (
    select 1
    from public.ahmv_phone_marketing_consent_events
    where event_id = p_event_id
  ) then
    return query select true, false;
    return;
  end if;

  perform 1
  from public.ahmv_phone_contacts
  where id = p_contact_id
  for update;

  if not found then
    raise exception 'AHMV phone contact not found'
      using errcode = 'P0002';
  end if;

  select max(occurred_at)
    into v_latest
  from public.ahmv_phone_marketing_consent_events
  where contact_id = p_contact_id
    and applied = true;

  if v_latest is not null and p_occurred_at <= v_latest then
    insert into public.ahmv_phone_marketing_consent_events (
      event_id, contact_id, consent, source, occurred_at, applied
    )
    values (
      p_event_id, p_contact_id, p_consent, p_source, p_occurred_at, false
    );

    return query select false, false;
    return;
  end if;

  if p_consent then
    update public.ahmv_phone_contacts
    set
      marketing_sms_consent = true,
      marketing_sms_consented_at = p_occurred_at,
      marketing_sms_consent_source = p_source,
      marketing_sms_revoked_at = null,
      updated_at = p_now
    where id = p_contact_id;
  else
    update public.ahmv_phone_contacts
    set
      marketing_sms_consent = false,
      marketing_sms_revoked_at = p_occurred_at,
      updated_at = p_now
    where id = p_contact_id;
  end if;

  insert into public.ahmv_phone_marketing_consent_events (
    event_id, contact_id, consent, source, occurred_at, applied
  )
  values (
    p_event_id, p_contact_id, p_consent, p_source, p_occurred_at, true
  );

  return query select false, true;
end;
$$;

revoke all on function public.ahmv_apply_marketing_consent_event(
  text,uuid,text,boolean,timestamptz,timestamptz
) from public;

grant execute on function public.ahmv_apply_marketing_consent_event(
  text,uuid,text,boolean,timestamptz,timestamptz
) to service_role;

comment on table public.ahmv_phone_marketing_consent_events is
  'Immutable consent evidence projection for AHMV commercial SMS. Stale events are retained but not applied.';
comment on function public.ahmv_apply_marketing_consent_event(
  text,uuid,text,boolean,timestamptz,timestamptz
) is
  'Atomically records ordered/idempotent marketing consent evidence and updates the current consent projection.';

