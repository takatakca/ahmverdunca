-- AHM Verdun Voice AI — operational session persistence only.
create extension if not exists pgcrypto;

create table if not exists public.ahmv_voice_sessions (
  id uuid primary key default gen_random_uuid(),
  call_sid text unique not null,
  caller_phone text,
  called_phone text,
  ahmv_phone_contact_id uuid references public.ahmv_phone_contacts(id) on delete set null,
  access_mode text not null default 'free_beta' check (access_mode in ('free_beta','paid')),
  access_allowed boolean not null default false,
  detected_language text,
  sms_opt_in boolean not null default false,
  sms_items jsonb not null default '[]'::jsonb,
  transcript_summary jsonb not null default '[]'::jsonb,
  session_state jsonb not null default '{}'::jsonb,
  turn_count integer not null default 0 check (turn_count >= 0),
  end_reason text,
  sms_claimed_at timestamptz,
  sms_sent_at timestamptz,
  sms_message_sid text,
  sms_send_error text,
  audit_claimed_at timestamptz,
  audit_recorded_at timestamptz,
  relay_session_status text,
  relay_error_code text,
  relay_error_message text,
  session_duration_seconds integer,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ahmv_voice_sessions_sid_chk check (length(call_sid) > 0),
  constraint ahmv_voice_sessions_caller_phone_chk check (caller_phone is null or caller_phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint ahmv_voice_sessions_called_phone_chk check (called_phone is null or called_phone ~ '^\+[1-9][0-9]{7,14}$'),
  constraint ahmv_voice_sessions_duration_chk check (session_duration_seconds is null or session_duration_seconds >= 0),
  constraint ahmv_voice_sessions_sms_items_chk check (jsonb_typeof(sms_items) = 'array'),
  constraint ahmv_voice_sessions_transcript_chk check (jsonb_typeof(transcript_summary) = 'array'),
  constraint ahmv_voice_sessions_state_chk check (jsonb_typeof(session_state) = 'object')
);
create index if not exists idx_ahmv_voice_sessions_phone_started
  on public.ahmv_voice_sessions(caller_phone, started_at desc);
create index if not exists idx_ahmv_voice_sessions_contact_started
  on public.ahmv_voice_sessions(ahmv_phone_contact_id, started_at desc);

alter table public.ahmv_voice_sessions enable row level security;
revoke all on public.ahmv_voice_sessions from anon, authenticated;
grant all on public.ahmv_voice_sessions to service_role;

create or replace function public.touch_ahmv_voice_session_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.touch_ahmv_voice_session_updated_at()
  from public, anon, authenticated;
drop trigger if exists trg_ahmv_voice_sessions_updated_at on public.ahmv_voice_sessions;
create trigger trg_ahmv_voice_sessions_updated_at
before update on public.ahmv_voice_sessions
for each row execute function public.touch_ahmv_voice_session_updated_at();

create or replace function public.claim_ahmv_voice_audit(p_call_sid text)
returns boolean language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
  update public.ahmv_voice_sessions set audit_claimed_at=now(),updated_at=now()
  where call_sid=p_call_sid and audit_recorded_at is null
  and (audit_claimed_at is null or audit_claimed_at < now()-interval '10 minutes');
  get diagnostics changed = row_count; return changed=1;
end; $$;

create or replace function public.release_ahmv_voice_audit_claim(p_call_sid text)
returns boolean language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
  update public.ahmv_voice_sessions set audit_claimed_at=null,updated_at=now()
  where call_sid=p_call_sid and audit_recorded_at is null;
  get diagnostics changed = row_count; return changed=1;
end; $$;

create or replace function public.claim_ahmv_voice_sms(p_call_sid text)
returns boolean language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
  update public.ahmv_voice_sessions
  set sms_claimed_at=now(),sms_send_error=null,updated_at=now()
  where call_sid=p_call_sid and sms_sent_at is null
  and (sms_claimed_at is null or sms_claimed_at < now()-interval '10 minutes');
  get diagnostics changed = row_count; return changed=1;
end; $$;

create or replace function public.release_ahmv_voice_sms_claim(
  p_call_sid text, p_error text default null
)
returns boolean language plpgsql security definer set search_path = public as $$
declare changed integer;
begin
  update public.ahmv_voice_sessions
  set sms_claimed_at=null,sms_send_error=left(p_error,500),updated_at=now()
  where call_sid=p_call_sid and sms_sent_at is null;
  get diagnostics changed = row_count; return changed=1;
end; $$;

revoke all on function public.claim_ahmv_voice_audit(text) from public, anon, authenticated;
revoke all on function public.release_ahmv_voice_audit_claim(text) from public, anon, authenticated;
revoke all on function public.claim_ahmv_voice_sms(text) from public, anon, authenticated;
revoke all on function public.release_ahmv_voice_sms_claim(text,text) from public, anon, authenticated;
grant execute on function public.claim_ahmv_voice_audit(text) to service_role;
grant execute on function public.release_ahmv_voice_audit_claim(text) to service_role;
grant execute on function public.claim_ahmv_voice_sms(text) to service_role;
grant execute on function public.release_ahmv_voice_sms_claim(text,text) to service_role;

comment on table public.ahmv_voice_sessions is
  'Operational ConversationRelay state only; not CRM, roster, billing or marketing authority.';
