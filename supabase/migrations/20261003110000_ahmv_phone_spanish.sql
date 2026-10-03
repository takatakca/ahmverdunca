-- Add Spanish as a supported AHMV Phone/SMS language.
alter table public.ahmv_phone_contacts
  drop constraint if exists ahmv_phone_contacts_language_check;

alter table public.ahmv_phone_contacts
  add constraint ahmv_phone_contacts_language_check
  check (language in ('fr','en','es'));

alter table public.ahmv_phone_campaign_executions
  add column if not exists body_es text;

update public.ahmv_phone_campaign_executions
set body_es = body_en
where body_es is null;

alter table public.ahmv_phone_campaign_executions
  alter column body_es set not null;

comment on column public.ahmv_phone_campaign_executions.body_es is
  'Spanish commercial message body required for newly created campaigns.';
