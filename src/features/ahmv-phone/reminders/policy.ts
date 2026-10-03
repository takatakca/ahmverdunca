import type { AhmvPhoneContact } from "../contacts/store.server.ts";
import {
  canUse,
  type AhmvEntitlement,
} from "../entitlements/access.ts";

export function canSendTeamServiceAlert(input: {
  contact: AhmvPhoneContact;
  remindersEnabled: boolean;
  entitlement: AhmvEntitlement;
}) {
  return (
    input.contact.smsConsent &&
    input.contact.transactionalSmsAllowed &&
    input.remindersEnabled &&
    canUse(input.entitlement, "game_reminders")
  );
}
