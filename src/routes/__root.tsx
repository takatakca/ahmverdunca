import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../lib/i18n";
import { SiteLayout } from "../components/layout/site-layout";
import { EXTERNAL_LINKS, SITE } from "../lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="heading-hero text-navy">404</p>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable / Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée. / This page doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-navy-deep"
          >
            Accueil / Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Cette page n'a pas pu être chargée / This page couldn't be loaded
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur est survenue. Réessayez ou revenez à l'accueil. / Something went wrong. Try again or return home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-navy-deep"
          >
            Réessayer / Retry
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Accueil / Home
          </a>
        </div>
      </div>
    </div>
  );
}

const PUBLIC_INDEXING_ENABLED = import.meta.env["VITE_PUBLIC_INDEXING"] === "true";

const organizationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: SITE.name.fr,
  alternateName: SITE.name.en,
  url: SITE.domain,
  ...(!PUBLIC_INDEXING_ENABLED || SITE.phonePublic ? { telephone: SITE.phoneE164 } : {}),
  sport: "Ice Hockey",
  areaServed: "Verdun, Montréal, Québec, Canada",
  sameAs: [EXTERNAL_LINKS.facebook, EXTERNAL_LINKS.instagram],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "GROUPE TAKATAK" },
      {
        name: "robots",
        content: PUBLIC_INDEXING_ENABLED
          ? "index, follow, max-image-preview:large"
          : "noindex, nofollow",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "AHM Verdun" },
      { property: "og:locale", content: "fr_CA" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#111a33" },
      { name: "application-name", content: "AHM Verdun" },
      { name: "apple-mobile-web-app-title", content: "AHM Verdun" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <SiteLayout>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </SiteLayout>
      </I18nProvider>
    </QueryClientProvider>
  );
}
