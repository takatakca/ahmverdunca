-- GROUPE TAKATAK membership projection for the AHMV communication edge.
alter table public.ahmv_phone_contacts
  add column if not exists premium_expires_at timestamptz;

create table if not exists public.ahmv_phone_entitlement_sync_events (
  event_id text primary key,
  contact_id uuid references public.ahmv_phone_contacts(id) on delete set null,
  takatak_identity_id text,
  product_code text not null,
  membership_status text not null
    check (membership_status in ('active','inactive','blocked')),
  entitlement_expires_at timestamptz,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index if not exists idx_ahmv_phone_entitlement_sync_contact
  on public.ahmv_phone_entitlement_sync_events(contact_id, received_at desc);

alter table public.ahmv_phone_entitlement_sync_events enable row level security;
grant all on public.ahmv_phone_entitlement_sync_events to service_role;

comment on column public.ahmv_phone_contacts.premium_expires_at is
  'Cached TAKATAK membership expiry. TAKATAK remains the authoritative billing and entitlement system.';
comment on table public.ahmv_phone_entitlement_sync_events is
  'Idempotency/audit projection for TAKATAK membership lifecycle events. Does not grant marketing consent.';

create or replace function public.ahmv_apply_takatak_membership_sync(
  p_event_id text,
  p_phone_e164 text,
  p_takatak_identity_id text,
  p_product_code text,
  p_membership_status text,
  p_entitlement_expires_at timestamptz,
  p_occurred_at timestamptz,
  p_now timestamptz default now()
)
returns table (
  duplicate boolean,
  applied boolean,
  contact_id uuid,
  access_tier public.ahmv_phone_access_tier
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact public.ahmv_phone_contacts%rowtype;
  v_latest_occurred_at timestamptz;
  v_tier public.ahmv_phone_access_tier;
begin
  if
    p_event_id is null or btrim(p_event_id) = ''
    or p_phone_e164 is null or p_phone_e164 !~ '^\\+[1-9][0-9]{7,14}$'
    or p_takatak_identity_id is null or btrim(p_takatak_identity_id) = ''
    or p_product_code <> 'hockey_member_weekly_10'
    or p_membership_status not in ('active','inactive','blocked')
    or p_occurred_at is null
    or p_occurred_at > p_now + interval '5 minutes'
    or (
      p_membership_status = 'active'
      and (
        p_entitlement_expires_at is null
        or p_entitlement_expires_at <= p_now
      )
    )
  then
    raise exception 'invalid AHMV TAKATAK membership sync input'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_takatak_identity_id || '|' || p_phone_e164 || '|' || p_product_code,
      0
    )
  );

  if exists (
    select 1
    from public.ahmv_phone_entitlement_sync_events
    where event_id = p_event_id
  ) then
    return query
      select true, false, null::uuid, null::public.ahmv_phone_access_tier;
    return;
  end if;

  select max(occurred_at)
    into v_latest_occurred_at
  from public.ahmv_phone_entitlement_sync_events
  where takatak_identity_id = p_takatak_identity_id
    and product_code = p_product_code;

  if v_latest_occurred_at is not null
     and p_occurred_at <= v_latest_occurred_at then
    insert into public.ahmv_phone_entitlement_sync_events (
      event_id,
      contact_id,
      takatak_identity_id,
      product_code,
      membership_status,
      entitlement_expires_at,
      occurred_at
    )
    values (
      p_event_id,
      null,
      p_takatak_identity_id,
      p_product_code,
      p_membership_status,
      p_entitlement_expires_at,
      p_occurred_at
    );

    return query
      select false, false, null::uuid, null::public.ahmv_phone_access_tier;
    return;
  end if;

  select *
    into v_contact
  from public.ahmv_phone_contacts
  where phone_e164 = p_phone_e164
  for update;

  if not found and p_membership_status <> 'active' then
    insert into public.ahmv_phone_entitlement_sync_events (
      event_id,
      contact_id,
      takatak_identity_id,
      product_code,
      membership_status,
      entitlement_expires_at,
      occurred_at
    )
    values (
      p_event_id,
      null,
      p_takatak_identity_id,
      p_product_code,
      p_membership_status,
      p_entitlement_expires_at,
      p_occurred_at
    );

    return query
      select false, false, null::uuid, null::public.ahmv_phone_access_tier;
    return;
  end if;

  if found then
    if p_membership_status = 'blocked' then
      v_tier := 'blocked';
    elsif p_membership_status = 'active' then
      v_tier := 'premium';
    elsif v_contact.trial_expires_at > p_now then
      v_tier := 'trial';
    else
      v_tier := 'guest';
    end if;

    update public.ahmv_phone_contacts
    set
      takatak_identity_id = p_takatak_identity_id,
      access_tier = v_tier,
      premium_expires_at =
        case
          when p_membership_status = 'active'
            then p_entitlement_expires_at
          else null
        end,
      updated_at = p_now
    where id = v_contact.id;

    contact_id := v_contact.id;
  else
    v_tier := 'premium';

    insert into public.ahmv_phone_contacts (
      phone_e164,
      language,
      access_tier,
      trial_started_at,
      trial_expires_at,
      premium_expires_at,
      takatak_identity_id,
      sms_consent,
      transactional_sms_allowed,
      marketing_sms_consent,
      last_seen_at,
      created_at,
      updated_at
    )
    values (
      p_phone_e164,
      'fr',
      v_tier,
      p_now,
      p_now,
      p_entitlement_expires_at,
      p_takatak_identity_id,
      false,
      true,
      false,
      p_now,
      p_now,
      p_now
    )
    returning id into contact_id;
  end if;

  insert into public.ahmv_phone_entitlement_sync_events (
    event_id,
    contact_id,
    takatak_identity_id,
    product_code,
    membership_status,
    entitlement_expires_at,
    occurred_at
  )
  values (
    p_event_id,
    contact_id,
    p_takatak_identity_id,
    p_product_code,
    p_membership_status,
    p_entitlement_expires_at,
    p_occurred_at
  );

  duplicate := false;
  applied := true;
  access_tier := v_tier;
  return next;
end;
$$;

revoke all on function public.ahmv_apply_takatak_membership_sync(
  text,text,text,text,text,timestamptz,timestamptz,timestamptz
) from public;

grant execute on function public.ahmv_apply_takatak_membership_sync(
  text,text,text,text,text,timestamptz,timestamptz,timestamptz
) to service_role;

comment on function public.ahmv_apply_takatak_membership_sync(
  text,text,text,text,text,timestamptz,timestamptz,timestamptz
) is
  'Atomically projects ordered/idempotent TAKATAK membership events into AHMV communication access. Does not mutate SMS or marketing consent.';

