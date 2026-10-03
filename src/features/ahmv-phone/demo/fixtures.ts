import type { ScheduleSnapshot } from "../../../lib/ahmv-phone";

export const PHONE_DEMO_SCHEDULE: ScheduleSnapshot = {
  start: "2099-10-03",
  end: "2099-10-10",
  activities: [
    {
      id: "demo-m13a-1",
      date: "2099-10-03",
      start: "17:00",
      end: "18:00",
      venue: "Auditorium de Verdun",
      activity: "Match DÉMO",
      group: "M13 A DÉMO",
      status: "scheduled",
    },
    {
      id: "demo-m13a-2",
      date: "2099-10-04",
      start: "18:30",
      end: "19:30",
      venue: "Aréna St-Charles",
      activity: "Pratique DÉMO",
      group: "M13 A DÉMO",
      status: "scheduled",
    },
    {
      id: "demo-m13a-3",
      date: "2099-10-06",
      start: "19:15",
      end: "20:15",
      venue: "À DENIS",
      activity: "Match DÉMO",
      group: "M13 A DÉMO",
      status: "scheduled",
    },
    {
      id: "demo-junior-1",
      date: "2099-10-03",
      start: "20:00",
      end: "21:30",
      venue: "Aréna St-Charles",
      activity: "Match DÉMO",
      group: "Junior DÉMO",
      status: "scheduled",
    },
  ],
};

export const PHONE_DEMO_ALIASES = {
  M13A: "M13 A DÉMO",
  JUNIOR: "Junior DÉMO",
} as const;

export const PHONE_DEMO_NOW = new Date("2099-10-03T16:00:00-04:00");
