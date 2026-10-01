import { useCallback, useEffect, useState } from "react";
import { getTeam } from "@/data/teams";

const KEY = "ahmv-preferred-team";
const EVENT = "ahmv-team-changed";

export function usePreferredTeam() {
  const [slug, setSlug] = useState("");

  useEffect(() => {
    const update = () => {
      const stored = window.localStorage.getItem(KEY) ?? "";
      setSlug(getTeam(stored) ? stored : "");
    };

    update();
    window.addEventListener("storage", update);
    window.addEventListener(EVENT, update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(EVENT, update);
    };
  }, []);

  const save = useCallback((value: string) => {
    const valid = getTeam(value) ? value : "";

    if (valid) window.localStorage.setItem(KEY, valid);
    else window.localStorage.removeItem(KEY);

    setSlug(valid);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { preferredTeam: slug, savePreferredTeam: save };
}
