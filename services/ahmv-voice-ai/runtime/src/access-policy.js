export function accessFromBootstrap(data, {
  accessMode = 'free_beta',
  paidAccessPolicy = 'premium_or_trial',
} = {}) {
  const tier = typeof data?.contact?.accessTier === 'string'
    ? data.contact.accessTier.trim().slice(0, 30) || 'guest'
    : 'guest';
  const trialActive = Boolean(data?.entitlement?.trialActive);
  const premium = tier === 'premium' || Boolean(data?.entitlement?.premium);
  const nextEvent = Boolean(data?.entitlement?.nextEvent);
  const weeklySchedule = Boolean(data?.entitlement?.weeklySchedule);

  if (tier === 'blocked') {
    return {
      allowed: false,
      mode: accessMode,
      reason: 'blocked',
      tier,
      premium: false,
      trialActive: false,
      nextEvent: false,
      weeklySchedule: false,
    };
  }

  if (accessMode === 'free_beta') {
    return {
      allowed: true,
      mode: 'free_beta',
      reason: 'beta_open_access',
      tier,
      premium,
      trialActive,
      nextEvent: true,
      weeklySchedule: true,
    };
  }

  if (paidAccessPolicy === 'premium_only') {
    return {
      allowed: premium,
      mode: 'paid',
      reason: premium ? 'premium' : 'membership_required',
      tier,
      premium,
      trialActive,
      nextEvent: premium,
      weeklySchedule: premium,
    };
  }

  const fullAccess = premium || trialActive;
  const allowed = fullAccess || nextEvent;
  return {
    allowed,
    mode: 'paid',
    reason: premium
      ? 'premium'
      : trialActive
        ? 'trial'
        : nextEvent
          ? 'base_next_event'
          : 'membership_required',
    tier,
    premium,
    trialActive,
    nextEvent,
    weeklySchedule: fullAccess && weeklySchedule,
  };
}

export function scheduleCapability(access) {
  return {
    nextEvent: access?.nextEvent === true || access?.weeklySchedule === true,
    weeklySchedule: access?.weeklySchedule === true,
  };
}
