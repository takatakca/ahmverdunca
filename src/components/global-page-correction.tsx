import { useRouterState } from "@tanstack/react-router";
import { ContentContributionButton } from "@/components/content-contribution-button";
import { useI18n } from "@/lib/i18n";

export function GlobalPageCorrection() {
  const { lang } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="fixed bottom-[5.25rem] left-3 z-40 lg:bottom-4 lg:left-4">
      <div className="flex items-center gap-2 border border-white/12 bg-navy-deep/90 p-1.5 text-white shadow-lg backdrop-blur">
        <ContentContributionButton
          resourceType="page"
          resourceKey={`page:${pathname}`}
          title={pathname}
          snapshot={{ pathname }}
          fields={[
            {
              key: "notes",
              label: {
                fr: "Information à corriger sur cette page",
                en: "Information to correct on this page",
              },
              kind: "textarea",
              current: "",
              placeholder: {
                fr: "Décrivez l’information, l’image ou le lien qui devrait être corrigé.",
                en: "Describe the information, image or link that should be corrected.",
              },
            },
          ]}
          appearance="pencil"
        />
        <span className="hidden pr-2 text-[8px] font-bold uppercase tracking-[0.12em] text-white/52 sm:inline">
          {lang === "fr" ? "Corriger cette page" : "Correct this page"}
        </span>
      </div>
    </div>
  );
}
