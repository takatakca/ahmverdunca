-- Server-only scheduled publication windows for approved AHMV website/SEO revisions.

create table if not exists public.ahmv_takatak_control_publication_schedules (
  id uuid primary key default gen_random_uuid(),
  tenant text not null default 'ahmverdun' check (tenant = 'ahmverdun'),
  organization_id text not null,
  service text not null check (service in ('website','seo')),
  control_record_id uuid not null
    references public.ahmv_takatak_control_records(id) on delete cascade,
  revision bigint not null check (revision >= 1),
  publish_at timestamptz not null,
  expires_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled','claimed','enqueued','cancelled','stale','failed')),
  requested_by text not null,
  requested_at timestamptz not null default now(),
  claimed_at timestamptz,
  completed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (control_record_id, revision),
  check (expires_at is null or expires_at > publish_at),
  check (last_error_code is null or char_length(last_error_code) <= 160)
);

create index if not exists idx_ahmv_takatak_publication_schedule_worker
  on public.ahmv_takatak_control_publication_schedules(
    status, publish_at asc, created_at asc
  )
  where status = 'scheduled';

create index if not exists idx_ahmv_takatak_publication_schedule_record
  on public.ahmv_takatak_control_publication_schedules(
    control_record_id, revision desc
  );

alter table public.ahmv_takatak_control_publication_schedules
  enable row level security;

revoke all on table public.ahmv_takatak_control_publication_schedules
  from public, anon, authenticated;

grant all on table public.ahmv_takatak_control_publication_schedules
  to service_role;

create or replace function public.ahmv_claim_takatak_publication_schedule(
  p_now timestamptz default now()
)
returns table (
  id uuid,
  organization_id text,
  service text,
  control_record_id uuid,
  resource_type text,
  resource_id text,
  revision bigint,
  publish_at timestamptz,
  expires_at timestamptz,
  requested_by text
)
language sql
security definer
set search_path = ''
as $$
  with candidate as (
    select s.id
    from public.ahmv_takatak_control_publication_schedules s
    where s.status = 'scheduled'
      and s.publish_at <= p_now
    order by s.publish_at asc, s.created_at asc
    for update skip locked
    limit 1
  ),
  claimed as (
    update public.ahmv_takatak_control_publication_schedules s
    set
      status = 'claimed',
      claimed_at = p_now,
      updated_at = p_now
    from candidate c
    where s.id = c.id
    returning s.*
  )
  select
    c.id,
    c.organization_id,
    c.service,
    c.control_record_id,
    r.resource_type,
    r.resource_id,
    c.revision,
    c.publish_at,
    c.expires_at,
    c.requested_by
  from claimed c
  join public.ahmv_takatak_control_records r
    on r.id = c.control_record_id;
$;

create or replace function public.ahmv_finish_takatak_publication_schedule(
  p_schedule_id uuid,
  p_status text,
  p_error_code text default null,
  p_now timestamptz default now()
)
returns table (
  id uuid,
  status text,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('enqueued','stale','failed') then
    raise exception 'invalid publication schedule completion status'
      using errcode = '22023';
  end if;

  update public.ahmv_takatak_control_publication_schedules
  set
    status = p_status,
    completed_at = p_now,
    last_error_code =
      case when p_error_code is null then null else left(p_error_code, 160) end,
    updated_at = p_now
  where id = p_schedule_id
    and status = 'claimed';

  if not found then
    raise exception 'publication schedule completion conflict'
      using errcode = '55000';
  end if;

  return query
    select s.id, s.status, s.completed_at
    from public.ahmv_takatak_control_publication_schedules s
    where s.id = p_schedule_id;
end;
$$;

revoke all on function public.ahmv_claim_takatak_publication_schedule(timestamptz)
  from public, anon, authenticated;
revoke all on function public.ahmv_finish_takatak_publication_schedule(
  uuid,text,text,timestamptz
) from public, anon, authenticated;

grant execute on function public.ahmv_claim_takatak_publication_schedule(timestamptz)
  to service_role;
grant execute on function public.ahmv_finish_takatak_publication_schedule(
  uuid,text,text,timestamptz
) to service_role;

comment on table public.ahmv_takatak_control_publication_schedules is
  'Approved exact-revision publication schedules. Newer drafts make the schedule stale instead of silently publishing a different revision.';
