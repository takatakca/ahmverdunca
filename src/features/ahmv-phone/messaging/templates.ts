import type { AhmvPhoneLanguage } from "../contacts/store.server";
import type { LifecycleMessageKind } from "./lifecycle";

export function lifecycleMessageText(
  kind: LifecycleMessageKind,
  lang: AhmvPhoneLanguage,
  memberUrl: string,
) {
  const fr = {
    trial_welcome:
      "AHMV — Votre période découverte GROUPE TAKATAK de 30 jours est active. Le prochain événement reste accessible; des fonctions personnalisées peuvent être disponibles pendant l’essai.",
    trial_expiry_3d:
      "AHMV — Votre période découverte GROUPE TAKATAK se termine dans 3 jours. Le prochain événement restera accessible. Pour conserver les fonctions personnalisées: " + memberUrl,
    trial_expired:
      "AHMV — Votre période découverte est terminée. Le prochain événement reste accessible. Les fonctions personnalisées nécessitent maintenant un abonnement: " + memberUrl,
    membership_offer:
      "AHMV — Continuez les rappels, horaires étendus et fonctions personnalisées avec l’abonnement GROUPE TAKATAK: " + memberUrl,
  } as const;

  const en = {
    trial_welcome:
      "AHMV — Your 30-day GROUPE TAKATAK introductory period is active. The next event remains available; personalized features may be available during the trial.",
    trial_expiry_3d:
      "AHMV — Your GROUPE TAKATAK introductory period ends in 3 days. The next event will remain available. To keep personalized features: " + memberUrl,
    trial_expired:
      "AHMV — Your introductory period has ended. The next event remains available. Personalized features now require membership: " + memberUrl,
    membership_offer:
      "AHMV — Keep reminders, expanded schedules and personalized features with GROUPE TAKATAK membership: " + memberUrl,
  } as const;

  return (lang === "fr" ? fr : en)[kind];
}
