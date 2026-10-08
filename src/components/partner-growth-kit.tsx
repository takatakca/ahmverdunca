import { useState } from "react";
import { Check, Copy, Download, Link2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { trackMarketingEvent } from "@/lib/marketing";
import {
  buildCampaignUrl,
  CAMPAIGN_DESTINATIONS,
  CAMPAIGN_SOURCES,
  partnerBacklinkMarkup,
  publicCampaignKit,
  type CampaignDestination,
  type CampaignSource,
} from "@/lib/campaign-links";

export function PartnerGrowthKit() {
  const { lang } = useI18n();
  const fr = lang === "fr";
  const [destination, setDestination] = useState<CampaignDestination>("registration");
  const [source, setSource] = useState<CampaignSource>("partenaire");
  const [copied, setCopied] = useState<"campaign" | "backlink" | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const [sponsored, setSponsored] = useState(false);
  const campaignUrl = buildCampaignUrl(destination, source);
  const backlink = partnerBacklinkMarkup(destination, lang, sponsored);
  async function copy(value: string, kind: "campaign" | "backlink") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setCopyFailed(false);
      trackMarketingEvent("partner_link_copy", { section: "campaign-kit" });
    } catch {
      setCopied(null);
      setCopyFailed(true);
    }
  }
  function download() {
    const file = new Blob([JSON.stringify(publicCampaignKit(lang), null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ahmv-partenaires-${lang}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      id="partager"
      className="rounded-2xl border border-white/12 bg-competition p-5 text-white md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <Link2 className="size-6 text-sport-foreground" aria-hidden />
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase">
            {fr ? "Faire rayonner le hockey à Verdun" : "Share Verdun hockey"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            {fr
              ? "Les bons liens, prêts à partager sur votre site, dans votre infolettre ou sur vos réseaux sociaux."
              : "The right links, ready for your website, newsletter or social channels."}
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-xs font-semibold"
        >
          <Download className="size-4" />
          {fr ? "Télécharger le kit" : "Download the kit"}
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-xs font-semibold">
          {fr ? "À faire découvrir" : "What to share"}
          <select
            value={destination}
            onChange={(event) => {
              setDestination(event.target.value as CampaignDestination);
              setCopied(null);
            }}
            className="mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-navy-deep px-3 text-sm"
          >
            {Object.entries(CAMPAIGN_DESTINATIONS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold">
          {fr ? "Canal de partage" : "Sharing channel"}
          <select
            value={source}
            onChange={(event) => {
              setSource(event.target.value as CampaignSource);
              setCopied(null);
            }}
            className="mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-navy-deep px-3 text-sm"
          >
            {Object.keys(CAMPAIGN_SOURCES).map((key) => (
              <option key={key} value={key}>
                {
                  (
                    {
                      facebook: "Facebook",
                      instagram: "Instagram",
                      tiktok: "TikTok",
                      google: "Google Ads",
                      newsletter: fr ? "Infolettre" : "Newsletter",
                      partenaire: fr ? "Site partenaire" : "Partner website",
                    } as Record<string, string>
                  )[key]
                }
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {[
          {
            kind: "campaign" as const,
            title: fr ? "Lien de campagne" : "Campaign link",
            value: campaignUrl,
            help: fr
              ? "Ce lien identifie le canal de partage avec des paramètres de campagne publics."
              : "This link identifies the sharing channel with public campaign parameters.",
          },
          {
            kind: "backlink" as const,
            title: fr ? "Lien pour votre site" : "Link for your website",
            value: backlink,
            help: fr
              ? "À intégrer dans un article ou une page partenaire. Un placement rémunéré doit être identifié comme commandité."
              : "Add to an article or partner page. Paid placements must be identified as sponsored.",
          },
        ].map((item) => (
          <div key={item.kind} className="rounded-xl border border-white/12 bg-navy-deep p-4">
            <label className="text-sm font-semibold" htmlFor={`ahmv-kit-${item.kind}`}>
              {item.title}
            </label>
            <textarea
              id={`ahmv-kit-${item.kind}`}
              value={item.value}
              readOnly
              rows={3}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-competition p-3 font-mono text-xs leading-relaxed text-white/75"
            />
            <p className="mt-2 text-xs leading-relaxed text-white/55">{item.help}</p>
            {item.kind === "backlink" && (
              <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={sponsored}
                  onChange={(event) => {
                    setSponsored(event.target.checked);
                    setCopied(null);
                  }}
                  className="size-4 accent-sport"
                />
                {fr ? "Placement commandité" : "Sponsored placement"}
              </label>
            )}
            <button
              type="button"
              onClick={() => void copy(item.value, item.kind)}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-3 text-xs font-semibold"
            >
              {copied === item.kind ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied === item.kind ? (fr ? "Copié" : "Copied") : fr ? "Copier" : "Copy"}
            </button>
          </div>
        ))}
      </div>
      <p role="status" className="mt-3 text-xs text-white/60">
        {copyFailed
          ? fr
            ? "Sélectionnez le texte ci-dessus pour le copier."
            : "Select the text above to copy it."
          : copied
            ? fr
              ? "Lien copié."
              : "Link copied."
            : ""}
      </p>
    </section>
  );
}
