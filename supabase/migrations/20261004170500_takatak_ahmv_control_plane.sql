-- Backend-only TAKATAK <-> AHMV control-plane persistence.
-- This does not mount UI/routes and does not make AHMV dependent on TAKATAK Dashboard.

create table if not exists public.ahmv_takatak_control_records (
  id uuid primary key default gen_random_uuid(),
  tenant text not null default 'ahmverdun' check (tenant = 'ahmverdun'),
  organization_id text not null,
  service text not null check (
    service in (
      'website','domain','hosting','seo','social','local_listing','blog','reviews',
      'lead_calls','notifications','sms','voice','email','calendar','analytics','automations'
    )
  ),
  resource_type text not null,
  resource_id text not null,
  status text not null default 'draft'
    check (status in ('draft','queued','active','archived')),
  revision bigint not null default 1 check (revision >= 1),
  published_revision bigint check (published_revision is null or published_revision >= 1),
  last_published_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_by text not null,
  updated_by text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant, organization_id, service, resource_type, resource_id)
);

create index if not exists idx_ahmv_takatak_control_records_org_service
  on public.ahmv_takatak_control_records(organization_id, service, updated_at desc);


create table if not exists public.ahmv_takatak_control_record_versions (
  id uuid primary key default gen_random_uuid(),
  control_record_id uuid not null
    references public.ahmv_takatak_control_records(id) on delete cascade,
  revision bigint not null check (revision >= 1),
  status text not null check (status in ('draft','queued','active','archived')),
  payload jsonb not null default '{}'::jsonb,
  actor_id text not null,
  created_at timestamptz not null default now(),
  unique (control_record_id, revision)
);

create index if not exists idx_ahmv_takatak_control_versions_record
  on public.ahmv_takatak_control_record_versions(control_record_id, revision desc);

create or replace function public.capture_ahmv_takatak_control_record_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $
begin
  insert into public.ahmv_takatak_control_record_versions (
    control_record_id,
    revision,
    status,
    payload,
    actor_id,
    created_at
  )
  values (
    new.id,
    new.revision,
    new.status,
    new.payload,
    new.updated_by,
    new.updated_at
  )
  on conflict (control_record_id, revision) do nothing;

  return new;
end;
$;

drop trigger if exists trg_ahmv_takatak_control_record_version
  on public.ahmv_takatak_control_records;

create trigger trg_ahmv_takatak_control_record_version
after insert or update of revision, status, payload
on public.ahmv_takatak_control_records
for each row
execute function public.capture_ahmv_takatak_control_record_version();

create table if not exists public.ahmv_takatak_control_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant text not null default 'ahmverdun' check (tenant = 'ahmverdun'),
  organization_id text not null,
  actor_id text not null,
  request_id text not null,
  idempotency_key text not null unique,
  request_fingerprint text not null,
  service text not null check (
    service in (
      'website','domain','hosting','seo','social','local_listing','blog','reviews',
      'lead_calls','notifications','sms','voice','email','calendar','analytics','automations'
    )
  ),
  action text not null check (action in ('publish','execute','delete')),
  resource_type text not null,
  resource_id text not null,
  expected_revision bigint,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued'
    check (status in ('queued','running','succeeded','failed','cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  available_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  last_error_code text,
  external_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ahmv_takatak_control_jobs_worker
  on public.ahmv_takatak_control_jobs(status, available_at, created_at)
  where status in ('queued','failed');

create table if not exists public.ahmv_takatak_control_audit (
  id uuid primary key default gen_random_uuid(),
  tenant text not null default 'ahmverdun' check (tenant = 'ahmverdun'),
  organization_id text not null,
  actor_id text not null,
  request_id text not null,
  idempotency_key text not null,
  service text not null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  outcome text not null check (outcome in ('accepted','completed','rejected','failed')),
  payload_fingerprint text not null,
  previous_revision bigint,
  next_revision bigint,
  previous_status text,
  next_status text,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_ahmv_takatak_control_audit_resource
  on public.ahmv_takatak_control_audit(
    organization_id, service, resource_type, resource_id, occurred_at desc
  );

alter table public.ahmv_takatak_control_records enable row level security;
alter table public.ahmv_takatak_control_record_versions enable row level security;
alter table public.ahmv_takatak_control_jobs enable row level security;
alter table public.ahmv_takatak_control_audit enable row level security;

revoke all on table public.ahmv_takatak_control_records from public, anon, authenticated;
revoke all on table public.ahmv_takatak_control_record_versions from public, anon, authenticated;
revoke all on table public.ahmv_takatak_control_jobs from public, anon, authenticated;
revoke all on table public.ahmv_takatak_control_audit from public, anon, authenticated;

grant all on table public.ahmv_takatak_control_records to service_role;
grant all on table public.ahmv_takatak_control_record_versions to service_role;
grant all on table public.ahmv_takatak_control_jobs to service_role;
grant all on table public.ahmv_takatak_control_audit to service_role;

comment on table public.ahmv_takatak_control_records is
  'Detachable AHMV-side control-plane records managed server-to-server by authorized TAKATAK services. Never a billing source of truth.';
comment on table public.ahmv_takatak_control_record_versions is
  'Immutable revision snapshots for conflict-safe history/restore workflows. Contains sanitized control payloads, never provider secrets.';
comment on table public.ahmv_takatak_control_jobs is
  'Idempotent asynchronous managed-service jobs. Provider secrets and raw credentials must never be stored in job rows.';
comment on table public.ahmv_takatak_control_audit is
  'Payload-free audit metadata for TAKATAK managed-service commands against the standalone AHMV application.';


create or replace function public.ahmv_claim_takatak_control_job(
  p_now timestamptz default now()
)
returns table (
  id uuid,
  tenant text,
  organization_id text,
  actor_id text,
  request_id text,
  idempotency_key text,
  request_fingerprint text,
  service text,
  action text,
  resource_type text,
  resource_id text,
  expected_revision bigint,
  payload jsonb,
  status text,
  attempts integer,
  max_attempts integer
)
language sql
security definer
set search_path = ''
as $$
  with candidate as (
    select j.id
    from public.ahmv_takatak_control_jobs j
    where
      (
        j.status = 'queued'
        or (
          j.status = 'failed'
          and j.completed_at is null
          and j.attempts < j.max_attempts
        )
      )
      and j.available_at <= p_now
    order by j.available_at asc, j.created_at asc
    for update skip locked
    limit 1
  ),
  claimed as (
    update public.ahmv_takatak_control_jobs j
    set
      status = 'running',
      attempts = j.attempts + 1,
      started_at = p_now,
      updated_at = p_now
    from candidate c
    where j.id = c.id
    returning j.*
  )
  select
    c.id,
    c.tenant,
    c.organization_id,
    c.actor_id,
    c.request_id,
    c.idempotency_key,
    c.request_fingerprint,
    c.service,
    c.action,
    c.resource_type,
    c.resource_id,
    c.expected_revision,
    c.payload,
    c.status,
    c.attempts,
    c.max_attempts
  from claimed c;
$$;

create or replace function public.ahmv_finish_takatak_control_job(
  p_job_id uuid,
  p_success boolean,
  p_error_code text default null,
  p_external_reference text default null,
  p_retry_delay_seconds integer default 60,
  p_retryable boolean default true,
  p_now timestamptz default now()
)
returns table (
  id uuid,
  status text,
  attempts integer,
  max_attempts integer,
  available_at timestamptz,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_job public.ahmv_takatak_control_jobs%rowtype;
begin
  if p_job_id is null
     or p_retry_delay_seconds < 0
     or p_retry_delay_seconds > 86400 then
    raise exception 'invalid TAKATAK AHMV control job completion input'
      using errcode = '22023';
  end if;

  select *
    into v_job
  from public.ahmv_takatak_control_jobs
  where ahmv_takatak_control_jobs.id = p_job_id
  for update;

  if not found then
    raise exception 'TAKATAK AHMV control job not found'
      using errcode = 'P0002';
  end if;

  if v_job.status <> 'running' then
    raise exception 'TAKATAK AHMV control job is not running'
      using errcode = '55000';
  end if;

  if p_success then
    update public.ahmv_takatak_control_jobs
    set
      status = 'succeeded',
      completed_at = p_now,
      last_error_code = null,
      external_reference = p_external_reference,
      updated_at = p_now
    where ahmv_takatak_control_jobs.id = p_job_id;
  else
    update public.ahmv_takatak_control_jobs
    set
      status = 'failed',
      last_error_code = left(coalesce(p_error_code, 'unknown_error'), 160),
      external_reference = p_external_reference,
      available_at =
        case
          when p_retryable and v_job.attempts < v_job.max_attempts
            then p_now + make_interval(secs => p_retry_delay_seconds)
          else v_job.available_at
        end,
      completed_at =
        case
          when (not p_retryable) or v_job.attempts >= v_job.max_attempts then p_now
          else null
        end,
      updated_at = p_now
    where ahmv_takatak_control_jobs.id = p_job_id;
  end if;

  return query
    select
      j.id,
      j.status,
      j.attempts,
      j.max_attempts,
      j.available_at,
      j.completed_at
    from public.ahmv_takatak_control_jobs j
    where j.id = p_job_id;
end;
$$;

revoke all on function public.capture_ahmv_takatak_control_record_version()
  from public, anon, authenticated;
revoke all on function public.ahmv_claim_takatak_control_job(timestamptz)
  from public, anon, authenticated;
revoke all on function public.ahmv_finish_takatak_control_job(
  uuid,boolean,text,text,integer,boolean,timestamptz
) from public, anon, authenticated;

grant execute on function public.capture_ahmv_takatak_control_record_version()
  to service_role;
grant execute on function public.ahmv_claim_takatak_control_job(timestamptz)
  to service_role;
grant execute on function public.ahmv_finish_takatak_control_job(
  uuid,boolean,text,text,integer,boolean,timestamptz
) to service_role;

comment on function public.ahmv_claim_takatak_control_job(timestamptz) is
  'Atomically claims one eligible control-plane job using SKIP LOCKED so multiple workers cannot execute the same job concurrently.';
comment on function public.ahmv_finish_takatak_control_job(
  uuid,boolean,text,text,integer,boolean,timestamptz
) is
  'Completes or schedules retry for a claimed TAKATAK AHMV control-plane job without exposing provider credentials.';
