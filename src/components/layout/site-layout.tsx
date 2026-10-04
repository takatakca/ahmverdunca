import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { MobileQuickNav } from "./mobile-quick-nav";
import { GlobalSearchShortcut } from "@/components/global-search-shortcut";
import { CommunicationsPreview } from "./communications-preview";
import { useI18n } from "@/lib/i18n";
import { SupportDevelopment } from "@/components/support-development";
import { AhmvAssistant } from "@/components/ahmv-assistant";
import { ParentQuickPanel } from "./parent-quick-panel";
import { InstallAppPrompt } from "./install-app-prompt";
import { GlobalPageCorrection } from "@/components/global-page-correction";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-sport focus:px-4 focus:py-2 focus:text-sport-foreground">
        {lang === "fr" ? "Aller au contenu" : "Skip to content"}
      </a>
      <GlobalSearchShortcut />
      <SiteHeader />
      <main id="contenu" className="min-w-0 flex-1 overflow-x-clip"><div key={pathname} className="page-enter min-w-0">{children}</div></main>
      <SiteFooter />
      <MobileQuickNav />
      <CommunicationsPreview />
      <SupportDevelopment />
      <AhmvAssistant />
      <ParentQuickPanel />
      <InstallAppPrompt />
      <GlobalPageCorrection />
    </div>
  );
}
