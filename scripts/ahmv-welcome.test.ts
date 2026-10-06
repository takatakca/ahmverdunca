import { describe, expect, test } from "bun:test";
import {
  startWelcomeAutoOpen,
  welcomeEnabled,
  type WelcomeState,
} from "../src/lib/welcome-policy";

function welcomeHarness(initial: WelcomeState) {
  const pending = new Map<number, { callback: () => void; delay: number }>();
  let nextId = 0;
  let shown = 0;
  const state = { ...initial };
  const stop = startWelcomeAutoOpen(
    () => state,
    () => {
      shown++;
      state.sessionSeen = true;
    },
    {
      set: (callback, delay) => {
        const id = ++nextId;
        pending.set(id, { callback, delay });
        return id;
      },
      clear: (id) => { pending.delete(id); },
    },
  );
  return {
    state,
    pending,
    stop,
    shown: () => shown,
    tick() {
      const next = pending.entries().next().value;
      if (!next) throw new Error("No scheduled welcome attempt");
      pending.delete(next[0]);
      next[1].callback();
    },
  };
}

const eligible: WelcomeState = { hidden: false, sessionSeen: false, attentionBusy: false };

describe("Public AHMV welcome", () => {
  test("is available without provider configuration and permits an explicit opt-out", () => {
    expect(welcomeEnabled(undefined)).toBe(true);
    expect(welcomeEnabled("")).toBe(true);
    expect(welcomeEnabled("true")).toBe(true);
    expect(welcomeEnabled("false")).toBe(false);
  });

  test("opens the first-visit panel after 2.6 seconds", () => {
    const harness = welcomeHarness(eligible);
    expect([...harness.pending.values()][0]?.delay).toBe(2600);
    expect(harness.shown()).toBe(0);
    harness.tick();
    expect(harness.shown()).toBe(1);
    expect(harness.pending.size).toBe(0);
  });

  test("waits for another attention surface and opens once it clears", () => {
    const harness = welcomeHarness({ ...eligible, attentionBusy: true });
    harness.tick();
    expect(harness.shown()).toBe(0);
    expect([...harness.pending.values()][0]?.delay).toBe(1000);
    harness.tick();
    expect(harness.shown()).toBe(0);
    harness.state.attentionBusy = false;
    harness.tick();
    expect(harness.shown()).toBe(1);
    expect(harness.pending.size).toBe(0);
  });

  test("respects Ne plus afficher across later visits", () => {
    const harness = welcomeHarness({ ...eligible, hidden: true });
    harness.tick();
    expect(harness.shown()).toBe(0);
    expect(harness.pending.size).toBe(0);
  });

  test("does not repeat within a session that already saw the panel", () => {
    const harness = welcomeHarness({ ...eligible, sessionSeen: true });
    harness.tick();
    expect(harness.shown()).toBe(0);
    expect(harness.pending.size).toBe(0);
  });

  test("a manual opening during attention retry cancels the pending automatic offer", () => {
    const harness = welcomeHarness({ ...eligible, attentionBusy: true });
    harness.tick();
    harness.state.sessionSeen = true;
    harness.state.attentionBusy = false;
    harness.tick();
    expect(harness.shown()).toBe(0);
    expect(harness.pending.size).toBe(0);
  });

  test("unmount cancels retries and ignores a late timer callback", () => {
    const harness = welcomeHarness({ ...eligible, attentionBusy: true });
    harness.tick();
    const late = [...harness.pending.values()][0]?.callback;
    harness.stop();
    harness.state.attentionBusy = false;
    late?.();
    expect(harness.shown()).toBe(0);
    expect(harness.pending.size).toBe(0);
  });
});
