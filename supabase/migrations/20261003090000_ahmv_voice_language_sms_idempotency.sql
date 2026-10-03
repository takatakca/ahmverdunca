-- AHMV Voice AI prerequisite: Spanish communication preference + SMS idempotency.
alter table public.ahmv_phone_contacts
  drop constraint if exists ahmv_phone_contacts_language_check;
alter table public.ahmv_phone_contacts
  add constraint ahmv_phone_contacts_language_check
  check (language in ('fr','en','es'));
comment on column public.ahmv_phone_contacts.language is
  'Preferred communication language for AHMV phone/voice interactions: fr, en, or es.';

alter table public.ahmv_phone_message_jobs
  add column if not exists idempotency_key text;
create unique index if not exists uq_ahmv_phone_message_jobs_idempotency
  on public.ahmv_phone_message_jobs(idempotency_key)
  where idempotency_key is not null;
comment on column public.ahmv_phone_message_jobs.idempotency_key is
  'Server-generated transactional idempotency key; Voice AI uses one deterministic key per call/purpose.';
