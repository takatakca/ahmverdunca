import twilio from "twilio";
import { officialPhoneSchedule, parseSms } from "../../../lib/ahmv-phone.ts";
import {
  normalizePhoneE164,
  safeApplyMarketingSmsConsentEvent,
  safeFindPhoneContactByNumber,
  safeSavePrimaryTeamPreference,
  safeSetCarrierMessagingPermission,
  safeSetTeamReminderPreference,
  safeTouchPhoneContact,
} from "../contacts/store.server.ts";
import { safeRecordPhoneInteraction } from "../audit/store.server.ts";
import { parseMarketingConsentCommand } from "../contacts/marketing-consent.ts";
import { phoneText } from "../i18n.ts";
import { createSignedCalendarLink } from "../calendar/link.server.ts";
import { createSignedDepartureLink } from "../departure/link.server.ts";
import { parsePhoneCommand } from "../conversation/commands.ts";
import { canUse } from "../entitlements/access.ts";
import {
  memberActivationUrl,
  resolvePhoneEntitlement,
} from "../entitlements/service.server.ts";
import { nextEventService } from "../schedules/service.ts";
import { scheduleRangeAnswer } from "../schedules/range.ts";
import {
  compactTeamChoices,
  resolvePublicTeam,
} from "../teams/resolve.ts";
import {
  teamAliases,
  urgentBulletin,
  xmlResponse,
} from "./common.server.ts";
import type { ValidatedTwilioRequest } from "./request.server.ts";

export async function handleTwilioSms(
  context: ValidatedTwilioRequest,
): Promise<Response> {
  const { params, settings, reference: ref, log } = context;
  const response = new twilio.twiml.MessagingResponse();
  const { lang, query } = parseSms(params["Body"] ?? "");
  const t = (fr: string, en: string, es: string) => phoneText(lang, { fr, en, es });
  const caller = normalizePhoneE164(params["From"]);
  const existingContact = caller
    ? await safeFindPhoneContactByNumber(caller)
    : null;
  const optOutType = (params["OptOutType"] ?? "").toUpperCase();
  const carrierStop =
    optOutType === "STOP" ||
    /^(STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT)$/i.test(query);
  const carrierStart =
    optOutType === "START" ||
    /^(START|UNSTOP)$/i.test(query);

  if (params["OptOutType"] || carrierStop || carrierStart) {
    if (existingContact && carrierStop) {
      await safeApplyMarketingSmsConsentEvent({
        eventId: `carrier-stop:${ref}`,
        contactId: existingContact.id,
        enabled: false,
        source: "carrier_opt_out",
      });
      await safeSetCarrierMessagingPermission(existingContact.id, false);
    } else if (existingContact && carrierStart) {
      await safeSetCarrierMessagingPermission(existingContact.id, true);
    }

    const intent = carrierStart
      ? "carrier-opt-in"
      : carrierStop
        ? "carrier-opt-out"
        : "carrier-help";

    await safeRecordPhoneInteraction({
      contactId: existingContact?.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent,
      outcome: "managed-by-twilio",
    });
    log(intent + "-managed-by-twilio");
    return xmlResponse(response.toString());
  }

  const contact = caller
    ? await safeTouchPhoneContact({
        phoneE164: caller,
        language: lang,
        smsRequested: true,
        settings,
      })
    : null;

  const marketingCommand = parseMarketingConsentCommand(query);
  if (marketingCommand) {
    if (!contact) {
      response.message(
        t(
          "AHMV: impossible d'associer cette préférence à ce numéro pour le moment.",
          "AHMV: unable to associate this preference with this number right now.",
          "AHMV: no es posible asociar esta preferencia con este número por el momento.",
        ),
      );
      return xmlResponse(response.toString());
    }

    const enabled = marketingCommand.kind === "marketing-opt-in";
    const consentResult = await safeApplyMarketingSmsConsentEvent({
      eventId: `sms-marketing:${ref}`,
      contactId: contact.id,
      enabled,
      source: "sms_keyword",
    });
    const saved = Boolean(
      consentResult &&
        (consentResult.applied || consentResult.duplicate),
    );

    response.message(
      saved
        ? enabled
          ? t(
              "AHMV / GROUPE TAKATAK: consentement aux offres SMS enregistré. Pour retirer seulement les offres: OFFRES NON. Pour arrêter tous les SMS: STOP.",
              "AHMV / GROUPE TAKATAK: SMS offers consent saved. To stop offers only: OFFERS NO. To stop all SMS: STOP.",
              "AHMV / GROUPE TAKATAK: consentimiento para ofertas por SMS registrado. Para quitar solo las ofertas: OFERTAS NO. Para detener todos los SMS: STOP.",
            )
          : t(
              "AHMV / GROUPE TAKATAK: les offres SMS sont désactivées. Les messages de service demandés peuvent continuer. STOP arrête tous les SMS.",
              "AHMV / GROUPE TAKATAK: SMS offers are off. Requested service messages may continue. STOP stops all SMS.",
              "AHMV / GROUPE TAKATAK: las ofertas por SMS están desactivadas. Los mensajes de servicio solicitados pueden continuar. STOP detiene todos los SMS.",
            )
        : t(
            "AHMV: impossible de modifier cette préférence pour le moment.",
            "AHMV: unable to update this preference right now.",
            "AHMV: no es posible modificar esta preferencia por el momento.",
          ),
    );

    await safeRecordPhoneInteraction({
      contactId: contact.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: marketingCommand.kind,
      outcome: saved ? (enabled ? "enabled" : "disabled") : "failed",
    });
    log(saved ? marketingCommand.kind : "marketing-consent-failed");
    return xmlResponse(response.toString());
  }

  if (!query || /^(HELP|AIDE|AYUDA|FR|EN|ES)$/i.test(query)) {
    response.message(
      t(
        "AHMV: envoyez votre équipe pour le prochain événement. Essai 30 jours: AUJOURD'HUI, DEMAIN, SEMAINE, SAUVE, RAPPEL, CALENDRIER ou DÉPART + équipe. Offres commerciales: OFFRES OUI/NON. EN pour anglais, ES pour espagnol. GROUPE TAKATAK.",
        "AHMV: text your team for the next event. 30-day trial: TODAY, TOMORROW, WEEK, SAVE, REMIND, CALENDAR or LEAVE + team. Commercial offers: OFFERS YES/NO. FR for French, ES for Spanish. GROUPE TAKATAK.",
        "AHMV: envíe su equipo para el próximo evento. Prueba de 30 días: HOY, MAÑANA, SEMANA, GUARDA, RECORDATORIO, CALENDARIO o SALIDA + equipo. Ofertas: OFERTAS SI/NO. FR para francés, EN para inglés. GROUPE TAKATAK.",
      ),
    );
    await safeRecordPhoneInteraction({
      contactId: contact?.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: "help",
      outcome: "help",
    });
    log("help");
    return xmlResponse(response.toString());
  }

  const command = parsePhoneCommand(query);
  const resolution = resolvePublicTeam(command.teamQuery);

  if (resolution.kind === "ambiguous") {
    const choices = compactTeamChoices(resolution.teams, 4).join("; ");
    response.message(
      t(
        `AHMV: précisez l'équipe. Choix trouvés: ${choices}. https://ahmverdun.ca/equipes`,
        `AHMV: please specify the team. Matches: ${choices}. https://ahmverdun.ca/equipes`,
        `AHMV: especifique el equipo. Coincidencias: ${choices}. https://ahmverdun.ca/equipes`,
      ),
    );
    await safeRecordPhoneInteraction({
      contactId: contact?.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: "team-lookup",
      outcome: "ambiguous",
      teamCode: command.teamQuery.slice(0, 80),
    });
    log("team-ambiguous");
    return xmlResponse(response.toString());
  }

  if (command.kind === "departure") {
    if (!contact) {
      response.message(
        t(
          "AHMV: impossible d'associer le départ intelligent à ce numéro pour le moment.",
          "AHMV: unable to associate smart departure with this number right now.",
          "AHMV: no es posible asociar la salida inteligente con este número por el momento.",
        ),
      );
      return xmlResponse(response.toString());
    }

    const entitlement = await resolvePhoneEntitlement(
      contact,
      "smart_departure",
      settings,
    );

    if (!canUse(entitlement, "smart_departure")) {
      response.message(
        t(
          `AHMV: le départ intelligent est une fonction membre après la période découverte. Activez: ${memberActivationUrl(settings)}`,
          `AHMV: smart departure is a member feature after the introductory period. Activate: ${memberActivationUrl(settings)}`,
          `AHMV: la salida inteligente es una función para miembros después del período introductorio. Active aquí: ${memberActivationUrl(settings)}`,
        ),
      );
      await safeRecordPhoneInteraction({
        contactId: contact.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: "smart-departure",
        outcome: "membership-required",
        teamCode:
          resolution.kind === "exact"
            ? resolution.team.legacyScheduleTeamId
            : command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    const answer = nextEventService(
      command.teamQuery,
      lang,
      teamAliases(settings),
    );

    if (!answer.event || answer.outcome !== "scheduled") {
      response.message(answer.text);
      await safeRecordPhoneInteraction({
        contactId: contact.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: "smart-departure",
        outcome: answer.outcome,
        teamCode: answer.group ?? command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    const departureLink = createSignedDepartureLink(
      answer.event.id,
      settings,
    );

    if (!departureLink) {
      response.message(
        t(
          "AHMV: le départ intelligent est temporairement indisponible. Utilisez les directions de l'aréna dans votre prochain événement.",
          "AHMV: smart departure is temporarily unavailable. Use the arena directions from your next event.",
          "AHMV: la salida inteligente no está disponible temporalmente. Use las indicaciones de la arena en su próximo evento.",
        ),
      );
      await safeRecordPhoneInteraction({
        contactId: contact.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: "smart-departure",
        outcome: "configuration-unavailable",
        teamCode: answer.group ?? command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    response.message(
      t(
        `AHMV — Départ intelligent pour ${answer.group ?? command.teamQuery}: ${departureLink}. Votre position sera demandée seulement après votre clic.`,
        `AHMV — Smart departure for ${answer.group ?? command.teamQuery}: ${departureLink}. Your location will only be requested after you tap.`,
        `AHMV — Salida inteligente para ${answer.group ?? command.teamQuery}: ${departureLink}. Su ubicación se solicitará solamente después de tocar el enlace.`,
      ),
    );
    await safeRecordPhoneInteraction({
      contactId: contact.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: "smart-departure",
      outcome: "link-created",
      teamCode: answer.group ?? command.teamQuery,
      arenaSlug: answer.directions?.arenaSlug,
    });
    log("smart-departure-link-created");
    return xmlResponse(response.toString());
  }

  if (command.kind === "calendar") {
    if (!contact) {
      response.message(
        t(
          "AHMV: impossible d'associer le calendrier à ce numéro pour le moment.",
          "AHMV: unable to associate calendar access with this number right now.",
          "AHMV: no es posible asociar el calendario con este número por el momento.",
        ),
      );
      return xmlResponse(response.toString());
    }

    const entitlement = await resolvePhoneEntitlement(
      contact,
      "calendar_sync",
      settings,
    );

    if (!canUse(entitlement, "calendar_sync")) {
      response.message(
        t(
          `AHMV: le calendrier personnalisé est une fonction membre après la période découverte. Activez: ${memberActivationUrl(settings)}`,
          `AHMV: personalized calendar access is a member feature after the introductory period. Activate: ${memberActivationUrl(settings)}`,
          `AHMV: el calendario personalizado es una función para miembros después del período introductorio. Active aquí: ${memberActivationUrl(settings)}`,
        ),
      );
      await safeRecordPhoneInteraction({
        contactId: contact.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: "calendar",
        outcome: "membership-required",
        teamCode: resolution.kind === "exact"
          ? resolution.team.legacyScheduleTeamId
          : command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    const answer = nextEventService(
      command.teamQuery,
      lang,
      teamAliases(settings),
    );

    if (!answer.event || answer.outcome !== "scheduled") {
      response.message(answer.text);
      await safeRecordPhoneInteraction({
        contactId: contact.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: "calendar",
        outcome: answer.outcome,
        teamCode: answer.group ?? command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    const calendarLink = createSignedCalendarLink(
      answer.event.id,
      settings,
    );

    if (!calendarLink) {
      response.message(
        t(
          "AHMV: le lien calendrier est temporairement indisponible. Les détails de l'événement restent accessibles sur ahmverdun.ca.",
          "AHMV: the calendar link is temporarily unavailable. Event details remain available on ahmverdun.ca.",
          "AHMV: el enlace de calendario no está disponible temporalmente. Los detalles del evento siguen disponibles en ahmverdun.ca.",
        ),
      );
      await safeRecordPhoneInteraction({
        contactId: contact.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: "calendar",
        outcome: "configuration-unavailable",
        teamCode: answer.group ?? command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    response.message(
      t(
        `AHMV — Ajouter le prochain événement de ${answer.group ?? command.teamQuery} au calendrier: ${calendarLink}`,
        `AHMV — Add the next ${answer.group ?? command.teamQuery} event to your calendar: ${calendarLink}`,
        `AHMV — Agregue el próximo evento de ${answer.group ?? command.teamQuery} a su calendario: ${calendarLink}`,
      ),
    );
    await safeRecordPhoneInteraction({
      contactId: contact.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: "calendar",
      outcome: "link-created",
      teamCode: answer.group ?? command.teamQuery,
      arenaSlug: answer.directions?.arenaSlug,
    });
    log("calendar-link-created");
    return xmlResponse(response.toString());
  }

  if (command.kind === "reminder-on" || command.kind === "reminder-off") {
    if (!contact) {
      response.message(
        t(
          "AHMV: impossible d'associer les rappels à ce numéro pour le moment.",
          "AHMV: unable to associate reminders with this number right now.",
          "AHMV: no es posible asociar recordatorios con este número por el momento.",
        ),
      );
      return xmlResponse(response.toString());
    }

    if (resolution.kind !== "exact") {
      response.message(
        t(
          "AHMV: équipe non reconnue de façon certaine. Envoyez RAPPEL suivi de la catégorie et du niveau exacts.",
          "AHMV: team could not be identified with certainty. Send REMIND followed by the exact category and level.",
          "AHMV: no se pudo identificar el equipo con certeza. Envíe RECORDATORIO seguido de la categoría y el nivel exactos.",
        ),
      );
      return xmlResponse(response.toString());
    }

    if (command.kind === "reminder-on") {
      const entitlement = await resolvePhoneEntitlement(
        contact,
        "game_reminders",
        settings,
      );
      if (!canUse(entitlement, "game_reminders")) {
        response.message(
          t(
            `AHMV: les rappels personnalisés sont une fonction membre après la période découverte. Activez: ${memberActivationUrl(settings)}`,
            `AHMV: personalized reminders are a member feature after the introductory period. Activate: ${memberActivationUrl(settings)}`,
            `AHMV: los recordatorios personalizados son una función para miembros después del período introductorio. Active aquí: ${memberActivationUrl(settings)}`,
          ),
        );
        await safeRecordPhoneInteraction({
          contactId: contact.id,
          channel: "sms",
          providerReferenceHash: ref,
          intent: "reminder-on",
          outcome: "membership-required",
          teamCode: resolution.team.legacyScheduleTeamId,
        });
        return xmlResponse(response.toString());
      }
    }

    const enabled = command.kind === "reminder-on";
    const saved = await safeSetTeamReminderPreference(
      contact.id,
      resolution.team.legacyScheduleTeamId,
      enabled,
    );
    const teamLabel = `${resolution.team.categorySlug.toUpperCase()} ${resolution.team.level} ${resolution.team.name}`;
    response.message(
      saved
        ? enabled
          ? t(
              `AHMV: rappels activés pour ${teamLabel}. Vous pouvez les désactiver avec RAPPEL OFF suivi de l'équipe.`,
              `AHMV: reminders enabled for ${teamLabel}. Disable them with REMIND OFF followed by the team.`,
              `AHMV: recordatorios activados para ${teamLabel}. Puede desactivarlos con RECORDATORIO OFF seguido del equipo.`,
            )
          : t(
              `AHMV: rappels désactivés pour ${teamLabel}.`,
              `AHMV: reminders disabled for ${teamLabel}.`,
              `AHMV: recordatorios desactivados para ${teamLabel}.`,
            )
        : t(
            "AHMV: impossible de modifier les rappels pour le moment.",
            "AHMV: unable to update reminders right now.",
            "AHMV: no es posible modificar los recordatorios por el momento.",
          ),
    );
    await safeRecordPhoneInteraction({
      contactId: contact.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: command.kind,
      outcome: saved ? (enabled ? "enabled" : "disabled") : "failed",
      teamCode: resolution.team.legacyScheduleTeamId,
    });
    log(saved ? `reminder-${enabled ? "enabled" : "disabled"}` : "reminder-failed");
    return xmlResponse(response.toString());
  }

  if (command.kind === "save") {
    const entitlement = await resolvePhoneEntitlement(
      contact,
      "saved_teams",
      settings,
    );

    if (!contact || !canUse(entitlement, "saved_teams")) {
      response.message(
        t(
          `AHMV: sauvegarder une équipe est une fonction membre après la période découverte. Activez ici: ${memberActivationUrl(settings)}`,
          `AHMV: saving a team is a member feature after the introductory period. Activate here: ${memberActivationUrl(settings)}`,
          `AHMV: guardar un equipo es una función para miembros después del período introductorio. Active aquí: ${memberActivationUrl(settings)}`,
        ),
      );
      await safeRecordPhoneInteraction({
        contactId: contact?.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: "save-team",
        outcome: "membership-required",
        teamCode: command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    if (resolution.kind !== "exact") {
      response.message(
        t(
          "AHMV: équipe non reconnue de façon certaine. Envoyez le code/catégorie et niveau exacts.",
          "AHMV: team could not be identified with certainty. Send the exact category and level.",
          "AHMV: no se pudo identificar el equipo con certeza. Envíe la categoría y el nivel exactos.",
        ),
      );
      return xmlResponse(response.toString());
    }

    const saved = await safeSavePrimaryTeamPreference(
      contact.id,
      resolution.team.legacyScheduleTeamId,
    );
    const savedTeamLabel = `${resolution.team.categorySlug.toUpperCase()} ${resolution.team.level} ${resolution.team.name}`;
    response.message(
      saved
        ? t(
            `AHMV: équipe principale sauvegardée — ${savedTeamLabel}.`,
            `AHMV: primary team saved — ${savedTeamLabel}.`,
            `AHMV: equipo principal guardado — ${savedTeamLabel}.`,
          )
        : t(
            "AHMV: impossible de sauvegarder l'équipe pour le moment.",
            "AHMV: unable to save the team right now.",
            "AHMV: no es posible guardar el equipo por el momento.",
          ),
    );
    await safeRecordPhoneInteraction({
      contactId: contact.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: "save-team",
      outcome: saved ? "saved" : "failed",
      teamCode: resolution.team.legacyScheduleTeamId,
    });
    return xmlResponse(response.toString());
  }

  if (
    command.kind === "today" ||
    command.kind === "tomorrow" ||
    command.kind === "week"
  ) {
    const entitlement = await resolvePhoneEntitlement(
      contact,
      "weekly_schedule",
      settings,
    );

    if (!contact || !canUse(entitlement, "weekly_schedule")) {
      response.message(
        t(
          `AHMV: aujourd'hui/demain/semaine est une fonction membre après la période découverte. Le prochain événement reste disponible. Activez: ${memberActivationUrl(settings)}`,
          `AHMV: today/tomorrow/week is a member feature after the introductory period. The next event remains available. Activate: ${memberActivationUrl(settings)}`,
          `AHMV: hoy/mañana/semana es una función para miembros después del período introductorio. El próximo evento sigue disponible. Active aquí: ${memberActivationUrl(settings)}`,
        ),
      );
      await safeRecordPhoneInteraction({
        contactId: contact?.id,
        channel: "sms",
        providerReferenceHash: ref,
        intent: command.kind,
        outcome: "membership-required",
        teamCode: command.teamQuery,
      });
      return xmlResponse(response.toString());
    }

    const rangeAnswer = scheduleRangeAnswer(
      command.teamQuery,
      command.kind,
      lang,
      officialPhoneSchedule,
      new Date(),
      teamAliases(settings),
    );
    response.message(rangeAnswer.text.slice(0, 1500));
    await safeRecordPhoneInteraction({
      contactId: contact.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: command.kind,
      outcome: rangeAnswer.outcome,
      teamCode: rangeAnswer.group ?? command.teamQuery,
    });
    log(`range-${rangeAnswer.outcome}`);
    return xmlResponse(response.toString());
  }

  const answer = nextEventService(
    command.teamQuery,
    lang,
    teamAliases(settings),
  );
  const alert = urgentBulletin(settings, lang);
  response.message(
    `${alert ? `${alert.slice(0, 240)}\n` : ""}${answer.smsText}`,
  );
  await safeRecordPhoneInteraction({
    contactId: contact?.id,
    channel: "sms",
    providerReferenceHash: ref,
    intent: "next-event",
    outcome: answer.outcome,
    teamCode: answer.group ?? command.teamQuery.slice(0, 80),
    arenaSlug: answer.directions?.arenaSlug,
  });
  log(answer.outcome);
  return xmlResponse(response.toString());
}
