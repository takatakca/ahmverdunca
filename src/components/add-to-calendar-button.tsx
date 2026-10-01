import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function icsDate(date: string, time: string) {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function AddToCalendarButton({
  title,
  date,
  start,
  end,
  location,
}: {
  title: string;
  date: string;
  start: string;
  end: string;
  location: string;
}) {
  const { lang } = useI18n();

  const download = () => {
    const uid = `${date}-${start}-${slug(title)}@ahmverdun.com`;
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const description =
      lang === "fr"
        ? "Horaire AHM Verdun. Sujet à changement : vérifiez toujours la source officielle avant de vous déplacer."
        : "AHM Verdun schedule. Subject to change: always verify the official source before travelling.";

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AHM Verdun//Horaire//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-TIMEZONE:America/Toronto",
      "BEGIN:VEVENT",
      `UID:${escapeIcs(uid)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/Toronto:${icsDate(date, start)}`,
      `DTEND;TZID=America/Toronto:${icsDate(date, end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `LOCATION:${escapeIcs(location)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      "URL:https://ahmverdun.com/horaires",
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ];

    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ahmv-${date}-${slug(title) || "activite"}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={download}>
      <CalendarPlus className="size-4" />
      {lang === "fr" ? "Calendrier" : "Calendar"}
    </Button>
  );
}
