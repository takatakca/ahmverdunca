import {
  officialPhoneSchedule,
  scheduleAnswer,
  type PhoneLanguage,
} from "../../../lib/ahmv-phone";
import { compactDirectionsSms, navigationLinksForVenue } from "../arenas/navigation";

export function nextEventService(
  teamQuery: string,
  lang: PhoneLanguage,
  aliases: Record<string, string> = {},
  now = new Date(),
  snapshot = officialPhoneSchedule,
) {
  const answer = scheduleAnswer(teamQuery, lang, snapshot, now, aliases);
  const event = answer.event;
  const directions = event ? navigationLinksForVenue(event.venue) : undefined;
  return {
    ...answer,
    directions,
    smsText: event
      ? `${answer.text}\n${compactDirectionsSms(event.venue, lang)}`
      : answer.text,
  };
}
