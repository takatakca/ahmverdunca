-- Provenance metadata for TAKATAK-managed AHMV website desired-state records.
-- Kept separate from editable payload so a draft cannot silently claim official verification.

alter table public.ahmv_takatak_control_records
  add column if not exists source_kind text not null default 'unknown'
    check (source_kind in ('official','association','social','provider','manual','unknown')),
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified','verified','disputed','stale')),
  add column if not exists source_ref text,
  add column if not exists source_verified_at timestamptz;

alter table public.ahmv_takatak_control_records
  drop constraint if exists ahmv_takatak_control_records_source_ref_length;

alter table public.ahmv_takatak_control_records
  add constraint ahmv_takatak_control_records_source_ref_length
  check (source_ref is null or char_length(source_ref) <= 2048);

alter table public.ahmv_takatak_control_records
  drop constraint if exists ahmv_takatak_control_records_verified_source_required;

alter table public.ahmv_takatak_control_records
  add constraint ahmv_takatak_control_records_verified_source_required
  check (
    verification_status <> 'verified'
    or (source_ref is not null and source_verified_at is not null)
  );

create index if not exists idx_ahmv_takatak_control_records_verification
  on public.ahmv_takatak_control_records(
    organization_id,
    verification_status,
    updated_at desc
  );

comment on column public.ahmv_takatak_control_records.source_kind is
  'Origin class for managed content. Does not replace the underlying official hockey source of truth.';
comment on column public.ahmv_takatak_control_records.verification_status is
  'Verification state for the editable desired-state record.';
comment on column public.ahmv_takatak_control_records.source_ref is
  'Non-secret source URL/path/provider reference used to justify the managed content.';
comment on column public.ahmv_takatak_control_records.source_verified_at is
  'Timestamp of the last explicit verification when verification_status=verified.';
