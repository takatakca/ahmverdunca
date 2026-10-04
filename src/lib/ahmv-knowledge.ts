import { ARENAS } from "@/data/arenas";
import { FAQ } from "@/data/faq";
import type { Localized } from "@/lib/i18n";

export type AhmvKnowledgeKind = "faq" | "arena";

export interface AhmvKnowledgeHit {
  id: string;
  kind: AhmvKnowledgeKind;
  title: Localized;
  answer: Localized;
  sourcePath: string;
  score: number;
}

type KnowledgeSearchOptions = {
  limit?: number;
  kinds?: readonly AhmvKnowledgeKind[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr-CA")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "avec", "dans", "pour", "quoi", "comment", "quel", "quelle", "quels", "quelles",
  "the", "with", "from", "what", "where", "when", "how", "which", "and",
]);

function queryTokens(query: string) {
  return normalize(query)
    .split(" ")
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function localizedList(items: readonly Localized[] | undefined, lang: keyof Localized) {
  return items?.map((item) => item[lang]).filter(Boolean) ?? [];
}

function arenaAnswer(arena: (typeof ARENAS)[number], lang: keyof Localized) {
  const parts: string[] = [];
  if (arena.description) parts.push(arena.description[lang]);
  parts.push(arena.address);
  if (arena.phone) {
    parts.push(lang === "fr"
      ? `Téléphone : ${arena.phone}${arena.phoneExtension ? ` poste ${arena.phoneExtension}` : ""}.`
      : `Phone: ${arena.phone}${arena.phoneExtension ? ` ext. ${arena.phoneExtension}` : ""}.`);
  }
  if (arena.parking?.details) parts.push(arena.parking.details[lang]);
  const access = localizedList(arena.accessibility, lang).slice(0, 4);
  if (access.length) {
    parts.push((lang === "fr" ? "Accessibilité : " : "Accessibility: ") + access.join("; ") + ".");
  }
  const amenities = localizedList(arena.amenities, lang).slice(0, 5);
  if (amenities.length) {
    parts.push((lang === "fr" ? "Services : " : "Amenities: ") + amenities.join("; ") + ".");
  }
  if (arena.publicStatus?.note) parts.push(arena.publicStatus.note[lang]);
  return parts.join(" ");
}

function entries() {
  const faqEntries = FAQ
    .filter((item) => item.validated)
    .map((item) => ({
      id: `faq:${item.id}`,
      kind: "faq" as const,
      title: item.question,
      answer: item.answer,
      sourcePath: item.sourcePath ?? "/faq",
      searchText: normalize([
        item.topic,
        item.question.fr,
        item.question.en,
        item.answer.fr,
        item.answer.en,
      ].join(" ")),
    }));

  const arenaEntries = ARENAS.map((arena) => ({
    id: `arena:${arena.slug}`,
    kind: "arena" as const,
    title: { fr: arena.name, en: arena.name },
    answer: {
      fr: arenaAnswer(arena, "fr"),
      en: arenaAnswer(arena, "en"),
    },
    sourcePath: `/arenas/${arena.slug}`,
    searchText: normalize([
      arena.name,
      arena.slug,
      arena.borough.fr,
      arena.borough.en,
      arena.address,
      arena.description?.fr,
      arena.description?.en,
      arena.parking?.details?.fr,
      arena.parking?.details?.en,
      ...localizedList(arena.activities, "fr"),
      ...localizedList(arena.activities, "en"),
      ...localizedList(arena.amenities, "fr"),
      ...localizedList(arena.amenities, "en"),
      ...localizedList(arena.accessibility, "fr"),
      ...localizedList(arena.accessibility, "en"),
    ].filter(Boolean).join(" ")),
  }));

  return [...faqEntries, ...arenaEntries];
}

export function searchAhmvKnowledge(
  query: string,
  options: KnowledgeSearchOptions = {},
): AhmvKnowledgeHit[] {
  const normalizedQuery = normalize(query);
  const tokens = queryTokens(query);
  if (!normalizedQuery || tokens.length === 0) return [];

  const allowedKinds = options.kinds ? new Set(options.kinds) : undefined;
  const limit = Math.max(1, Math.min(8, options.limit ?? 5));

  return entries()
    .filter((entry) => !allowedKinds || allowedKinds.has(entry.kind))
    .map((entry) => {
      let score = 0;
      if (entry.searchText.includes(normalizedQuery)) score += 12;
      for (const token of tokens) {
        if (entry.searchText.includes(token)) score += token.length >= 6 ? 4 : 2;
        if (normalize(entry.title.fr).includes(token) || normalize(entry.title.en).includes(token)) score += 3;
      }
      return { ...entry, score };
    })
    .filter((entry) => entry.score >= 4)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map(({ searchText: _searchText, ...entry }) => entry);
}
