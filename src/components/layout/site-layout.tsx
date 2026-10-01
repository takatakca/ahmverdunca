import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { PreprodBanner } from "./preprod-banner";
import { MobileQuickNav } from "./mobile-quick-nav";
import { useI18n } from "@/lib/i18n";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { lang } = useI18n();

  return (
    <div className="flex min-h-screen flex-col pb-14 lg:pb-0">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sport focus:px-4 focus:py-2 focus:text-sport-foreground">
        {lang === "fr" ? "Aller au contenu" : "Skip to content"}
      </a>
      <PreprodBanner />
      <SiteHeader />
      <main id="contenu" className="flex-1">{children}</main>
      <SiteFooter />
      <MobileQuickNav />
    </div>
  );
}
