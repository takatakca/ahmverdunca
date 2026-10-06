import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ContentContributionButton, contributionsVisible } from "@/components/content-contribution-button";
import { useI18n } from "@/lib/i18n";

/** Gap kept between the sticky header and the floating page pen. */
const HEADER_GAP_PX = 12;
const FALLBACK_TOP_PX = 120;

export function GlobalPageCorrection() {
  if (!contributionsVisible()) return null;
  return <FloatingPageCorrection />;
}

function FloatingPageCorrection() {
  const { lang } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [top, setTop] = useState(FALLBACK_TOP_PX);

  // Stay pinned just below the sticky header, which compacts while scrolling.
  useEffect(() => {
    const header = document.querySelector("header");
    const update = () => {
      const bottom = header?.getBoundingClientRect().bottom ?? FALLBACK_TOP_PX - HEADER_GAP_PX;
      setTop(Math.max(HEADER_GAP_PX, Math.round(bottom) + HEADER_GAP_PX));
    };
    update();
    const observer = header ? new ResizeObserver(update) : undefined;
    if (header) observer?.observe(header);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed right-3 z-40 lg:right-4" style={{ top }}>
      <div className="flex items-center gap-2 border border-white/12 bg-navy-deep/90 p-1.5 text-white shadow-lg backdrop-blur">
        <span className="hidden pl-2 text-[8px] font-bold uppercase tracking-[0.12em] text-white/52 sm:inline">
          {lang === "fr" ? "Corriger cette page" : "Correct this page"}
        </span>
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
      </div>
    </div>
  );
}
