import { useEffect, useState } from "react";
import { ExternalLink, Facebook, Instagram, Newspaper, Radio } from "lucide-react";
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
      fr: "La passerelle de feed est prête mais n’est pas encore activée publiquement.",
      en: "The feed bridge is ready but is not yet publicly enabled.",
    },
    loading: { fr: "Connexion au feed de l’équipe…", en: "Connecting to the team feed…" },
    not_connected: {
      fr: "Aucun réseau social n’est encore connecté à cette équipe.",
      en: "No social account is connected to this team yet.",
    },
    subscription_required: {
      fr: "Les comptes peuvent être connectés, mais l’abonnement de diffusion GROUPE TAKATAK n’est pas actif.",
      en: "Accounts may be connected, but the GROUPE TAKATAK feed subscription is not active.",
    },
    connected: {
      fr: "La connexion est active. Aucune publication publique approuvée n’est disponible pour le moment.",
      en: "The connection is active. No approved public posts are currently available.",
    },
    active: {
      fr: "Publications publiques approuvées via GROUPE TAKATAK.",
      en: "Approved public posts delivered through GROUPE TAKATAK.",
    },
    unavailable: {
      fr: "Le feed est temporairement indisponible.",
      en: "The feed is temporarily unavailable.",
    },
    idle: { fr: "", en: "" },
  }[feed.status];

  return (
    <section id="social-equipe" className="scroll-mt-28 overflow-hidden border border-navy/12 bg-background">
      <div className="grid bg-competition text-white lg:grid-cols-[1fr_auto]">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Radio className="size-5 text-sport-foreground" aria-hidden />
            <p className="eyebrow text-sport-foreground">GROUPE TAKATAK Social</p>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.88] tracking-[-0.03em]">
            {lang === "fr" ? "Live feed de l’équipe" : "Team live feed"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62">{message[lang]}</p>
        </div>
        <div className="flex items-center border-t border-white/12 p-6 lg:border-l lg:border-t-0">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/38">
              {lang === "fr" ? "État" : "Status"}
            </p>
            <p className="mt-2 font-display text-xl font-extrabold uppercase text-sport-foreground">
              {feed.status.replaceAll("_", " ")}
            </p>
            <p className="mt-2 font-mono text-[9px] text-white/38">#{team.legacyScheduleTeamId.slice(-4)}</p>
          </div>
        </div>
      </div>

      {feed.items.length === 0 && (
        <div className="grid gap-px bg-navy/10 md:grid-cols-3">
          {[
            {
              platform: "Facebook",
              Icon: Facebook,
              media: OFFICIAL_MEDIA.practiceGroup,
              label: lang === "fr" ? "Fil Facebook prêt" : "Facebook feed ready",
              body: lang === "fr"
                ? "Les publications publiques approuvées de cette équipe pourront prendre cette place sans refaire le design."
                : "Approved public team posts can take over this space without redesigning the page.",
            },
            {
              platform: "Instagram",
              Icon: Instagram,
              media: OFFICIAL_MEDIA.practicePlayers,
              label: lang === "fr" ? "Galerie Instagram prête" : "Instagram gallery ready",
              body: lang === "fr"
                ? "Photos, reels et publications approuvées pourront s’intégrer ici quand le compte sera relié."
                : "Approved photos, reels and posts can appear here when the account is connected.",
            },
            {
              platform: lang === "fr" ? "Mini-blog" : "Mini-blog",
              Icon: Newspaper,
              media: OFFICIAL_MEDIA.practiceCoach,
              label: lang === "fr" ? "Journal d’équipe prêt" : "Team journal ready",
              body: lang === "fr"
                ? "Victoire, tournoi, changement d’horaire, bénévoles ou message du coach : la devanture est déjà prête."
                : "Win, tournament, schedule change, volunteers or a coach note: the storefront is already ready.",
            },
          ].map(({ platform, Icon, media, label, body }) => (
            <article key={platform} className="group relative min-h-[330px] overflow-hidden bg-competition text-white">
              <img
                src={media.url}
                alt={lang === "fr" ? media.alt.fr : media.alt.en}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover opacity-68 transition-transform duration-700 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,16,43,0.14)_0%,rgba(7,16,43,0.38)_40%,rgba(7,16,43,0.95)_100%)]" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="flex size-9 items-center justify-center border border-white/18 bg-navy/52 backdrop-blur">
                  <Icon className="size-4 text-sport-foreground" />
                </span>
                <span className="border border-white/18 bg-navy/52 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white/72 backdrop-blur">
                  DEMO
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="eyebrow text-sport-foreground">{platform}</p>
                <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.88]">{label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/62">{body}</p>
                <p className="mt-5 border-t border-white/12 pt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                  {lang === "fr" ? "Prêt à connecter" : "Ready to connect"}
                </p>
              </div>
            </article>
          ))}
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
