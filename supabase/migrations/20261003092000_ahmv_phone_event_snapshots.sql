-- Authoritative AHMV event snapshots used for reminder/change detection.
create table if not exists public.ahmv_phone_event_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null,
  public_team_id text not null,
  starts_at timestamptz not null,
  venue text not null,
  status text not null check (status in ('scheduled','cancelled')),
  source_group text,
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_event_id, public_team_id)
);

create index if not exists idx_ahmv_phone_event_snapshots_team_start
  on public.ahmv_phone_event_snapshots(public_team_id, starts_at);

alter table public.ahmv_phone_event_snapshots enable row level security;
grant all on public.ahmv_phone_event_snapshots to service_role;

comment on table public.ahmv_phone_event_snapshots is
  'Minimal authoritative event state for AHMV reminder planning and change detection. No roster or private player data.';
