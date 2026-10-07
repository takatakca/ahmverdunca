type PreferenceStorage = "localStorage" | "sessionStorage";

// Non-sensitive UI preferences only. Keep them usable for this page when a
// browser blocks storage or its quota is exhausted; never retain SSR state.
const memory = {
  localStorage: new Map<string, string | null>(),
  sessionStorage: new Map<string, string | null>(),
};

export function readBrowserPreference(key: string, kind: PreferenceStorage = "localStorage") {
  if (typeof window === "undefined") return null;
  if (memory[kind].has(key)) return memory[kind].get(key) ?? null;
  try {
    return window[kind].getItem(key);
  } catch {
    return memory[kind].get(key) ?? null;
  }
}

export function writeBrowserPreference(
  key: string,
  value: string,
  kind: PreferenceStorage = "localStorage",
) {
  if (typeof window === "undefined") return;
  try {
    window[kind].setItem(key, value);
    memory[kind].delete(key);
  } catch {
    memory[kind].set(key, value);
    // Persistence is optional; the current page keeps the preference in memory.
  }
}

export function removeBrowserPreference(key: string, kind: PreferenceStorage = "localStorage") {
  if (typeof window === "undefined") return;
  try {
    window[kind].removeItem(key);
    memory[kind].delete(key);
  } catch {
    memory[kind].set(key, null);
    // A denied browser store must not interrupt navigation or preference reset.
  }
}
