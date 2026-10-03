import twilio from "twilio";
import {
  officialPhoneSchedule,
  type PhoneLanguage,
} from "../../../lib/ahmv-phone.ts";
import {
  normalizePhoneE164,
  safeTouchPhoneContact,
} from "../contacts/store.server.ts";
import { safeRecordPhoneInteraction } from "../audit/store.server.ts";
import { sendTransactionalSms } from "../messaging/send.server.ts";
import { nextEventService } from "../schedules/service.ts";
import {
  compactTeamChoices,
  resolvePublicTeam,
} from "../teams/resolve.ts";
import {
  TWILIO_ROOT,
  compactSmsFallback,
  spokenScheduleAnswer,
  teamAliases,
  urgentBulletin,
  webhookFailure,
  xmlResponse,
} from "./common.server.ts";
import type { ValidatedTwilioRequest } from "./request.server.ts";

export async function handleTwilioVoice(
  context: ValidatedTwilioRequest,
): Promise<Response> {
  const { url, params, settings, reference: ref, log } = context;
  const voice = new twilio.twiml.VoiceResponse();
  const step = url.searchParams.get("step") ?? "language";
  const lang: PhoneLanguage = url.searchParams.get("lang") === "en" ? "en" : "fr";
  const smsRequested = url.searchParams.get("sms") === "1";
  const language = lang === "fr" ? "fr-CA" : "en-US";
  const caller = normalizePhoneE164(params["From"]);

  const say = (text: string) =>
    voice.say(
      {
        language,
        voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna",
      },
      text,
    );

  const action = (next: string, attempt = 0, sms = smsRequested) =>
    `${TWILIO_ROOT}/voice?step=${next}&lang=${lang}&attempt=${attempt}&sms=${sms ? "1" : "0"}`;

  const attempt = Number(url.searchParams.get("attempt") ?? "0");
  if (!Number.isInteger(attempt) || attempt < 0 || attempt > 3) {
    return webhookFailure(400);
  }

  if (step === "language") {
    const gather = voice.gather({
      input: ["dtmf"],
      numDigits: 1,
      action: `${TWILIO_ROOT}/voice?step=select&attempt=${attempt}`,
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
    return xmlResponse(voice.toString());
  }

  if (step === "select") {
    if (!["1", "2"].includes(params["Digits"] ?? "")) {
      if (attempt < 1) {
        voice.redirect(
          { method: "POST" },
          `${TWILIO_ROOT}/voice?step=language&attempt=${attempt + 1}`,
        );
      } else {
        voice.hangup();
      }
      return xmlResponse(voice.toString());
    }

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
      `${TWILIO_ROOT}/voice?step=delivery&lang=${selectedLang}&attempt=0&sms=0`,
    );
    return xmlResponse(voice.toString());
  }

  if (step === "delivery") {
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
    return xmlResponse(voice.toString());
  }

  if (step === "delivery-choice") {
    const digit = params["Digits"] ?? "";
    if (!["1", "2"].includes(digit)) {
      if (attempt < 1) {
        voice.redirect({ method: "POST" }, action("delivery", attempt + 1, false));
      } else {
        voice.redirect({ method: "POST" }, action("menu", 0, false));
      }
      return xmlResponse(voice.toString());
    }

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
    return xmlResponse(voice.toString());
  }

  if (step === "menu") {
    const alert = urgentBulletin(settings, lang);
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
    return xmlResponse(voice.toString());
  }

  if (step === "choice") {
    if (params["Digits"] === "1") {
      voice.redirect({ method: "POST" }, action("team"));
      return xmlResponse(voice.toString());
    }

    if (["2", "3"].includes(params["Digits"] ?? "")) {
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
      return xmlResponse(voice.toString());
    }

    if (attempt < 1) {
      voice.redirect({ method: "POST" }, action("menu", attempt + 1));
    } else {
      voice.hangup();
    }
    return xmlResponse(voice.toString());
  }

  if (step === "team") {
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
    return xmlResponse(voice.toString());
  }

  if (step !== "answer") {
    return webhookFailure(400);
  }

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
      return xmlResponse(voice.toString());
    }

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
    return xmlResponse(voice.toString());
  }

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
    return xmlResponse(voice.toString());
  }

  const answer = nextEventService(spoken, lang, teamAliases(settings));
  say(spokenScheduleAnswer(answer.text, lang));

  if (smsRequested && caller) {
    const sent = await sendTransactionalSms({
      to: caller,
      body: answer.smsText,
      purpose: "voice-next-event",
      contactId: contact?.id,
      settings,
    });
    if (sent.sent) {
      say(
        lang === "fr"
          ? "Je vous envoie les détails par texto. Merci."
          : "I am sending the details by text. Thank you.",
      );
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
  return xmlResponse(voice.toString());
}
