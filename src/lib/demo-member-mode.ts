import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ahmv-demo-member-mode";
const EVENT_NAME = "ahmv:demo-member-mode";

export const DEMO_MEMBER_PREVIEW_ENABLED =
  import.meta.env["VITE_DEMO_MEMBER_PREVIEW_ENABLED"] === "true";

export type DemoMemberMode = "visitor" | "member";

function readMode(): DemoMemberMode {
  if (!DEMO_MEMBER_PREVIEW_ENABLED || typeof window === "undefined") return "visitor";
  return window.localStorage.getItem(STORAGE_KEY) === "member" ? "member" : "visitor";
}

export function useDemoMemberMode() {
  const [mode, setModeState] = useState<DemoMemberMode>("visitor");

  useEffect(() => {
    if (!DEMO_MEMBER_PREVIEW_ENABLED) {
      window.localStorage.removeItem(STORAGE_KEY);
      setModeState("visitor");
      return;
    }

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
    if (!DEMO_MEMBER_PREVIEW_ENABLED) {
      window.localStorage.removeItem(STORAGE_KEY);
      setModeState("visitor");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }, []);

  return {
    mode,
    isDemoMember: DEMO_MEMBER_PREVIEW_ENABLED && mode === "member",
    setMode,
  };
}
