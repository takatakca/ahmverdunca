import test from "node:test";
import assert from "node:assert/strict";
import { searchAhmvKnowledge } from "../src/lib/ahmv-knowledge.ts";

test("validated registration knowledge is searchable", () => {
  const hits = searchAhmvKnowledge("comment inscrire mon enfant", { kinds: ["faq"], limit: 3 });
  assert.equal(hits[0]?.id, "faq:f1");
  assert.match(hits[0]?.answer.fr ?? "", /Spordle/);
  assert.equal(hits[0]?.sourcePath, "/inscriptions");
});

test("unvalidated FAQ entries never enter the shared knowledge base", () => {
  const hits = searchAhmvKnowledge("quelle catégorie âge enfant", { kinds: ["faq"], limit: 8 });
  assert.equal(hits.some((hit) => hit.id === "faq:f8"), false);
});

test("arena knowledge exposes verified practical facts and canonical page", () => {
  const hits = searchAhmvKnowledge("Auditorium Verdun stationnement accessibilité", { kinds: ["arena"], limit: 2 });
  assert.equal(hits[0]?.id, "arena:auditorium-de-verdun");
  assert.match(hits[0]?.answer.fr ?? "", /4110/);
  assert.match(hits[0]?.answer.fr ?? "", /Stationnement payant/);
  assert.equal(hits[0]?.sourcePath, "/arenas/auditorium-de-verdun");
});

test("empty or vague input does not manufacture an answer", () => {
  assert.deepEqual(searchAhmvKnowledge("quoi"), []);
});
