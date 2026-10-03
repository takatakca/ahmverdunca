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
  });
});
