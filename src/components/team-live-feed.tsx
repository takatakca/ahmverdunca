import { useEffect, useState } from "react";
import { ExternalLink, Images, Newspaper, Radio } from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import { OFFICIAL_MEDIA } from "@/data/official-media";

type FeedItem = {
  id: string;
  platform: "facebook" | "instagram" | "x" | "tiktok" | "youtube";
  publishedAt: string;
  text: string;
  url: string;
  mediaUrl?: string;
};

type FeedState = {
  status:
    | "idle"
    | "loading"
    | "disabled"
    | "not_connected"
    | "subscription_required"
    | "connected"
    | "active"
    | "unavailable";
  items: FeedItem[];
};

export function TeamLiveFeed({
  team,
  lang,
}: {
  team: PublicTeamDirectoryEntry;
  lang: "fr" | "en";
}) {
  const publicBridgeEnabled = import.meta.env["VITE_TAKATAK_TEAM_FEED_ENABLED"] === "true";
  const [feed, setFeed] = useState<FeedState>({
    status: publicBridgeEnabled ? "loading" : "disabled",
    items: [],
  });

  useEffect(() => {
    if (!publicBridgeEnabled) return;
    const controller = new AbortController();

    fetch(`/api/ahmv/team-feed?teamId=${encodeURIComponent(team.legacyScheduleTeamId)}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({})) as Record<string, unknown>;
        const status = typeof body["status"] === "string" ? body["status"] : "unavailable";
        const items = Array.isArray(body["items"]) ? body["items"] as FeedItem[] : [];
        setFeed({
          status: ["disabled", "not_connected", "subscription_required", "connected", "active"].includes(status)
            ? status as FeedState["status"]
            : "unavailable",
          items,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFeed({ status: "unavailable", items: [] });
      });

    return () => controller.abort();
  }, [publicBridgeEnabled, team.legacyScheduleTeamId]);

  const message = {
    disabled: {
      fr: "Aucune publication sociale d’équipe n’est diffusée ici actuellement.",
      en: "No team social posts are currently published here.",
    },
    loading: { fr: "Chargement des publications approuvées…", en: "Loading approved team posts…" },
    not_connected: {
      fr: "Aucun compte social approuvé n’est relié publiquement à cette équipe.",
      en: "No approved social account is publicly linked to this team.",
    },
    subscription_required: {
      fr: "Aucune publication sociale approuvée n’est disponible publiquement pour cette équipe.",
      en: "No approved social posts are publicly available for this team.",
    },
    connected: {
      fr: "La connexion est active, mais aucune publication publique approuvée n’est disponible pour le moment.",
      en: "The connection is active, but no approved public posts are currently available.",
    },
    active: {
      fr: "Publications publiques approuvées pour cette équipe.",
      en: "Approved public posts for this team.",
    },
    unavailable: {
      fr: "Les publications sociales sont temporairement indisponibles.",
      en: "Social posts are temporarily unavailable.",
    },
    idle: { fr: "", en: "" },
  }[feed.status];

  return (
    <section id="social-equipe" className="scroll-mt-28 overflow-hidden border border-navy/12 bg-background">
      <div className="grid bg-competition text-white lg:grid-cols-[1fr_auto]">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Radio className="size-5 text-sport-foreground" aria-hidden />
            <p className="eyebrow text-sport-foreground">
              {lang === "fr" ? "Publications d’équipe" : "Team posts"}
            </p>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em]">
            {lang === "fr" ? "Nouvelles & réseaux" : "News & social"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62">{message[lang]}</p>
        </div>
        <div className="flex items-center border-t border-white/12 p-6 lg:border-l lg:border-t-0">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/38">
              {lang === "fr" ? "Équipe" : "Team"}
            </p>
            <p className="mt-2 font-display text-xl font-extrabold uppercase text-sport-foreground">{team.name}</p>
            <p className="mt-2 font-mono text-[9px] text-white/38">#{team.legacyScheduleTeamId.slice(-4)}</p>
          </div>
        </div>
      </div>

      {feed.items.length === 0 && (
        <div className="grid gap-px bg-navy/10 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[300px] overflow-hidden bg-competition text-white">
            <img
              src={OFFICIAL_MEDIA.practicePlayers.url}
              alt={lang === "fr" ? OFFICIAL_MEDIA.practicePlayers.alt.fr : OFFICIAL_MEDIA.practicePlayers.alt.en}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.12),rgba(7,16,43,0.94))]" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className="eyebrow text-sport-foreground">
                {lang === "fr" ? "Contenu AHMV vérifié" : "Verified AHMV content"}
              </p>
              <h3 className="mt-2 max-w-xl font-display text-3xl font-extrabold uppercase leading-[0.88]">
                {lang === "fr"
                  ? "Les vraies nouvelles restent accessibles maintenant."
                  : "Real association content remains available now."}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/62">
                {lang === "fr"
                  ? "En attendant une publication sociale propre à cette équipe, utilisez les nouvelles et les archives photo officielles de l’AHM Verdun."
                  : "Until this team has an approved social post, use AHM Verdun’s official news and photo archives."}
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-navy/10">
            <a
              href="/nouvelles"
              className="interactive-surface flex min-h-36 flex-col justify-between bg-background p-5 text-navy hover:bg-ice"
            >
              <Newspaper className="size-5 text-sport" />
              <div>
                <p className="font-display text-2xl font-extrabold uppercase">
                  {lang === "fr" ? "Nouvelles" : "News"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {lang === "fr" ? "Communications publiées par l’association." : "Association-published updates."}
                </p>
              </div>
            </a>
            <a
              href="/galerie"
              className="interactive-surface flex min-h-36 flex-col justify-between bg-background p-5 text-navy hover:bg-ice"
            >
              <Images className="size-5 text-sport" />
              <div>
                <p className="font-display text-2xl font-extrabold uppercase">
                  {lang === "fr" ? "Galerie" : "Gallery"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {lang === "fr" ? "Photos réelles et archives AHMV." : "Real AHMV photos and archives."}
                </p>
              </div>
            </a>
          </div>
        </div>
      )}

      {feed.items.length > 0 && (
        <div className="grid gap-px bg-navy/10 md:grid-cols-2 xl:grid-cols-3">
          {feed.items.map((item) => (
            <article key={item.id} className="flex min-h-64 flex-col bg-background">
              {item.mediaUrl && (
                <div className="relative aspect-[16/9] overflow-hidden bg-navy">
                  <img
                    src={item.mediaUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow text-sport">{item.platform}</p>
                  <time className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(item.publishedAt))}
                  </time>
                </div>
                {item.text && <p className="mt-4 text-sm leading-relaxed text-foreground">{item.text}</p>}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-control mt-auto flex min-h-10 items-center justify-between border-t border-navy/10 pt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport"
                >
                  {lang === "fr" ? "Voir la publication" : "View post"}
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
