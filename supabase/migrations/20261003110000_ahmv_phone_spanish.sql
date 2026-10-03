-- Add Spanish as a supported AHMV Phone/SMS language.
alter table public.ahmv_phone_contacts
  drop constraint if exists ahmv_phone_contacts_language_check;

alter table public.ahmv_phone_contacts
  add constraint ahmv_phone_contacts_language_check
  check (language in ('fr','en','es'));

alter table public.ahmv_phone_campaign_executions
  add column if not exists body_es text;

comment on column public.ahmv_phone_campaign_executions.body_es is
  'Spanish commercial message body. Required by application validation for newly created campaigns.';
