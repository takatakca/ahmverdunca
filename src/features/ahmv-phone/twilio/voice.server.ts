import twilio from "twilio";
import {
  officialPhoneSchedule,
  type PhoneLanguage,
} from "../../../lib/ahmv-phone.ts";
import {
  normalizePhoneE164,
  safeTouchPhoneContact,
} from "../contacts/store.server.ts";
import { normalizeNanpDtmf } from "../contacts/phone-input.ts";
import { safeRecordPhoneInteraction } from "../audit/store.server.ts";
import { phoneLocale, phoneText, phoneVoice } from "../i18n.ts";
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
  const requestedLang = url.searchParams.get("lang");
  const lang: PhoneLanguage = requestedLang === "en" ? "en" : requestedLang === "es" ? "es" : "fr";
  const smsRequested = url.searchParams.get("sms") === "1";
  const language = phoneLocale(lang);
  const caller = normalizePhoneE164(params["From"]);

  const t = (fr: string, en: string, es: string) =>
    phoneText(lang, { fr, en, es });

  const say = (text: string) =>
    voice.say(
      {
        language,
        voice: phoneVoice(lang),
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
    gather.say(
      { language: "es-US", voice: "Polly.Lupe-Neural" },
      "Bienvenido a la Asociación de Hockey Menor de Verdun. Para español, oprima 3.",
    );
    voice.hangup();
    return xmlResponse(voice.toString());
  }

  if (step === "select") {
    if (!["1", "2", "3"].includes(params["Digits"] ?? "")) {
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

    const selectedLang: PhoneLanguage = params["Digits"] === "2" ? "en" : params["Digits"] === "3" ? "es" : "fr";
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
      { language, voice: phoneVoice(lang) },
      t(
        "Pour recevoir par texto les renseignements que vous demandez pendant cet appel, appuyez sur 1. Ce service est offert par GROUPE TAKATAK avec une période découverte de 30 jours. Pour voix seulement, appuyez sur 2.",
        "To receive the information you request during this call by text message, press 1. This GROUPE TAKATAK service includes a 30 day introductory period. For voice only, press 2.",
        "Para recibir por texto la información solicitada durante esta llamada, oprima 1. Este servicio de GROUPE TAKATAK incluye un período introductorio de 30 días. Para continuar solo por voz, oprima 2.",
      ),
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

    if (digit === "1" && !caller) {
      voice.redirect({ method: "POST" }, action("collect-phone", 0, true));
      return xmlResponse(voice.toString());
    }

    const wantsSms = digit === "1";
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

  if (step === "collect-phone") {
    const gather = voice.gather({
      input: ["dtmf"],
      numDigits: 10,
      action: action("collect-phone-answer", attempt, true),
      method: "POST",
      timeout: 8,
    });
    gather.say(
      { language, voice: phoneVoice(lang) },
      t(
        "Je n'ai pas accès à votre numéro. Entrez maintenant les dix chiffres du cellulaire où vous voulez recevoir le texto.",
        "I cannot access your number. Enter the ten digits of the mobile phone where you want to receive the text message.",
        "No tengo acceso a su número. Ingrese ahora los diez dígitos del celular donde desea recibir el mensaje de texto.",
      ),
    );
    voice.hangup();
    return xmlResponse(voice.toString());
  }

  if (step === "collect-phone-answer") {
    const suppliedPhone = normalizeNanpDtmf(params["Digits"]);

    if (!suppliedPhone) {
      if (attempt < 1) {
        voice.redirect(
          { method: "POST" },
          action("collect-phone", attempt + 1, true),
        );
      } else {
        say(
          t(
            "Le numéro n'a pas pu être validé. Vous pouvez texter votre équipe directement au même numéro AHMV. Merci.",
            "The number could not be validated. You can text your team directly to the same AHMV number. Thank you.",
            "No se pudo validar el número. Puede enviar su equipo por texto directamente al mismo número de AHMV. Gracias.",
          ),
        );
        await safeRecordPhoneInteraction({
          channel: "voice",
          providerReferenceHash: ref,
          intent: "manual-sms-number",
          outcome: "invalid-number",
        });
        voice.hangup();
      }
      return xmlResponse(voice.toString());
    }

    const suppliedContact = await safeTouchPhoneContact({
      phoneE164: suppliedPhone,
      language: lang,
      smsRequested: true,
      settings,
    });

    const sent = await sendTransactionalSms({
      to: suppliedPhone,
      body: compactSmsFallback(lang),
      purpose: "voice-manual-number-fallback",
      contactId: suppliedContact?.id,
      settings,
    });

    say(
      sent.sent
        ? t(
            "Parfait. Je vous ai envoyé un texto. Répondez simplement avec votre équipe et nous continuons par texto. Merci.",
            "Perfect. I sent you a text. Simply reply with your team and we will continue by text. Thank you.",
            "Perfecto. Le envié un mensaje de texto. Responda simplemente con su equipo y continuaremos por texto. Gracias.",
          )
        : t(
            "Je n'ai pas pu envoyer le texto. Vous pouvez texter votre équipe directement au numéro AHMV. Merci.",
            "I could not send the text. You can text your team directly to the AHMV number. Thank you.",
            "No pude enviar el mensaje de texto. Puede enviar su equipo directamente al número de AHMV. Gracias.",
          ),
    );

    await safeRecordPhoneInteraction({
      contactId: suppliedContact?.id,
      channel: "voice",
      providerReferenceHash: ref,
      intent: "manual-sms-number",
      outcome: sent.sent ? "sent" : "failed",
      metadata: { callerIdUnavailable: true },
    });
    log(sent.sent ? "manual-sms-sent" : "manual-sms-failed");
    voice.hangup();
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
      { language, voice: phoneVoice(lang) },
      t(
        "Pour votre prochain match ou entraînement, appuyez sur 1. Pour entendre les équipes disponibles, 2. Pour les arénas, 3.",
        "For your next game or practice, press 1. For available teams, press 2. For arenas, press 3.",
        "Para su próximo partido o entrenamiento, oprima 1. Para escuchar los equipos disponibles, 2. Para las arenas, 3.",
      ),
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
        t(
          "Voici les entrées validées dans la source présentement intégrée.",
          "These are the validated entries in the currently integrated source.",
          "Estas son las entradas validadas en la fuente actualmente integrada.",
        ),
      );
      say(items.join(". "));
      say(t("Merci.", "Thank you.", "Gracias."));
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
      { language, voice: phoneVoice(lang) },
      t(
        "Dites votre équipe ou votre groupe maintenant.",
        "Say your team or group now.",
        "Diga ahora su equipo o grupo.",
      ),
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
          ? t(
              "Je vous ai envoyé un texto. Répondez simplement avec votre équipe. Merci.",
              "I sent you a text. Simply reply with your team. Thank you.",
              "Le envié un mensaje de texto. Responda simplemente con su equipo. Gracias.",
            )
          : t(
              "Je n'ai pas pu envoyer le texto. Consultez ahmverdun point c a. Merci.",
              "I could not send the text. Visit ahmverdun dot c a. Thank you.",
              "No pude enviar el mensaje de texto. Consulte ahmverdun punto c a. Gracias.",
            ),
      );
    } else {
      say(
        t(
          "Je n'ai rien entendu. Vous pouvez texter votre équipe au même numéro. Merci.",
          "I did not hear anything. You can text your team to this same number. Thank you.",
          "No escuché nada. Puede enviar su equipo por texto a este mismo número. Gracias.",
        ),
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
      t(
        `J'ai trouvé plusieurs équipes. ${choices}. Envoyez votre équipe exacte par texto pour aller plus vite.`,
        `I found multiple teams. ${choices}. Text your exact team for a faster result.`,
        `Encontré varios equipos. ${choices}. Envíe su equipo exacto por texto para obtener una respuesta más rápida.`,
      ),
    );

    if (smsRequested && caller) {
      await sendTransactionalSms({
        to: caller,
        body:
          t(
            `AHMV: plusieurs équipes correspondent. Répondez avec l'équipe exacte: ${choices}`,
            `AHMV: multiple teams match. Reply with the exact team: ${choices}`,
            `AHMV: varios equipos coinciden. Responda con el equipo exacto: ${choices}`,
          ),
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
        t(
          "Je vous envoie les détails par texto. Merci.",
          "I am sending the details by text. Thank you.",
          "Le envío los detalles por mensaje de texto. Gracias.",
        ),
      );
    }
  } else {
    say(t("Merci.", "Thank you.", "Gracias."));
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
