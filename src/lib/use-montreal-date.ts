import { useEffect, useState } from "react";
import { montrealDateKey } from "./montreal-date";

/** Refresh a long-open page after Montreal midnight or returning to the tab. */
export function useMontrealDate() {
  const [today, setToday] = useState(montrealDateKey);
  useEffect(() => {
    const refresh = () => setToday(montrealDateKey());
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return today;
}
