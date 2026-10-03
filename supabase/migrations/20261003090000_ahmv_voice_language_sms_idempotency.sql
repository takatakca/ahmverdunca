-- AHMV Voice AI prerequisite: persist Spanish communication preference.
-- SMS deduplication is owned by the core AHMV migration
-- 20261003090500_ahmv_phone_message_dedupe.sql via dedupe_key.

alter table public.ahmv_phone_contacts
  drop constraint if exists ahmv_phone_contacts_language_check;

alter table public.ahmv_phone_contacts
  add constraint ahmv_phone_contacts_language_check
  check (language in ('fr','en','es'));

comment on column public.ahmv_phone_contacts.language is
  'Preferred communication language for AHMV phone/voice interactions: fr, en, or es.';
