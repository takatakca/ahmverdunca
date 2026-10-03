-- AHMV Phone/SMS lifecycle queue hardening.
alter table public.ahmv_phone_message_jobs
  add column if not exists dedupe_key text,
  add column if not exists consent_basis text;

do $$
begin
  alter table public.ahmv_phone_message_jobs
    add constraint ahmv_phone_message_jobs_consent_basis_check
    check (
      consent_basis is null
      or consent_basis in ('requested','service','marketing')
    );
exception
  when duplicate_object then null;
end $$;

create unique index if not exists idx_ahmv_phone_message_jobs_dedupe
  on public.ahmv_phone_message_jobs(dedupe_key);

create index if not exists idx_ahmv_phone_message_jobs_due
  on public.ahmv_phone_message_jobs(status, not_before, created_at);

comment on column public.ahmv_phone_message_jobs.dedupe_key is
  'Stable idempotency key. Prevents duplicate lifecycle/reminder SMS jobs.';
comment on column public.ahmv_phone_message_jobs.consent_basis is
  'Consent basis used when the message was queued: requested, service, or marketing.';
