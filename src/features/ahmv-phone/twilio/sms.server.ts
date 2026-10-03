import twilio from "twilio";
import { officialPhoneSchedule, parseSms } from "../../../lib/ahmv-phone.ts";
import {
  normalizePhoneE164,
  safeSavePrimaryTeamPreference,
  safeTouchPhoneContact,
} from "../contacts/store.server.ts";
import { safeRecordPhoneInteraction } from "../audit/store.server.ts";
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
  const caller = normalizePhoneE164(params["From"]);
  const contact = caller
    ? await safeTouchPhoneContact({
        phoneE164: caller,
        language: lang,
        smsRequested: true,
        settings,
      })
    : null;

  if (
    params["OptOutType"] ||
    /^(STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT|START)$/i.test(query)
  ) {
    await safeRecordPhoneInteraction({
      contactId: contact?.id,
      channel: "sms",
      providerReferenceHash: ref,
      intent: "opt-out",
      outcome: "managed-by-twilio",
    });
    log("opt-out-managed-by-twilio");
    return xmlResponse(response.toString());
  }

  if (!query || /^(HELP|AIDE|FR|EN)$/i.test(query)) {
    response.message(
      lang === "fr"
        ? "AHMV: envoyez votre équipe pour le prochain événement. Essai 30 jours: AUJOURD'HUI équipe, DEMAIN équipe, SEMAINE équipe, SAUVE équipe. EN pour anglais. GROUPE TAKATAK."
        : "AHMV: text your team for the next event. 30-day trial: TODAY team, TOMORROW team, WEEK team, SAVE team. GROUPE TAKATAK.",
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
      lang === "fr"
        ? `AHMV: précisez l'équipe. Choix trouvés: ${choices}. https://ahmverdun.ca/equipes`
        : `AHMV: please specify the team. Matches: ${choices}. https://ahmverdun.ca/equipes`,
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

  if (command.kind === "save") {
    const entitlement = await resolvePhoneEntitlement(
      contact,
      "saved_teams",
      settings,
    );

    if (!contact || !canUse(entitlement, "saved_teams")) {
      response.message(
        lang === "fr"
          ? `AHMV: sauvegarder une équipe est une fonction membre après la période découverte. Activez ici: ${memberActivationUrl(settings)}`
          : `AHMV: saving a team is a member feature after the introductory period. Activate here: ${memberActivationUrl(settings)}`,
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
        lang === "fr"
          ? "AHMV: équipe non reconnue de façon certaine. Envoyez le code/catégorie et niveau exacts."
          : "AHMV: team could not be identified with certainty. Send the exact category and level.",
      );
      return xmlResponse(response.toString());
    }

    const saved = await safeSavePrimaryTeamPreference(
      contact.id,
      resolution.team.legacyScheduleTeamId,
    );
    response.message(
      saved
        ? lang === "fr"
          ? `AHMV: équipe principale sauvegardée — ${resolution.team.categorySlug.toUpperCase()} ${resolution.team.level} ${resolution.team.name}.`
          : `AHMV: primary team saved — ${resolution.team.categorySlug.toUpperCase()} ${resolution.team.level} ${resolution.team.name}.`
        : lang === "fr"
          ? "AHMV: impossible de sauvegarder l'équipe pour le moment."
          : "AHMV: unable to save the team right now.",
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
        lang === "fr"
          ? `AHMV: aujourd'hui/demain/semaine est une fonction membre après la période découverte. Le prochain événement reste disponible. Activez: ${memberActivationUrl(settings)}`
          : `AHMV: today/tomorrow/week is a member feature after the introductory period. The next event remains available. Activate: ${memberActivationUrl(settings)}`,
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
