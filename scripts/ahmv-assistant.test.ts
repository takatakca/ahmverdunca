import { describe, expect, test } from "bun:test";
import { buildAssistantReply, findAssistantTeams } from "../src/lib/ahmv-assistant";

describe("AHMV assistant team matching", () => {
  test("finds exact M11 Coyotes", () => {
    const teams = findAssistantTeams("M11 Coyotes");
    expect(teams).toHaveLength(1);
    expect(teams[0]?.legacyScheduleTeamId).toBe("2025191400019495");
  });

  test("keeps the two published M11 Leafs distinct", () => {
    const teams = findAssistantTeams("M11 Leafs");
    expect(teams).toHaveLength(2);
    expect(new Set(teams.map((team) => team.legacyScheduleTeamId)).size).toBe(2);
  });

  test("routes Louves results to the official team source", () => {
    const reply = buildAssistantReply("résultats Louves", "fr");
    expect(reply.matchedTeamIds).toEqual(["2025191400035012"]);
    expect(reply.actions[0]?.kind).toBe("results");
    expect(reply.actions[0]?.href).toContain("teamId=2025191400035012");
  });

  test("returns bookmark intent for an exact team", () => {
    const reply = buildAssistantReply("ajoute M11 Coyotes à mes équipes", "fr");
    expect(reply.bookmarkTeamId).toBe("2025191400019495");
  });

  test("uses validated FAQ for registration guidance", () => {
    const reply = buildAssistantReply("comment inscrire mon enfant", "fr");
    expect(reply.text).toContain("Spordle");
    expect(reply.actions.some((action) => action.href === "/inscriptions")).toBe(true);
  });

  test("does not invent a missing M8 team", () => {
    const reply = buildAssistantReply("ouvre M8", "fr");
    expect(reply.matchedTeamIds).toHaveLength(0);
    expect(reply.actions.some((action) => action.href === "/equipes")).toBe(true);
  });

  test("supports Spanish schedule intent without inventing data", () => {
    const reply = buildAssistantReply("horario Coyotes M11", "es");
    expect(reply.matchedTeamIds).toEqual(["2025191400019495"]);
    expect(reply.actions[0]?.kind).toBe("schedule");
    expect(reply.actions[0]?.href).toBe("/equipes/m11?teamId=2025191400019495#match-center");
    expect(reply.actions[0]?.external).toBeUndefined();
  });
});


test("lists exact saved teams from family context", () => {
  const reply = buildAssistantReply("mes équipes", "fr", {
    selectedTeamIds: ["2025191400019495", "2025191400035012"],
  });
  expect(reply.matchedTeamIds).toHaveLength(2);
  expect(reply.actions).toHaveLength(2);
  expect(reply.actions.some((action) => action.href.includes("teamId=2025191400019495"))).toBe(true);
  expect(reply.actions.some((action) => action.href.includes("teamId=2025191400035012"))).toBe(true);
});

test("routes saved-team schedules to the integrated mini-sites", () => {
  const reply = buildAssistantReply("horaires de mes équipes", "fr", {
    selectedTeamIds: ["2025191400019495", "2025191400035012"],
  });
  expect(reply.actions.map((action) => action.kind)).toEqual(["schedule", "schedule"]);
  expect(reply.actions.every((action) => action.href.endsWith("#match-center"))).toBe(true);
  expect(reply.actions.every((action) => action.external === undefined)).toBe(true);
});

test("routes saved-team results to each official source", () => {
  const reply = buildAssistantReply("résultats de mes équipes", "fr", {
    selectedTeamIds: ["2025191400019495", "2025191400035012"],
  });
  expect(reply.actions.map((action) => action.kind)).toEqual(["results", "results"]);
  expect(reply.actions.every((action) => action.external === true)).toBe(true);
});

test("empty My Teams context never invents a family team", () => {
  const reply = buildAssistantReply("mis equipos", "es", { selectedTeamIds: [] });
  expect(reply.matchedTeamIds).toEqual([]);
  expect(reply.actions[0]?.href).toBe("/equipes");
});
