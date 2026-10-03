-- AHMV independent parent experience data.
-- Billing, identity and entitlements remain TAKATAK-owned.
-- These tables hold only AHMV family workflow data and are server-only.

create table if not exists public.ahmv_families (
  id uuid primary key default gen_random_uuid(),
  owner_takatak_identity_id text not null unique,
  display_name text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ahmv_family_caregivers (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.ahmv_families(id) on delete cascade,
  takatak_identity_id text not null,
  role text not null default 'caregiver' check (role in ('owner','caregiver')),
  status text not null default 'active' check (status in ('active','invited','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, takatak_identity_id)
);

create table if not exists public.ahmv_family_children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.ahmv_families(id) on delete cascade,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ahmv_family_team_links (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.ahmv_family_children(id) on delete cascade,
  official_team_id text not null,
  team_label text,
  source text not null default 'official_feed',
  created_at timestamptz not null default now(),
  unique (child_id, official_team_id)
);

create table if not exists public.ahmv_rsvps (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.ahmv_families(id) on delete cascade,
  child_id uuid not null references public.ahmv_family_children(id) on delete cascade,
  official_event_id text not null,
  status text not null default 'unanswered'
    check (status in ('attending','not_attending','maybe','unanswered')),
  responded_by_identity_id text,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, official_event_id)
);

create table if not exists public.ahmv_autopilot_preferences (
  family_id uuid primary key references public.ahmv_families(id) on delete cascade,
  auto_calendar boolean not null default false,
  remind_rsvp boolean not null default true,
  alert_schedule_changes boolean not null default true,
  recalculate_departure boolean not null default true,
  notify_other_caregiver boolean not null default false,
  remind_documents boolean not null default true,
  group_children_activities boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ahmv_family_caregivers_identity_idx
  on public.ahmv_family_caregivers(takatak_identity_id);
create index if not exists ahmv_family_children_family_idx
  on public.ahmv_family_children(family_id);
create index if not exists ahmv_family_team_links_team_idx
  on public.ahmv_family_team_links(official_team_id);
create index if not exists ahmv_rsvps_family_idx
  on public.ahmv_rsvps(family_id);
create index if not exists ahmv_rsvps_event_idx
  on public.ahmv_rsvps(official_event_id);

-- Public schema is Data API exposed; keep all family workflow tables closed to
-- browser roles. The AHMV server performs entitlement/session checks first and
-- accesses these tables only with its server-side secret/service role.
alter table public.ahmv_families enable row level security;
alter table public.ahmv_family_caregivers enable row level security;
alter table public.ahmv_family_children enable row level security;
alter table public.ahmv_family_team_links enable row level security;
alter table public.ahmv_rsvps enable row level security;
alter table public.ahmv_autopilot_preferences enable row level security;

revoke all on table public.ahmv_families from anon, authenticated;
revoke all on table public.ahmv_family_caregivers from anon, authenticated;
revoke all on table public.ahmv_family_children from anon, authenticated;
revoke all on table public.ahmv_family_team_links from anon, authenticated;
revoke all on table public.ahmv_rsvps from anon, authenticated;
revoke all on table public.ahmv_autopilot_preferences from anon, authenticated;
