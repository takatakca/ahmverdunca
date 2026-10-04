import { useCallback, useEffect, useState } from "react";

export const DEMO_MEMBER_DEMO_MEMBER_STORAGE_KEY = "ahmv-demo-member-mode";
export const DEMO_MEMBER_DEMO_MEMBER_EVENT_NAME = "ahmv:demo-member-mode";

export const DEMO_MEMBER_PREVIEW_ENABLED =
  import.meta.env["VITE_DEMO_MEMBER_PREVIEW_ENABLED"] === "true";

export type DemoMemberMode = "visitor" | "member";

function readMode(): DemoMemberMode {
  if (!DEMO_MEMBER_PREVIEW_ENABLED || typeof window === "undefined") return "visitor";
  return window.localStorage.getItem(DEMO_MEMBER_STORAGE_KEY) === "member" ? "member" : "visitor";
}

export function useDemoMemberMode() {
  const [mode, setModeState] = useState<DemoMemberMode>("visitor");

  useEffect(() => {
    if (!DEMO_MEMBER_PREVIEW_ENABLED) {
      window.localStorage.removeItem(DEMO_MEMBER_STORAGE_KEY);
      setModeState("visitor");
      return;
    }

    setModeState(readMode());

    const sync = () => setModeState(readMode());
    window.addEventListener(DEMO_MEMBER_EVENT_NAME, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(DEMO_MEMBER_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setMode = useCallback((next: DemoMemberMode) => {
    if (!DEMO_MEMBER_PREVIEW_ENABLED) {
      window.localStorage.removeItem(DEMO_MEMBER_STORAGE_KEY);
      setModeState("visitor");
      return;
    }

    window.localStorage.setItem(DEMO_MEMBER_STORAGE_KEY, next);
    setModeState(next);
    window.dispatchEvent(new CustomEvent(DEMO_MEMBER_EVENT_NAME));
  }, []);

  return {
    mode,
    isDemoMember: DEMO_MEMBER_PREVIEW_ENABLED && mode === "member",
    setMode,
  };
}
