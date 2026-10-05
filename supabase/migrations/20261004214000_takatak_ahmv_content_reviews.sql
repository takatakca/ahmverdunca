-- Four-eyes moderation workflow for TAKATAK-managed AHMV website/SEO revisions.
-- Backend-only: no public/dashboard route is mounted by this migration.

create table if not exists public.ahmv_takatak_control_reviews (
  id uuid primary key default gen_random_uuid(),
  tenant text not null default 'ahmverdun' check (tenant = 'ahmverdun'),
  organization_id text not null,
  service text not null check (service in ('website','seo')),
  control_record_id uuid not null
    references public.ahmv_takatak_control_records(id) on delete cascade,
  revision bigint not null check (revision >= 1),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','cancelled')),
  requested_by text not null,
  requested_at timestamptz not null default now(),
  resolved_by text,
  resolved_at timestamptz,
  decision_note text,
  self_approval_override boolean not null default false,
  created_at timestamptz not null default now(),
  unique (control_record_id, revision),
  check (decision_note is null or char_length(decision_note) <= 2000),
  check (
    (status = 'pending' and resolved_by is null and resolved_at is null)
    or
    (status <> 'pending' and resolved_by is not null and resolved_at is not null)
  )
);

create index if not exists idx_ahmv_takatak_control_reviews_queue
  on public.ahmv_takatak_control_reviews(
    organization_id, status, requested_at asc
  );

create index if not exists idx_ahmv_takatak_control_reviews_record
  on public.ahmv_takatak_control_reviews(
    control_record_id, revision desc
  );

alter table public.ahmv_takatak_control_reviews enable row level security;

revoke all on table public.ahmv_takatak_control_reviews
  from public, anon, authenticated;

grant all on table public.ahmv_takatak_control_reviews
  to service_role;

comment on table public.ahmv_takatak_control_reviews is
  'Server-only revision moderation for TAKATAK-managed AHMV website/SEO desired-state. Approval applies to one exact revision and never carries forward to a newer draft.';
