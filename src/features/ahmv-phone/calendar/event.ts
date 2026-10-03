import { officialPhoneSchedule } from "../../../lib/ahmv-phone.ts";
import { navigationLinksForVenue } from "../arenas/navigation.ts";
import { torontoLocalDateTimeToIso } from "../reminders/source.ts";

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function utcStamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function addOneLocalDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + 1))
    .toISOString()
    .slice(0, 10);
}

export function findCalendarEvent(eventId: string) {
  return officialPhoneSchedule.activities.find((event) => event.id === eventId);
}

export function calendarEventTimes(eventId: string) {
  const event = findCalendarEvent(eventId);
  if (!event) return null;

  const startIso = torontoLocalDateTimeToIso(event.date, event.start);
  let endIso = torontoLocalDateTimeToIso(event.date, event.end);
  if (Date.parse(endIso) <= Date.parse(startIso)) {
    endIso = torontoLocalDateTimeToIso(addOneLocalDay(event.date), event.end);
  }

  return { event, startIso, endIso };
}

export function calendarIcs(
  eventId: string,
  now = new Date(),
) {
  const value = calendarEventTimes(eventId);
  if (!value) return null;

  const { event, startIso, endIso } = value;
  const directions = navigationLinksForVenue(event.venue);
  const scheduleUrl =
    "https://ahmverdun.ca/horaires?q=" +
    encodeURIComponent(event.group);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GROUPE TAKATAK//AHM Verdun//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + escapeIcs("ahmv-" + event.id + "@ahmverdun.ca"),
    "DTSTAMP:" + utcStamp(now),
    "DTSTART:" + utcStamp(startIso),
    "DTEND:" + utcStamp(endIso),
    "SUMMARY:" + escapeIcs("AHMV — " + event.activity + " — " + event.group),
    "LOCATION:" + escapeIcs(directions.destination),
    "DESCRIPTION:" +
      escapeIcs(
        "AHM Verdun. " +
          event.venue +
          ". Horaire: " +
          scheduleUrl +
          ". Directions: " +
          directions.googleMaps,
      ),
    "URL:" + escapeIcs(scheduleUrl),
    "STATUS:" + (event.status === "cancelled" ? "CANCELLED" : "CONFIRMED"),
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ];

  return lines.join("\r\n");
}

export function googleCalendarUrl(eventId: string) {
  const value = calendarEventTimes(eventId);
  if (!value) return null;

  const { event, startIso, endIso } = value;
  const directions = navigationLinksForVenue(event.venue);
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set(
    "text",
    "AHMV — " + event.activity + " — " + event.group,
  );
  url.searchParams.set(
    "dates",
    utcStamp(startIso).replace(/Z$/, "Z") +
      "/" +
      utcStamp(endIso).replace(/Z$/, "Z"),
  );
  url.searchParams.set("location", directions.destination);
  url.searchParams.set(
    "details",
    "AHM Verdun — https://ahmverdun.ca/horaires?q=" +
      encodeURIComponent(event.group),
  );
  return url.toString();
}
