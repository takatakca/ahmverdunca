import { readBrowserPreference, writeBrowserPreference, removeBrowserPreference } from "./browser-preferences";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTeam } from "@/data/teams";
import { getPublicTeamById, type PublicTeamDirectoryEntry } from "@/data/team-directory";

const LEGACY_KEY = "ahmv-preferred-team";
const EXACT_TEAMS_KEY = "ahmv-selected-team-ids";
const EVENT = "ahmv-team-changed";

function readSelectedTeamIds() {
  try {
    const parsed = JSON.parse(readBrowserPreference(EXACT_TEAMS_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === "string")
      .filter((value, index, values) => values.indexOf(value) === index)
      .filter((value) => Boolean(getPublicTeamById(value)));
  } catch {
    return [];
  }
}

export function usePreferredTeam() {
  const [slug, setSlug] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      const stored = readBrowserPreference(LEGACY_KEY) ?? "";
      setSlug(getTeam(stored) ? stored : "");
      setSelectedTeamIds(readSelectedTeamIds());
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

    if (valid) writeBrowserPreference(LEGACY_KEY, valid);
    else removeBrowserPreference(LEGACY_KEY);

    setSlug(valid);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const saveSelectedTeamIds = useCallback((values: string[]) => {
    const valid = values
      .filter((value, index) => values.indexOf(value) === index)
      .filter((value) => Boolean(getPublicTeamById(value)));

    if (valid.length > 0) writeBrowserPreference(EXACT_TEAMS_KEY, JSON.stringify(valid));
    else removeBrowserPreference(EXACT_TEAMS_KEY);

    setSelectedTeamIds(valid);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggleSelectedTeam = useCallback((teamId: string) => {
    if (!getPublicTeamById(teamId)) return;
    const current = readSelectedTeamIds();
    const next = current.includes(teamId)
      ? current.filter((value) => value !== teamId)
      : [...current, teamId];
    saveSelectedTeamIds(next);
  }, [saveSelectedTeamIds]);

  const clearSelectedTeams = useCallback(() => saveSelectedTeamIds([]), [saveSelectedTeamIds]);

  const clearAllTeamPreferences = useCallback(() => {
    removeBrowserPreference(LEGACY_KEY);
    removeBrowserPreference(EXACT_TEAMS_KEY);
    setSlug("");
    setSelectedTeamIds([]);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const removeSelectedTeam = useCallback((teamId: string) => {
    if (!getPublicTeamById(teamId)) return;
    const current = readSelectedTeamIds();
    saveSelectedTeamIds(current.filter((value) => value !== teamId));
  }, [saveSelectedTeamIds]);

  const selectedTeams = useMemo(
    () => selectedTeamIds.map((teamId) => getPublicTeamById(teamId)).filter((team): team is PublicTeamDirectoryEntry => Boolean(team)),
    [selectedTeamIds],
  );

  return {
    preferredTeam: slug,
    savePreferredTeam: save,
    selectedTeamIds,
    selectedTeams,
    toggleSelectedTeam,
    clearSelectedTeams,
    clearAllTeamPreferences,
    removeSelectedTeam,
    isTeamSelected: (teamId: string) => selectedTeamIds.includes(teamId),
  };
}
