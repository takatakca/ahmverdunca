import { useEffect } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

export function GlobalSearchShortcut() {
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      const isCommandK =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);

      if (!isSlash && !isCommandK) return;

      event.preventDefault();

      if (pathname === "/recherche") {
        const search = document.querySelector<HTMLInputElement>("[data-site-search]");
        search?.focus();
        search?.select();
        return;
      }

      void router.navigate({ to: "/recherche" });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pathname, router]);

  return null;
}
