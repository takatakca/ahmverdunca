import twilio from "twilio";
import { createHash } from "node:crypto";
import {
  officialPhoneSchedule,
  parseSms,
  scheduleAnswer,
  type PhoneLanguage,
} from "./ahmv-phone.ts";
import {
  normalizePhoneE164,
  safeRecordPhoneInteraction,
  safeSavePrimaryTeamPreference,
  safeTouchPhoneContact,
} from "../features/ahmv-phone/contacts/store.server.ts";
import {
  sendTransactionalSms,
  updateSmsDeliveryStatus,
} from "../features/ahmv-phone/messaging/send.server.ts";
import { nextEventService } from "../features/ahmv-phone/schedules/service.ts";
import { scheduleRangeAnswer } from "../features/ahmv-phone/schedules/range.ts";
import { parsePhoneCommand } from "../features/ahmv-phone/conversation/commands.ts";
import { canUse } from "../features/ahmv-phone/entitlements/access.ts";
import {
  memberActivationUrl,
  resolvePhoneEntitlement,
} from "../features/ahmv-phone/entitlements/service.server.ts";
import {
  compactTeamChoices,
  resolvePublicTeam,
} from "../features/ahmv-phone/teams/resolve.ts";

const ROOT = "/api/ahmv/twilio";
const routes = new Set([`${ROOT}/sms`, `${ROOT}/voice`, `${ROOT}/status`]);
const headers = { "cache-control": "no-store", "X-Robots-Tag": "noindex, nofollow" };
type Settings = Record<string, string | undefined>;

function xml(value: string) {
  return new Response(value, {
    headers: { ...headers, "content-type": "text/xml; charset=utf-8" },
  });
}
function failure(status: number) {
  return new Response("Webhook unavailable", { status, headers });
}
function aliases(settings: Settings): Record<string, string> {
  if (!settings["AHMV_TEAM_ALIASES_JSON"]) return {};
  const value: unknown = JSON.parse(settings["AHMV_TEAM_ALIASES_JSON"]);
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.values(value).some((item) => typeof item !== "string")
  )
    throw new Error("Invalid team aliases");
  return value as Record<string, string>;
}
function urgent(settings: Settings, lang: PhoneLanguage) {
  const until = Date.parse(settings["AHMV_URGENT_UNTIL"] ?? "");
  if (!Number.isFinite(until) || until <= Date.now()) return "";
  return (settings[lang === "fr" ? "AHMV_URGENT_FR" : "AHMV_URGENT_EN"] ?? "").slice(0, 1000);
}
function referenceHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
function spokenAnswer(text: string, lang: PhoneLanguage) {
  return text.replace(
    /https:\/\/\S+/g,
    lang === "fr"
      ? "Consultez ahmverdun point c a pour les détails."
      : "Visit ahmverdun dot c a for details.",
  );
}
function compactSmsFallback(lang: PhoneLanguage) {
  return lang === "fr"
    ? "AHMV: répondez à ce texto avec votre équipe ou groupe (ex. M11 groupe 5). Aide: AIDE. https://ahmverdun.ca/horaires"
    : "AHMV: reply with your team or group (e.g. M11 group 5). Help: HELP. https://ahmverdun.ca/horaires";
}

export async function handleAhmvTwilio(
  request: Request,
  settings: Settings = process.env,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!routes.has(url.pathname)) return null;
  if (request.method !== "POST")
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...headers, Allow: "POST" },
    });
  if (settings["AHMV_PHONE_ENABLED"] !== "true") return failure(503);

  const token = settings["TWILIO_AUTH_TOKEN"];
  const account = settings["TWILIO_ACCOUNT_SID"];
  const origin = settings["AHMV_WEBHOOK_ORIGIN"];
  if (!token || !account || !origin) return failure(503);

  let publicOrigin: URL;
  try {
    publicOrigin = new URL(origin);
    if (publicOrigin.protocol !== "https:" || publicOrigin.origin !== origin) return failure(503);
  } catch {
    return failure(503);
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/x-www-form-urlencoded")
  )
    return failure(415);

  const reader = request.body?.getReader();
  if (!reader) return failure(400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 16_384) {
        await reader.cancel();
        return failure(413);
      }
      chunks.push(chunk.value);
    }
  } catch {
    return failure(400);
  }

  const body = Buffer.concat(chunks);
  const form = new URLSearchParams(body.toString("utf8"));
  const params: Record<string, string> = Object.create(null);
  for (const [key, value] of form) {
    if (Object.hasOwn(params, key)) return failure(400);
    params[key] = value;
  }

  const signature = request.headers.get("x-twilio-signature") ?? "";
  const publicUrl = `${publicOrigin.origin}${url.pathname}${url.search}`;
  if (
    !signature ||
    !twilio.validateRequest(token, signature, publicUrl, params) ||
    params["AccountSid"] !== account
  )
    return failure(403);

  const sid = params["MessageSid"] ?? params["CallSid"] ?? "";
  const ref = referenceHash(sid);
  const log = (outcome: string) =>
    console.info(
      JSON.stringify({
        service: "ahmv-phone",
        channel: url.pathname.split("/").pop(),
        reference: ref,
        outcome,
      }),
    );

  if (url.pathname === `${ROOT}/status`) {
    try {
      await updateSmsDeliveryStatus(params["MessageSid"] ?? "", params["MessageStatus"] ?? "");
    } catch (error) {
      console.error("[AHMV SMS delivery callback]", error);
    }
    log("status-received");
    return new Response(null, { status: 204, headers });
  }

  if (params["To"] !== (settings["AHMV_PUBLIC_PHONE"] ?? "+15816666246")) return failure(403);

  try {
    if (url.pathname === `${ROOT}/sms`) {
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
        return xml(response.toString());
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
        return xml(response.toString());
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
        return xml(response.toString());
      }

      if (command.kind === "save") {
        const entitlement = await resolvePhoneEntitlement(contact, "saved_teams", settings);
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
          return xml(response.toString());
        }

        if (resolution.kind !== "exact") {
          response.message(
            lang === "fr"
              ? "AHMV: équipe non reconnue de façon certaine. Envoyez le code/catégorie et niveau exacts."
              : "AHMV: team could not be identified with certainty. Send the exact category and level.",
          );
          return xml(response.toString());
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
        return xml(response.toString());
      }

      if (command.kind === "today" || command.kind === "tomorrow" || command.kind === "week") {
        const entitlement = await resolvePhoneEntitlement(contact, "weekly_schedule", settings);
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
          return xml(response.toString());
        }

        const rangeAnswer = scheduleRangeAnswer(
          command.teamQuery,
          command.kind,
          lang,
          officialPhoneSchedule,
          new Date(),
          aliases(settings),
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
        return xml(response.toString());
      }

      const answer = nextEventService(command.teamQuery, lang, aliases(settings));
      const alert = urgent(settings, lang);
      response.message(`${alert ? `${alert.slice(0, 240)}\n` : ""}${answer.smsText}`);
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
      return xml(response.toString());
    }

    const voice = new twilio.twiml.VoiceResponse();
    const step = url.searchParams.get("step") ?? "language";
    const lang: PhoneLanguage = url.searchParams.get("lang") === "en" ? "en" : "fr";
    const smsRequested = url.searchParams.get("sms") === "1";
    const language = lang === "fr" ? "fr-CA" : "en-US";
    const caller = normalizePhoneE164(params["From"]);
    const say = (text: string) =>
      voice.say({ language, voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna" }, text);
    const action = (next: string, attempt = 0, sms = smsRequested) =>
      `${ROOT}/voice?step=${next}&lang=${lang}&attempt=${attempt}&sms=${sms ? "1" : "0"}`;
    const attempt = Number(url.searchParams.get("attempt") ?? "0");
    if (!Number.isInteger(attempt) || attempt < 0 || attempt > 3) return failure(400);

    if (step === "language") {
      const gather = voice.gather({
        input: ["dtmf"],
        numDigits: 1,
        action: `${ROOT}/voice?step=select&attempt=${attempt}`,
        method: "POST",
        timeout: 4,
      });
      gather.say(
        { language: "fr-CA", voice: "Polly.Chantal" },
        "Bienvenue à l'Association du hockey mineur de Verdun. Pour le français, appuyez sur 1.",
      );
      gather.say(
        { language: "en-US", voice: "Polly.Joanna" },
        "Welcome to the Verdun Minor Hockey Association. For English, press 2.",
      );
      voice.hangup();
    } else if (step === "select") {
      if (!["1", "2"].includes(params["Digits"] ?? "")) {
        if (attempt < 1) {
          voice.redirect({ method: "POST" }, `${ROOT}/voice?step=language&attempt=${attempt + 1}`);
        } else {
          voice.hangup();
        }
      } else {
        const selectedLang: PhoneLanguage = params["Digits"] === "2" ? "en" : "fr";
        if (caller) {
          await safeTouchPhoneContact({
            phoneE164: caller,
            language: selectedLang,
            settings,
          });
        }
        voice.redirect(
          { method: "POST" },
          `${ROOT}/voice?step=delivery&lang=${selectedLang}&attempt=0&sms=0`,
        );
      }
    } else if (step === "delivery") {
      const gather = voice.gather({
        input: ["dtmf"],
        numDigits: 1,
        action: action("delivery-choice"),
        method: "POST",
        timeout: 4,
      });
      gather.say(
        { language, voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna" },
        lang === "fr"
          ? "Pour recevoir par texto les renseignements que vous demandez pendant cet appel, appuyez sur 1. Ce service est offert par GROUPE TAKATAK avec une période découverte de 30 jours. Pour voix seulement, appuyez sur 2."
          : "To receive the information you request during this call by text message, press 1. This GROUPE TAKATAK service includes a 30 day introductory period. For voice only, press 2.",
      );
      voice.hangup();
    } else if (step === "delivery-choice") {
      const digit = params["Digits"] ?? "";
      if (!["1", "2"].includes(digit)) {
        if (attempt < 1) voice.redirect({ method: "POST" }, action("delivery", attempt + 1, false));
        else voice.redirect({ method: "POST" }, action("menu", 0, false));
      } else {
        const wantsSms = digit === "1" && Boolean(caller);
        if (caller) {
          await safeTouchPhoneContact({
            phoneE164: caller,
            language: lang,
            smsRequested: wantsSms,
            settings,
          });
        }
        voice.redirect({ method: "POST" }, action("menu", 0, wantsSms));
      }
    } else if (step === "menu") {
      const alert = urgent(settings, lang);
      if (alert) say(alert);
      const gather = voice.gather({
        input: ["dtmf"],
        numDigits: 1,
        action: action("choice"),
        method: "POST",
        timeout: 4,
      });
      gather.say(
        { language, voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna" },
        lang === "fr"
          ? "Pour votre prochain match ou entraînement, appuyez sur 1. Pour entendre les équipes disponibles, 2. Pour les arénas, 3."
          : "For your next game or practice, press 1. For available teams, press 2. For arenas, press 3.",
      );
      voice.hangup();
    } else if (step === "choice") {
      if (params["Digits"] === "1") {
        voice.redirect({ method: "POST" }, action("team"));
      } else if (["2", "3"].includes(params["Digits"] ?? "")) {
        const items = [
          ...new Set(
            officialPhoneSchedule.activities.map((item) =>
              params["Digits"] === "2" ? item.group : item.venue,
            ),
          ),
        ].slice(0, 8);
        say(
          lang === "fr"
            ? "Voici les entrées validées dans la source présentement intégrée."
            : "These are the validated entries in the currently integrated source.",
        );
        say(items.join(". "));
        say(lang === "fr" ? "Merci." : "Thank you.");
        voice.hangup();
      } else if (attempt < 1) {
        voice.redirect({ method: "POST" }, action("menu", attempt + 1));
      } else {
        voice.hangup();
      }
    } else if (step === "team") {
      const gather = voice.gather({
        input: ["speech"],
        language,
        speechTimeout: "auto",
        timeout: 3,
        action: action("answer", attempt),
        method: "POST",
        actionOnEmptyResult: true,
      });
      gather.say(
        { language, voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna" },
        lang === "fr"
          ? "Dites votre équipe ou votre groupe maintenant."
          : "Say your team or group now.",
      );
    } else if (step === "answer") {
      const spoken = (params["SpeechResult"] ?? "").slice(0, 80).trim();
      const contact = caller
        ? await safeTouchPhoneContact({
            phoneE164: caller,
            language: lang,
            smsRequested,
            settings,
          })
        : null;

      if (!spoken) {
        if (attempt < 1) {
          voice.redirect({ method: "POST" }, action("team", attempt + 1));
        } else {
          if (smsRequested && caller) {
            const sent = await sendTransactionalSms({
              to: caller,
              body: compactSmsFallback(lang),
              purpose: "voice-fallback",
              contactId: contact?.id,
              settings,
            });
            say(
              sent.sent
                ? lang === "fr"
                  ? "Je vous ai envoyé un texto. Répondez simplement avec votre équipe. Merci."
                  : "I sent you a text. Simply reply with your team. Thank you."
                : lang === "fr"
                  ? "Je n'ai pas pu envoyer le texto. Consultez ahmverdun point c a. Merci."
                  : "I could not send the text. Visit ahmverdun dot c a. Thank you.",
            );
          } else {
            say(
              lang === "fr"
                ? "Je n'ai rien entendu. Vous pouvez texter votre équipe au même numéro. Merci."
                : "I did not hear anything. You can text your team to this same number. Thank you.",
            );
          }
          await safeRecordPhoneInteraction({
            contactId: contact?.id,
            channel: "voice",
            providerReferenceHash: ref,
            intent: "next-event",
            outcome: "no-speech",
          });
          voice.hangup();
        }
      } else {
        const resolution = resolvePublicTeam(spoken);
        if (resolution.kind === "ambiguous") {
          const choices = compactTeamChoices(resolution.teams, 3).join(". ");
          say(
            lang === "fr"
              ? `J'ai trouvé plusieurs équipes. ${choices}. Envoyez votre équipe exacte par texto pour aller plus vite.`
              : `I found multiple teams. ${choices}. Text your exact team for a faster result.`,
          );
          if (smsRequested && caller) {
            await sendTransactionalSms({
              to: caller,
              body:
                lang === "fr"
                  ? `AHMV: plusieurs équipes correspondent. Répondez avec l'équipe exacte: ${choices}`
                  : `AHMV: multiple teams match. Reply with the exact team: ${choices}`,
              purpose: "team-ambiguity",
              contactId: contact?.id,
              settings,
            });
          }
          await safeRecordPhoneInteraction({
            contactId: contact?.id,
            channel: "voice",
            providerReferenceHash: ref,
            intent: "team-lookup",
            outcome: "ambiguous",
            teamCode: spoken,
          });
          voice.hangup();
        } else {
          const answer = nextEventService(spoken, lang, aliases(settings));
          say(spokenAnswer(answer.text, lang));
          if (smsRequested && caller) {
            const sent = await sendTransactionalSms({
              to: caller,
              body: answer.smsText,
              purpose: "voice-next-event",
              contactId: contact?.id,
              settings,
            });
            if (sent.sent) {
              say(lang === "fr" ? "Je vous envoie les détails par texto. Merci." : "I am sending the details by text. Thank you.");
            }
          } else {
            say(lang === "fr" ? "Merci." : "Thank you.");
          }
          await safeRecordPhoneInteraction({
            contactId: contact?.id,
            channel: "voice",
            providerReferenceHash: ref,
            intent: "next-event",
            outcome: answer.outcome,
            teamCode: answer.group ?? spoken,
            arenaSlug: answer.directions?.arenaSlug,
            metadata: { smsRequested },
          });
          log(answer.outcome);
          voice.hangup();
        }
      }
    } else {
      return failure(400);
    }

    return xml(voice.toString());
  } catch (error) {
    console.error("[AHMV Twilio webhook]", error);
    log("configuration-error");
    return failure(503);
  }
}
