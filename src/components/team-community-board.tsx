import {
  ArrowRight,
  FileText,
  HandHeart,
  Mail,
  Newspaper,
  Users,
} from "lucide-react";
import type { PublicTeamDirectoryEntry } from "@/data/team-directory";
import {
  communityPostsForTeam,
  documentsForTeam,
  fundraisingCampaignsForTeam,
  volunteerNeedsForTeam,
} from "@/data/team-community";
import { SITE } from "@/lib/site";

export function TeamCommunityBoard({
  team,
  lang,
}: {
  team: PublicTeamDirectoryEntry;
  lang: "fr" | "en";
}) {
  const posts = communityPostsForTeam(team.legacyScheduleTeamId);
  const volunteerNeeds = volunteerNeedsForTeam(team.legacyScheduleTeamId);
  const campaigns = fundraisingCampaignsForTeam(team.legacyScheduleTeamId);
  const documents = documentsForTeam(team.legacyScheduleTeamId);

  const proposalLink = (kind: "news" | "volunteer" | "fundraising" | "document") => {
    const labels = {
      news: lang === "fr" ? "nouvelle d’équipe" : "team story",
      volunteer: lang === "fr" ? "besoin de bénévoles" : "volunteer need",
      fundraising: lang === "fr" ? "campagne de financement" : "fundraising campaign",
      document: lang === "fr" ? "document d’équipe" : "team document",
    };
    const subject = `AHMV — ${labels[kind]} — ${team.name} — ${team.legacyScheduleTeamId}`;
    const body = lang === "fr"
      ? `Bonjour,\n\nJe souhaite proposer une ${labels[kind]} pour cette équipe.\n\nÉquipe : ${team.name}\nNiveau : ${team.level}\nTeam ID : ${team.legacyScheduleTeamId}\n\nTitre :\nDescription :\nSource/lien :\nDate limite (si applicable) :\nBénéficiaire et objectif (si financement) :\n\nJe comprends que la publication sera révisée avant mise en ligne.\n`
      : `Hello,\n\nI would like to submit a ${labels[kind]} for this team.\n\nTeam: ${team.name}\nLevel: ${team.level}\nTeam ID: ${team.legacyScheduleTeamId}\n\nTitle:\nDescription:\nSource/link:\nDeadline (if applicable):\nBeneficiary and goal (if fundraising):\n\nI understand the submission will be reviewed before publication.\n`;
    return `mailto:${SITE.operationsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="overflow-hidden border border-white/12 bg-navy-deep text-white">
      <div className="grid bg-competition text-white lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-6 md:p-8">
          <p className="eyebrow text-sport-foreground">
            {lang === "fr" ? "Vie de l’équipe" : "Team community"}
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.86] tracking-[-0.035em] md:text-5xl">
            {lang === "fr" ? "Le mini-blog de l’équipe" : "The team mini-blog"}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/64">
            {lang === "fr"
              ? "Nouvelles, demandes de bénévoles, documents et collectes peuvent vivre ici. Chaque contribution passe par une révision avant publication."
              : "Stories, volunteer requests, documents and fundraising can live here. Every contribution is reviewed before publication."}
          </p>
        </div>
        <div className="flex items-center border-t border-white/12 p-6 lg:border-l lg:border-t-0 md:p-8">
          <a
            href={proposalLink("news")}
            className="premium-control flex min-h-12 w-full items-center justify-between bg-sport px-4 font-display text-sm font-bold uppercase tracking-[0.1em] text-sport-foreground"
          >
            <span className="flex items-center gap-2"><Mail className="size-4" />{lang === "fr" ? "Proposer une publication" : "Submit a post"}</span>
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      <div id="nouvelles-equipe-communautaire" className="grid gap-px bg-navy/10 lg:grid-cols-2">
        <div className="bg-competition p-5 text-white md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Journal" : "Journal"}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] text-white">
                {lang === "fr" ? "Publications d’équipe" : "Team posts"}
              </h3>
            </div>
            <Newspaper className="size-6 text-sport-foreground" aria-hidden />
          </div>
          {posts.length > 0 ? (
            <div className="mt-5 divide-y divide-navy/10 border-y border-white/10">
              {posts.map((post) => (
                <article key={post.id} className="py-4">
                  <time className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/52">
                    {post.publishedAt}
                  </time>
                  <h4 className="mt-2 font-display text-xl font-extrabold uppercase text-white">{post.title[lang]}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/52">{post.excerpt[lang]}</p>
                  {post.sourceUrl && (
                    <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] text-sport-foreground">
                      {lang === "fr" ? "Source" : "Source"} <ArrowRight className="ml-1 size-3.5" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 border-l-2 border-sport bg-white/[0.04] p-4">
              <p className="font-semibold text-white">{lang === "fr" ? "Aucune publication exacte pour le moment." : "No exact-team posts yet."}</p>
              <p className="mt-1 text-sm text-white/52">
                {lang === "fr" ? "Les nouvelles d’équipe apparaîtront ici uniquement après révision et publication." : "Team news appears here only after review and publication."}
              </p>
            </div>
          )}
        </div>

        <div id="benevolat-equipe" className="bg-competition p-5 text-white md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Coup de main" : "Lend a hand"}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] text-white">
                {lang === "fr" ? "Bénévoles recherchés" : "Volunteers needed"}
              </h3>
            </div>
            <Users className="size-6 text-sport-foreground" aria-hidden />
          </div>
          {volunteerNeeds.length > 0 ? (
            <div className="mt-5 divide-y divide-navy/10 border-y border-white/10">
              {volunteerNeeds.map((need) => (
                <article key={need.id} className="py-4">
                  <h4 className="font-display text-xl font-extrabold uppercase text-white">{need.title[lang]}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/52">{need.description[lang]}</p>
                  {need.neededUntil && <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-sport-foreground">{need.neededUntil}</p>}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-white/52">
              {lang === "fr" ? "Aucun besoin public actif. Un entraîneur ou gérant peut proposer un besoin après validation." : "No active public needs. A coach or manager can submit a need for review."}
            </p>
          )}
          <a href={proposalLink("volunteer")} className="premium-control mt-5 inline-flex min-h-10 items-center gap-2 border border-white/12 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white/72 hover:border-sport hover:text-white">
            <HandHeart className="size-3.5 text-sport-foreground" /> {lang === "fr" ? "Proposer un besoin" : "Submit a need"}
          </a>
        </div>

        <div id="collecte-equipe" className="bg-competition p-5 text-white md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Objectif équipe" : "Team goal"}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] text-white">
                {lang === "fr" ? "Collecte de fonds" : "Fundraising"}
              </h3>
            </div>
            <HandHeart className="size-6 text-sport-foreground" aria-hidden />
          </div>
          {campaigns.length > 0 ? (
            <div className="mt-5 space-y-3">
              {campaigns.map((campaign) => (
                <article key={campaign.id} className="border border-white/12 bg-white/[0.04] p-4">
                  <h4 className="font-display text-xl font-extrabold uppercase text-white">{campaign.title[lang]}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/52">{campaign.description[lang]}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-white/10 py-3 text-xs">
                    <div><dt className="text-white/52">{lang === "fr" ? "Bénéficiaire" : "Beneficiary"}</dt><dd className="mt-1 font-semibold text-white">{campaign.beneficiary}</dd></div>
                    <div><dt className="text-white/52">{lang === "fr" ? "Objectif" : "Goal"}</dt><dd className="mt-1 font-semibold text-white">{(campaign.goalCents / 100).toLocaleString(lang === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" })}</dd></div>
                  </dl>
                  <a href={campaign.paymentUrl} target="_blank" rel="noopener noreferrer" className="premium-control mt-4 flex min-h-11 items-center justify-between bg-navy px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    {lang === "fr" ? "Contribuer à l’équipe" : "Support the team"} <ArrowRight className="size-3.5 text-sport-foreground" />
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 border border-white/10 bg-white/[0.04] p-4">
              <p className="font-semibold text-white">{lang === "fr" ? "Aucune collecte active et vérifiée." : "No active verified fundraiser."}</p>
              <p className="mt-1 text-sm text-white/52">
                {lang === "fr" ? "Une campagne apparaîtra seulement lorsque le bénéficiaire, l’objectif et le lien de paiement auront été validés." : "A campaign appears only after its beneficiary, goal and payment link are verified."}
              </p>
            </div>
          )}
          <a href={proposalLink("fundraising")} className="premium-control mt-5 inline-flex min-h-10 items-center gap-2 border border-white/12 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white/72 hover:border-sport hover:text-white">
            {lang === "fr" ? "Proposer une campagne" : "Submit a campaign"} <ArrowRight className="size-3.5 text-sport-foreground" />
          </a>
        </div>

        <div id="documents-equipe" className="bg-competition p-5 text-white md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-sport-foreground">{lang === "fr" ? "Centre d’équipe" : "Team centre"}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-[0.9] text-white">
                {lang === "fr" ? "Documents" : "Documents"}
              </h3>
            </div>
            <FileText className="size-6 text-sport-foreground" aria-hidden />
          </div>
          {documents.length > 0 ? (
            <div className="mt-5 divide-y divide-navy/10 border-y border-white/10">
              {documents.map((document) => (
                <a key={document.id} href={document.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-navy hover:text-sport-foreground">
                  <span>{document.title[lang]}</span><ArrowRight className="size-4 shrink-0" />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-white/52">
              {lang === "fr" ? "Aucun document exact n’est publié pour cette équipe." : "No exact-team document is currently published."}
            </p>
          )}
          <a href={proposalLink("document")} className="premium-control mt-5 inline-flex min-h-10 items-center gap-2 border border-white/12 px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-white/72 hover:border-sport hover:text-white">
            {lang === "fr" ? "Proposer un document" : "Submit a document"} <ArrowRight className="size-3.5 text-sport-foreground" />
          </a>
        </div>
      </div>
    </section>
  );
}
