import { searchAhmvKnowledge } from "@/lib/ahmv-knowledge";
import {
  PUBLIC_TEAM_DIRECTORY,
  getPublicTeamById,
  legacyTeamScheduleUrl,
  officialTeamResultsUrl,
  publicTeamHubUrl,
  type PublicTeamDirectoryEntry,
} from "@/data/team-directory";
import type { AssistantLanguageCode } from "@/lib/assistant-language";
import { assistantUiLanguage } from "@/lib/assistant-language";

export type AssistantActionKind = "team" | "schedule" | "results" | "page" | "faq";

export interface AssistantAction {
  label: string;
  href: string;
  kind: AssistantActionKind;
  external?: boolean;
}

export interface AssistantReply {
  text: string;
  actions: AssistantAction[];
  bookmarkTeamId?: string;
  matchedTeamIds: string[];
}

export interface AssistantContext {
  selectedTeamIds?: readonly string[];
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_/]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsAny(value: string, words: readonly string[]) {
  return words.some((word) => value.includes(normalize(word)));
}

const INTENTS = {
  schedule: ["horaire", "horaires", "calendrier", "schedule", "calendar", "horario", "calendario", "horario", "orario", "orè", "agenda"],
  results: ["resultat", "resultats", "score", "scores", "classement", "results", "result", "standings", "resultado", "resultados", "clasificacion", "classifica", "rezilta"],
  arenas: ["arena", "arena", "arene", "patinoire", "rink", "pista", "aren"],
  registration: ["inscription", "inscrire", "registration", "register", "registro", "inscribir", "inscricao", "iscrizione", "enskripsyon"],
  news: ["nouvelle", "nouvelles", "news", "noticia", "noticias", "novita"],
  teams: ["equipe", "equipes", "team", "teams", "equipo", "equipos", "squadra", "ekip"],
  myTeams: [
    "mes equipes",
    "my teams",
    "mis equipos",
    "minhas equipes",
    "le mie squadre",
    "ekip mwen",
  ],
  bookmark: [
    "ajoute",
    "ajouter",
    "favori",
    "favoris",
    "bookmark",
    "favorite",
    "favourite",
    "add to my teams",
    "favorito",
    "guardar",
    "adicionar",
    "preferiti",
  ],
} as const;

const COMMON_TEAM_WORDS = new Set(["verdun", "hockey", "sur", "mesure", "team", "equipe"]);

function teamScore(query: string, team: PublicTeamDirectoryEntry) {
  const q = normalize(query);
  const teamName = normalize(team.name);
  const category = normalize(team.categorySlug);
  const level = normalize(team.level);
  const last4 = team.legacyScheduleTeamId.slice(-4);

  let score = 0;
  if (q.includes(team.legacyScheduleTeamId) || q.includes(last4)) score += 20;
  if (q.includes(category)) score += 8;
  if (level.length > 1 && q.includes(level)) score += 3;

  const teamTokens = teamName.split(" ").filter((token) => token.length > 2 && !COMMON_TEAM_WORDS.has(token));
  for (const token of teamTokens) {
    if (q.includes(token)) score += 6;
  }

  if (q.includes(teamName)) score += 12;
  return score;
}

export function findAssistantTeams(query: string) {
  return PUBLIC_TEAM_DIRECTORY
    .map((team) => ({ team, score: teamScore(query, team) }))
    .filter((entry) => entry.score >= 6)
    .sort((a, b) => b.score - a.score || a.team.name.localeCompare(b.team.name))
    .filter((entry, index, values) => index === 0 || entry.score >= values[0]!.score - 2)
    .map((entry) => entry.team);
}

function copy(language: AssistantLanguageCode) {
  const ui = assistantUiLanguage(language);
  if (ui === "es") {
    return {
      teamFound: "Encontré este equipo publicado. Puedo abrir su mini-sitio, horario o resultados oficiales.",
      teamsFound: "Encontré varios equipos posibles. Elige el correcto para evitar abrir el equipo equivocado.",
      added: "Listo. Añadí este equipo a «Mis equipos» en este dispositivo.",
      schedule: "Aquí está el acceso al horario oficial.",
      results: "Aquí está el acceso a resultados y clasificación oficiales.",
      arenas: "Puedo llevarte a los arenas y rutas.",
      registration: "Las inscripciones oficiales pasan por la sección de inscripción AHMV/Spordle.",
      news: "Aquí están las noticias de AHM Verdun.",
      help: "Puedo encontrar un equipo, horario, resultado, arena, inscripción o añadir un equipo a «Mis equipos». Prueba «M11 Coyotes» o «resultados Louves».",
      faq: "Encontré una respuesta validada por AHMV:",
      openTeam: "Abrir equipo",
      openSchedule: "Horario",
      openResults: "Resultados",
      openPage: "Abrir",
      source: "Ver fuente",
      myTeams: "Estos son tus equipos guardados en este dispositivo.",
      noMyTeams: "Todavía no has guardado ningún equipo. Abre un mini-sitio y pulsa «Añadir a Mis equipos».",
    };
  }
  if (ui === "en") {
    return {
      teamFound: "I found this published team. I can open its mini-site, official schedule or official results.",
      teamsFound: "I found several possible teams. Choose the right one so I do not open the wrong team.",
      added: "Done. I added this team to “My teams” on this device.",
      schedule: "Here is the official schedule access.",
      results: "Here is the official results and standings access.",
      arenas: "I can take you to arenas and directions.",
      registration: "Official registration goes through the AHMV/Spordle registration section.",
      news: "Here are AHM Verdun news.",
      help: "I can find a team, schedule, result, arena, registration or add a team to “My teams”. Try “M11 Coyotes” or “Louves results”.",
      faq: "I found a validated AHMV answer:",
      openTeam: "Open team",
      openSchedule: "Schedule",
      openResults: "Results",
      openPage: "Open",
      source: "View source",
      myTeams: "These are your teams saved on this device.",
      noMyTeams: "You have not saved a team yet. Open a team mini-site and choose “Add to My teams”.",
    };
  }
  return {
    teamFound: "J’ai trouvé cette équipe publiée. Je peux ouvrir son mini-site, son horaire ou ses résultats officiels.",
    teamsFound: "J’ai trouvé plusieurs équipes possibles. Choisissez la bonne pour éviter d’ouvrir la mauvaise équipe.",
    added: "C’est fait. J’ai ajouté cette équipe à « Mes équipes » sur cet appareil.",
    schedule: "Voici l’accès à l’horaire officiel.",
    results: "Voici l’accès aux résultats et au classement officiels.",
    arenas: "Je peux vous amener aux arénas et aux itinéraires.",
    registration: "Les inscriptions officielles passent par la section AHMV/Spordle.",
    news: "Voici les nouvelles de l’AHM Verdun.",
    help: "Je peux trouver une équipe, un horaire, un résultat, un aréna, une inscription ou ajouter une équipe à « Mes équipes ». Essayez « M11 Coyotes » ou « résultats Louves ».",
    faq: "J’ai trouvé une réponse AHMV validée :",
    openTeam: "Ouvrir l’équipe",
    openSchedule: "Horaire",
    openResults: "Résultats",
    openPage: "Ouvrir",
    source: "Voir la source",
    myTeams: "Voici les équipes enregistrées sur cet appareil.",
    noMyTeams: "Vous n’avez encore enregistré aucune équipe. Ouvrez un mini-site puis choisissez « Ajouter à mes équipes ».",
  };
}

function teamActions(team: PublicTeamDirectoryEntry, language: AssistantLanguageCode): AssistantAction[] {
  const c = copy(language);
  return [
    { label: c.openTeam, href: publicTeamHubUrl(team), kind: "team" },
    { label: c.openSchedule, href: legacyTeamScheduleUrl(team), kind: "schedule", external: true },
    { label: c.openResults, href: officialTeamResultsUrl(team), kind: "results", external: true },
  ];
}

function bestValidatedFaq(query: string) {
  return searchAhmvKnowledge(query, { kinds: ["faq"], limit: 1 })[0];
}

export function buildAssistantReply(
  query: string,
  language: AssistantLanguageCode = "fr",
  context: AssistantContext = {},
): AssistantReply {
  const q = normalize(query);
  const c = copy(language);
  const teams = findAssistantTeams(query);
  const wantsBookmark = containsAny(q, INTENTS.bookmark);
  const wantsSchedule = containsAny(q, INTENTS.schedule);
  const wantsResults = containsAny(q, INTENTS.results);

  if (teams.length === 1) {
    const team = teams[0]!;
    const bookmarkTeamId = wantsBookmark ? team.legacyScheduleTeamId : undefined;
    return {
      text: wantsBookmark ? c.added : wantsResults ? c.results : wantsSchedule ? c.schedule : c.teamFound,
      actions: wantsResults
        ? [{ label: c.openResults, href: officialTeamResultsUrl(team), kind: "results", external: true }, { label: c.openTeam, href: publicTeamHubUrl(team), kind: "team" }]
        : wantsSchedule
          ? [{ label: c.openSchedule, href: legacyTeamScheduleUrl(team), kind: "schedule", external: true }, { label: c.openTeam, href: publicTeamHubUrl(team), kind: "team" }]
          : teamActions(team, language),
      ...(bookmarkTeamId ? { bookmarkTeamId } : {}),
      matchedTeamIds: [team.legacyScheduleTeamId],
    };
  }

  if (teams.length > 1) {
    return {
      text: c.teamsFound,
      actions: teams.slice(0, 8).map((team) => ({
        label: `${team.categorySlug.toUpperCase()} · ${team.name} · ${team.level} · #${team.legacyScheduleTeamId.slice(-4)}`,
        href: publicTeamHubUrl(team),
        kind: "team" as const,
      })),
      matchedTeamIds: teams.map((team) => team.legacyScheduleTeamId),
    };
  }

  if (containsAny(q, INTENTS.myTeams)) {
    const selectedTeams = (context.selectedTeamIds ?? [])
      .map((teamId) => getPublicTeamById(teamId))
      .filter((team): team is PublicTeamDirectoryEntry => Boolean(team));

    if (selectedTeams.length === 0) {
      return {
        text: c.noMyTeams,
        actions: [{ label: c.openPage, href: "/equipes", kind: "page" }],
        matchedTeamIds: [],
      };
    }

    return {
      text: c.myTeams,
      actions: selectedTeams.slice(0, 8).map((team) => ({
        label: `${team.categorySlug.toUpperCase()} · ${team.name} · ${team.level}`,
        href: wantsResults
          ? officialTeamResultsUrl(team)
          : wantsSchedule
            ? legacyTeamScheduleUrl(team)
            : publicTeamHubUrl(team),
        kind: wantsResults ? "results" as const : wantsSchedule ? "schedule" as const : "team" as const,
        ...(wantsResults || wantsSchedule ? { external: true } : {}),
      })),
      matchedTeamIds: selectedTeams.map((team) => team.legacyScheduleTeamId),
    };
  }

  const faq = bestValidatedFaq(query);
  if (faq) {
    const answerLanguage = assistantUiLanguage(language) === "fr" ? "fr" : "en";
    return {
      text: `${c.faq} ${faq.answer[answerLanguage]}`,
      actions: [{ label: c.source, href: faq.sourcePath, kind: "faq" }],
      matchedTeamIds: [],
    };
  }

  if (containsAny(q, INTENTS.arenas)) {
    return { text: c.arenas, actions: [{ label: c.openPage, href: "/arenas", kind: "page" }], matchedTeamIds: [] };
  }
  if (containsAny(q, INTENTS.registration)) {
    return { text: c.registration, actions: [{ label: c.openPage, href: "/inscriptions", kind: "page" }], matchedTeamIds: [] };
  }
  if (containsAny(q, INTENTS.news)) {
    return { text: c.news, actions: [{ label: c.openPage, href: "/nouvelles", kind: "page" }], matchedTeamIds: [] };
  }
  if (wantsSchedule) {
    return { text: c.schedule, actions: [{ label: c.openSchedule, href: "/horaires", kind: "schedule" }], matchedTeamIds: [] };
  }
  if (wantsResults) {
    return { text: c.results, actions: [{ label: c.openResults, href: "/equipes#resultats", kind: "results" }], matchedTeamIds: [] };
  }
  if (containsAny(q, INTENTS.teams) || /\bm\s*\d{1,2}\b/.test(q)) {
    return { text: c.help, actions: [{ label: c.openPage, href: "/equipes", kind: "page" }], matchedTeamIds: [] };
  }

  return {
    text: c.help,
    actions: [
      { label: c.openPage, href: "/recherche", kind: "page" },
      { label: c.openSchedule, href: "/horaires", kind: "schedule" },
    ],
    matchedTeamIds: [],
  };
}
