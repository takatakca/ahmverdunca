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
alter table public.ahmv_takatak_control_jobs enable row level security;
alter table public.ahmv_takatak_control_audit enable row level security;

revoke all on table public.ahmv_takatak_control_records from public, anon, authenticated;
revoke all on table public.ahmv_takatak_control_jobs from public, anon, authenticated;
revoke all on table public.ahmv_takatak_control_audit from public, anon, authenticated;

grant all on table public.ahmv_takatak_control_records to service_role;
grant all on table public.ahmv_takatak_control_jobs to service_role;
grant all on table public.ahmv_takatak_control_audit to service_role;

comment on table public.ahmv_takatak_control_records is
  'Detachable AHMV-side control-plane records managed server-to-server by authorized TAKATAK services. Never a billing source of truth.';
comment on table public.ahmv_takatak_control_jobs is
  'Idempotent asynchronous managed-service jobs. Provider secrets and raw credentials must never be stored in job rows.';
comment on table public.ahmv_takatak_control_audit is
  'Payload-free audit metadata for TAKATAK managed-service commands against the standalone AHMV application.';
