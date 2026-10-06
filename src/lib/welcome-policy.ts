export const WELCOME_INITIAL_DELAY_MS = 2600;
export const WELCOME_RETRY_DELAY_MS = 1000;

/** Public navigation help has no provider dependency; an explicit false opts out. */
export function welcomeEnabled(value: string | undefined) {
  return value !== "false";
}

export interface WelcomeState {
  hidden: boolean;
  sessionSeen: boolean;
  attentionBusy: boolean;
}

export function automaticWelcomeDecision(state: WelcomeState) {
  if (state.hidden || state.sessionSeen) return "suppressed";
  return state.attentionBusy ? "retry" : "show";
}

/** Keep the first-visit offer pending while another surface owns the screen. */
export function startWelcomeAutoOpen(
  readState: () => WelcomeState,
  show: () => void,
  timers: {
    set: (callback: () => void, delay: number) => number;
    clear: (id: number) => void;
  },
) {
  let pending: number | undefined;
  let cancelled = false;
  const attempt = () => {
    if (cancelled) return;
    const decision = automaticWelcomeDecision(readState());
    if (decision === "retry") pending = timers.set(attempt, WELCOME_RETRY_DELAY_MS);
    if (decision === "show") show();
  };
  pending = timers.set(attempt, WELCOME_INITIAL_DELAY_MS);
  return () => {
    cancelled = true;
    if (pending !== undefined) timers.clear(pending);
  };
}
