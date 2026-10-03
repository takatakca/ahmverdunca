import twilio from "twilio";
import { createHash } from "node:crypto";
import {
  officialPhoneSchedule,
  parseSms,
  scheduleAnswer,
  type PhoneLanguage,
} from "./ahmv-phone.ts";

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
  // Enforce the limit while streaming, even when Content-Length is absent.
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
    // The supported Twilio forms use scalar fields. Reject ambiguous duplicates.
    if (Object.hasOwn(params, key)) return failure(400);
    params[key] = value;
  }
  const signature = request.headers.get("x-twilio-signature") ?? "";
  // Trusted configured origin, never untrusted Host or X-Forwarded-* headers.
  const publicUrl = `${publicOrigin.origin}${url.pathname}${url.search}`;
  if (
    !signature ||
    !twilio.validateRequest(token, signature, publicUrl, params) ||
    params["AccountSid"] !== account
  )
    return failure(403);
  const sid = params["MessageSid"] ?? params["CallSid"] ?? "";
  const log = (outcome: string) =>
    console.info(
      JSON.stringify({
        service: "ahmv-phone",
        channel: url.pathname.split("/").pop(),
        reference: createHash("sha256").update(sid).digest("hex").slice(0, 16),
        outcome,
      }),
    );
  if (url.pathname === `${ROOT}/status`) {
    log("status-received");
    return new Response(null, { status: 204, headers });
  }
  if (params["To"] !== (settings["AHMV_PUBLIC_PHONE"] ?? "+15816666246")) return failure(403);
  try {
    if (url.pathname === `${ROOT}/sms`) {
      const response = new twilio.twiml.MessagingResponse();
      const { lang, query } = parseSms(params["Body"] ?? "");
      // Twilio Advanced Opt-Out owns these keywords. Do not override its reply.
      if (
        params["OptOutType"] ||
        /^(STOP|STOPALL|UNSUBSCRIBE|CANCEL|END|QUIT|START)$/i.test(query)
      ) {
        log("opt-out-managed-by-twilio");
        return xml(response.toString());
      }
      if (!query || /^(HELP|AIDE|FR|EN)$/i.test(query)) {
        response.message(
          lang === "fr"
            ? "AHMV: envoyez votre équipe (ex. M12B). Pour l’anglais: EN M12B. https://ahmverdun.ca/horaires"
            : "AHMV: text your team (e.g. EN M12B). https://ahmverdun.ca/horaires",
        );
        log("help");
      } else {
        const answer = scheduleAnswer(
          query,
          lang,
          officialPhoneSchedule,
          new Date(),
          aliases(settings),
        );
        const alert = urgent(settings, lang);
        response.message(`${alert ? `${alert.slice(0, 240)}\n` : ""}${answer.text}`);
        log(answer.outcome);
      }
      return xml(response.toString());
    }
    const voice = new twilio.twiml.VoiceResponse();
    const step = url.searchParams.get("step") ?? "language";
    const lang: PhoneLanguage = url.searchParams.get("lang") === "en" ? "en" : "fr";
    const language = lang === "fr" ? "fr-CA" : "en-US";
    const say = (text: string) =>
      voice.say({ language, voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna" }, text);
    const action = (next: string, attempt = 0) =>
      `${ROOT}/voice?step=${next}&lang=${lang}&attempt=${attempt}`;
    const attempt = Number(url.searchParams.get("attempt") ?? "0");
    if (!Number.isInteger(attempt) || attempt < 0 || attempt > 3) return failure(400);
    if (step === "language") {
      const gather = voice.gather({
        input: ["dtmf"],
        numDigits: 1,
        action: `${ROOT}/voice?step=select&attempt=${attempt}`,
        method: "POST",
        timeout: 6,
      });
      gather.say(
        { language: "fr-CA", voice: "Polly.Chantal" },
        "Bienvenue à AHM Verdun. Pour le français, appuyez sur 1.",
      );
      gather.say({ language: "en-US", voice: "Polly.Joanna" }, "For English, press 2.");
      voice.hangup();
    } else if (step === "select") {
      if (!["1", "2"].includes(params["Digits"] ?? "")) {
        if (attempt < 2) voice.redirect({ method: "POST" }, action("language", attempt + 1));
        else voice.hangup();
      } else {
        voice.redirect(
          { method: "POST" },
          `${ROOT}/voice?step=menu&lang=${params["Digits"] === "2" ? "en" : "fr"}`,
        );
      }
    } else if (step === "menu") {
      const alert = urgent(settings, lang);
      if (alert) say(alert);
      const gather = voice.gather({
        input: ["dtmf"],
        numDigits: 1,
        action: action("choice", attempt),
        method: "POST",
        timeout: 6,
      });
      gather.say(
        { language, voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna" },
        lang === "fr"
          ? "Pour l’horaire de votre équipe, appuyez sur 1. Pour les équipes, 2. Pour les arénas, 3."
          : "For your team schedule, press 1. For teams, 2. For arenas, 3.",
      );
      voice.hangup();
    } else if (step === "choice") {
      if (params["Digits"] === "1") voice.redirect({ method: "POST" }, action("team"));
      else if (["2", "3"].includes(params["Digits"] ?? "")) {
        const items = [
          ...new Set(
            officialPhoneSchedule.activities.map((item) =>
              params["Digits"] === "2" ? item.group : item.venue,
            ),
          ),
        ];
        say(
          lang === "fr"
            ? "Voici les entrées de la dernière source intégrée."
            : "These are the entries in the latest integrated source.",
        );
        say(items.join(". "));
        say(
          lang === "fr"
            ? "Consultez ahmverdun point c a pour la liste complète."
            : "Visit ahmverdun dot c a for the complete list.",
        );
        voice.hangup();
      } else if (attempt < 2) voice.redirect({ method: "POST" }, action("menu", attempt + 1));
      else voice.hangup();
    } else if (step === "team") {
      const gather = voice.gather({
        input: ["speech"],
        language,
        speechTimeout: "auto",
        timeout: 6,
        action: action("answer", attempt),
        method: "POST",
        actionOnEmptyResult: true,
      });
      gather.say(
        { language, voice: lang === "fr" ? "Polly.Chantal" : "Polly.Joanna" },
        lang === "fr"
          ? "Dites le nom exact de votre équipe ou groupe. Vous pouvez aussi envoyer votre code par texto."
          : "Say your exact team or group name. You can also text your team code.",
      );
    } else if (step === "answer") {
      if (!params["SpeechResult"] && attempt < 2)
        voice.redirect({ method: "POST" }, action("team", attempt + 1));
      else {
        const answer = scheduleAnswer(
          (params["SpeechResult"] ?? "").slice(0, 80),
          lang,
          officialPhoneSchedule,
          new Date(),
          aliases(settings),
        );
        say(
          answer.text.replace(
            /https:\/\/\S+/g,
            lang === "fr"
              ? "Consultez ahmverdun point c a, page horaires."
              : "Visit ahmverdun dot c a, schedules page.",
          ),
        );
        log(answer.outcome);
        voice.hangup();
      }
    } else return failure(400);
    return xml(voice.toString());
  } catch {
    log("configuration-error");
    return failure(503);
  }
}
