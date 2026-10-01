import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function localDateTime(date: string, time: string) {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function utcStamp() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export function AddToCalendarButton({
  id,
  date,
  start,
  end,
  title,
  location,
  disabled = false,
}: {
  id: string;
  date: string;
  start: string;
  end: string;
  title: string;
  location: string;
  disabled?: boolean;
}) {
  const { lang } = useI18n();

  const download = () => {
    if (disabled) return;

    const note =
      lang === "fr"
        ? "Horaire sujet à changement. Vérifiez toujours la source officielle AHM Verdun."
        : "Schedule subject to change. Always verify the official AHM Verdun source.";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AHM Verdun//Horaire//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${escapeIcs(id)}@ahmverdun.com`,
      `DTSTAMP:${utcStamp()}`,
      `DTSTART;TZID=America/Toronto:${localDateTime(date, start)}`,
      `DTEND;TZID=America/Toronto:${localDateTime(date, end)}`,
      `SUMMARY:${escapeIcs(title)}`,
      `LOCATION:${escapeIcs(location)}`,
      `DESCRIPTION:${escapeIcs(note)}`,
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ahmv-${id}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={download}
      disabled={disabled}
      title={
        disabled
          ? (lang === "fr" ? "Activité annulée" : "Cancelled activity")
          : (lang === "fr" ? "Ajouter à votre calendrier" : "Add to your calendar")
      }
    >
      <CalendarPlus className="size-3.5" aria-hidden />
      {lang === "fr" ? "Calendrier" : "Calendar"}
    </Button>
  );
}
