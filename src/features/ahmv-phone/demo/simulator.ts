import { parseSms, scheduleAnswer, type PhoneLanguage } from "../../../lib/ahmv-phone";
import { navigationLinksForVenue } from "../arenas/navigation";
import { parsePhoneCommand } from "../conversation/commands";
import { canUse, localEntitlement } from "../entitlements/access";
import { scheduleRangeAnswer } from "../schedules/range";
import { PHONE_DEMO_ALIASES, PHONE_DEMO_NOW, PHONE_DEMO_SCHEDULE } from "./fixtures";

export type DemoAccess = "guest" | "trial" | "expired" | "premium";

export interface PhoneDemoInput {
  channel: "sms" | "voice";
  lang?: PhoneLanguage | undefined;
  message: string;
  access?: DemoAccess | undefined;
  wantsSms?: boolean | undefined;
}

export interface PhoneDemoOutput {
  demo: true;
  channel: "sms" | "voice";
  language: PhoneLanguage;
  access: DemoAccess;
  recognizedIntent: string;
  spokenText?: string | undefined;
  smsText?: string | undefined;
  hangup: boolean;
  disclaimer: string;
}

function entitlementFor(access: DemoAccess) {
  if (access === "premium") return localEntitlement("premium", undefined, PHONE_DEMO_NOW);
  if (access === "trial") return localEntitlement("trial", "2099-11-02T00:00:00Z", PHONE_DEMO_NOW);
  if (access === "expired") return localEntitlement("trial", "2099-09-01T00:00:00Z", PHONE_DEMO_NOW);
  return localEntitlement("guest", undefined, PHONE_DEMO_NOW);
}

function normalizeDemoTeam(query: string) {
  const value = query.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (value === "M13A") return "M13 A DÉMO";
  if (value === "JUNIOR") return "Junior DÉMO";
  return query;
}

function membershipText(lang: PhoneLanguage) {
  return lang === "fr"
    ? "DÉMO — Cette fonction personnalisée exige un essai actif ou un abonnement GROUPE TAKATAK."
    : "DEMO — This personalized feature requires an active trial or GROUPE TAKATAK membership.";
}

export function simulatePhoneDemo(input: PhoneDemoInput): PhoneDemoOutput {
  const parsed =
    input.channel === "sms"
      ? parseSms(input.lang === "en" ? "EN " + input.message : input.message)
      : { lang: input.lang ?? ("fr" as const), query: input.message.trim() };

  const lang = parsed.lang;
  const access = input.access ?? "trial";
  const command = parsePhoneCommand(parsed.query);
  const entitlement = entitlementFor(access);
  const disclaimer =
    lang === "fr"
      ? "DÉMO UNIQUEMENT — horaires fictifs, jamais utilisés comme données officielles."
      : "DEMO ONLY — fictional schedules, never used as official data.";

  if (!parsed.query) {
    return {
      demo: true,
      channel: input.channel,
      language: lang,
      access,
      recognizedIntent: "help",
      ...(input.channel === "voice"
        ? { spokenText: lang === "fr" ? "DÉMO. Dites votre équipe." : "DEMO. Say your team." }
        : {
            smsText:
              lang === "fr"
                ? "DÉMO AHMV: envoyez M13A ou Junior."
                : "AHMV DEMO: text M13A or Junior.",
          }),
      hangup: input.channel === "voice",
      disclaimer,
    };
  }

  const team = normalizeDemoTeam(command.teamQuery);

  if (command.kind === "save") {
    const allowed = canUse(entitlement, "saved_teams");
    const responseText = allowed
      ? lang === "fr"
        ? "DÉMO — Équipe principale sauvegardée: " + team + "."
        : "DEMO — Primary team saved: " + team + "."
      : membershipText(lang);

    return {
      demo: true,
      channel: input.channel,
      language: lang,
      access,
      recognizedIntent: "save-team",
      ...(input.channel === "voice" ? { spokenText: responseText } : { smsText: responseText }),
      hangup: true,
      disclaimer,
    };
  }

  if (command.kind === "today" || command.kind === "tomorrow" || command.kind === "week") {
    if (!canUse(entitlement, "weekly_schedule")) {
      const responseText = membershipText(lang);
      return {
        demo: true,
        channel: input.channel,
        language: lang,
        access,
        recognizedIntent: command.kind,
        ...(input.channel === "voice" ? { spokenText: responseText } : { smsText: responseText }),
        hangup: true,
        disclaimer,
      };
    }

    const result = scheduleRangeAnswer(
      team,
      command.kind,
      lang,
      PHONE_DEMO_SCHEDULE,
      PHONE_DEMO_NOW,
      PHONE_DEMO_ALIASES as unknown as Record<string, string>,
    );

    return {
      demo: true,
      channel: input.channel,
      language: lang,
      access,
      recognizedIntent: command.kind,
      ...(input.channel === "voice"
        ? { spokenText: result.text.replace(/https:\/\/\S+/g, "") }
        : { smsText: disclaimer + "\n" + result.text }),
      hangup: true,
      disclaimer,
    };
  }

  const answer = scheduleAnswer(
    team,
    lang,
    PHONE_DEMO_SCHEDULE,
    PHONE_DEMO_NOW,
    PHONE_DEMO_ALIASES as unknown as Record<string, string>,
  );
  const directions = answer.event ? navigationLinksForVenue(answer.event.venue) : undefined;
  const compact =
    disclaimer +
    "\n" +
    answer.text +
    (directions
      ? "\n" + (lang === "fr" ? "Itinéraire: " : "Directions: ") + directions.googleMaps
      : "");

  return {
    demo: true,
    channel: input.channel,
    language: lang,
    access,
    recognizedIntent: "next-event",
    ...(input.channel === "voice"
      ? {
          spokenText: answer.text.replace(/https:\/\/\S+/g, ""),
          ...(input.wantsSms ? { smsText: compact } : {}),
        }
      : { smsText: compact }),
    hangup: true,
    disclaimer,
  };
}
