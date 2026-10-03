-- AHMV communication edge. Hockey records stay authoritative outside this subsystem.
do $$
begin
  create type public.ahmv_phone_access_tier as enum ('guest','trial','premium','blocked');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ahmv_phone_channel as enum ('voice','sms','system');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.ahmv_phone_contacts (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  language text not null default 'fr' check (language in ('fr','en')),
  access_tier public.ahmv_phone_access_tier not null default 'trial',
  trial_started_at timestamptz not null default now(),
  trial_expires_at timestamptz not null default (now() + interval '30 days'),
  takatak_identity_id text,
  sms_consent boolean not null default false,
  transactional_sms_allowed boolean not null default true,
  marketing_sms_consent boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ahmv_phone_contacts_trial on public.ahmv_phone_contacts(trial_expires_at);
alter table public.ahmv_phone_contacts enable row level security;
grant all on public.ahmv_phone_contacts to service_role;

create table if not exists public.ahmv_phone_team_preferences (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.ahmv_phone_contacts(id) on delete cascade,
  public_team_id text not null,
  is_primary boolean not null default false,
  reminders_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  unique(contact_id, public_team_id)
);
alter table public.ahmv_phone_team_preferences enable row level security;
grant all on public.ahmv_phone_team_preferences to service_role;

create table if not exists public.ahmv_phone_interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.ahmv_phone_contacts(id) on delete set null,
  channel public.ahmv_phone_channel not null,
  provider_reference_hash text,
  intent text,
  outcome text not null,
  team_code text,
  arena_slug text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_ahmv_phone_interactions_contact_created on public.ahmv_phone_interactions(contact_id, created_at desc);
alter table public.ahmv_phone_interactions enable row level security;
grant all on public.ahmv_phone_interactions to service_role;

create table if not exists public.ahmv_phone_message_jobs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.ahmv_phone_contacts(id) on delete cascade,
  purpose text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','cancelled')),
  not_before timestamptz not null default now(),
  provider_sid text,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_ahmv_phone_message_jobs_pending on public.ahmv_phone_message_jobs(status, not_before);
alter table public.ahmv_phone_message_jobs enable row level security;
grant all on public.ahmv_phone_message_jobs to service_role;

comment on table public.ahmv_phone_contacts is 'AHMV communication contact edge; TAKATAK remains master commercial identity and entitlement authority.';
comment on column public.ahmv_phone_contacts.marketing_sms_consent is 'Must be explicit; an inbound call alone never grants marketing consent.';
