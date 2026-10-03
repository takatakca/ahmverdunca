import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ahmv-demo-member-mode";
const EVENT_NAME = "ahmv:demo-member-mode";

export type DemoMemberMode = "visitor" | "member";

function readMode(): DemoMemberMode {
  if (typeof window === "undefined") return "visitor";
  return window.localStorage.getItem(STORAGE_KEY) === "member" ? "member" : "visitor";
}

export function useDemoMemberMode() {
  const [mode, setModeState] = useState<DemoMemberMode>("visitor");

  useEffect(() => {
    setModeState(readMode());

    const sync = () => setModeState(readMode());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMode = useCallback((next: DemoMemberMode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }, []);

  return {
    mode,
    isDemoMember: mode === "member",
    setMode,
  };
}
