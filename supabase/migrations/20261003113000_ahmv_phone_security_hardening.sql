-- Defense-in-depth for AHMV Phone/Voice tables and privileged RPCs.
-- Service-side access only. No browser/anon/authenticated access is required.

revoke all on table public.ahmv_phone_contacts from anon, authenticated;
revoke all on table public.ahmv_phone_team_preferences from anon, authenticated;
revoke all on table public.ahmv_phone_interactions from anon, authenticated;
revoke all on table public.ahmv_phone_message_jobs from anon, authenticated;
revoke all on table public.ahmv_voice_sessions from anon, authenticated;
revoke all on table public.ahmv_phone_event_snapshots from anon, authenticated;
revoke all on table public.ahmv_phone_entitlement_sync_events from anon, authenticated;
revoke all on table public.ahmv_phone_campaign_executions from anon, authenticated;
revoke all on table public.ahmv_phone_marketing_consent_events from anon, authenticated;

alter function public.touch_ahmv_voice_session_updated_at()
  set search_path = '';

alter function public.claim_ahmv_voice_audit(text)
  set search_path = '';

alter function public.release_ahmv_voice_audit_claim(text)
  set search_path = '';

alter function public.claim_ahmv_voice_sms(text)
  set search_path = '';

alter function public.release_ahmv_voice_sms_claim(text,text)
  set search_path = '';

alter function public.ahmv_apply_takatak_membership_sync(
  text,text,text,text,text,timestamptz,timestamptz,timestamptz
)
  set search_path = '';

alter function public.ahmv_apply_marketing_consent_event(
  text,uuid,text,boolean,timestamptz,timestamptz
)
  set search_path = '';

revoke execute on function public.touch_ahmv_voice_session_updated_at()
  from public, anon, authenticated;
revoke execute on function public.claim_ahmv_voice_audit(text)
  from public, anon, authenticated;
revoke execute on function public.release_ahmv_voice_audit_claim(text)
  from public, anon, authenticated;
revoke execute on function public.claim_ahmv_voice_sms(text)
  from public, anon, authenticated;
revoke execute on function public.release_ahmv_voice_sms_claim(text,text)
  from public, anon, authenticated;
revoke execute on function public.ahmv_apply_takatak_membership_sync(
  text,text,text,text,text,timestamptz,timestamptz,timestamptz
)
  from public, anon, authenticated;
revoke execute on function public.ahmv_apply_marketing_consent_event(
  text,uuid,text,boolean,timestamptz,timestamptz
)
  from public, anon, authenticated;

grant execute on function public.claim_ahmv_voice_audit(text) to service_role;
grant execute on function public.release_ahmv_voice_audit_claim(text) to service_role;
grant execute on function public.claim_ahmv_voice_sms(text) to service_role;
grant execute on function public.release_ahmv_voice_sms_claim(text,text) to service_role;
grant execute on function public.ahmv_apply_takatak_membership_sync(
  text,text,text,text,text,timestamptz,timestamptz,timestamptz
) to service_role;
grant execute on function public.ahmv_apply_marketing_consent_event(
  text,uuid,text,boolean,timestamptz,timestamptz
) to service_role;

comment on schema public is
  'Public application schema. AHMV Phone/Voice communication tables remain server-only through explicit grants and RLS.';
