import { parseSms, scheduleAnswer, type PhoneLanguage } from "../../../lib/ahmv-phone";
import { navigationLinksForVenue } from "../arenas/navigation";
import { parsePhoneCommand } from "../conversation/commands";
import { canUse, localEntitlement } from "../entitlements/access";
import { scheduleRangeAnswer } from "../schedules/range";
import { PHONE_DEMO_ALIASES, PHONE_DEMO_NOW, PHONE_DEMO_SCHEDULE } from "./fixtures";
import { phoneLanguagePrefix, phoneText } from "../i18n.ts";

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
  if (access === "premium") {
    return localEntitlement(
      "premium",
      undefined,
      PHONE_DEMO_NOW,
      "2099-11-02T00:00:00Z",
    );
  }
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
  return phoneText(lang, {
    fr: "DÉMO — Cette fonction personnalisée exige un essai actif ou un abonnement GROUPE TAKATAK.",
    en: "DEMO — This personalized feature requires an active trial or GROUPE TAKATAK membership.",
    es: "DEMO — Esta función personalizada requiere una prueba activa o una membresía de GROUPE TAKATAK.",
  });
}

export function simulatePhoneDemo(input: PhoneDemoInput): PhoneDemoOutput {
  const parsed =
    input.channel === "sms"
      ? parseSms((input.lang ? phoneLanguagePrefix(input.lang) + " " : "") + input.message)
      : { lang: input.lang ?? ("fr" as const), query: input.message.trim() };

  const lang = parsed.lang;
  const access = input.access ?? "trial";
  const command = parsePhoneCommand(parsed.query);
  const entitlement = entitlementFor(access);
  const disclaimer = phoneText(lang, {
    fr: "DÉMO UNIQUEMENT — horaires fictifs, jamais utilisés comme données officielles.",
    en: "DEMO ONLY — fictional schedules, never used as official data.",
    es: "SOLO DEMO — horarios ficticios, nunca utilizados como datos oficiales.",
  });

  if (!parsed.query) {
    return {
      demo: true,
      channel: input.channel,
      language: lang,
      access,
      recognizedIntent: "help",
      ...(input.channel === "voice"
        ? {
            spokenText: phoneText(lang, {
              fr: "DÉMO. Dites votre équipe.",
              en: "DEMO. Say your team.",
              es: "DEMO. Diga su equipo.",
            }),
          }
        : {
            smsText: phoneText(lang, {
              fr: "DÉMO AHMV: envoyez M13A ou Junior.",
              en: "AHMV DEMO: text M13A or Junior.",
              es: "DEMO AHMV: envíe M13A o Junior.",
            }),
          }),
      hangup: input.channel === "voice",
      disclaimer,
    };
  }

  const team = normalizeDemoTeam(command.teamQuery);

  if (command.kind === "save") {
    const allowed = canUse(entitlement, "saved_teams");
    const responseText = allowed
      ? phoneText(lang, {
          fr: "DÉMO — Équipe principale sauvegardée: " + team + ".",
          en: "DEMO — Primary team saved: " + team + ".",
          es: "DEMO — Equipo principal guardado: " + team + ".",
        })
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
      ? "\n" + phoneText(lang, { fr: "Itinéraire: ", en: "Directions: ", es: "Cómo llegar: " }) + directions.googleMaps
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
