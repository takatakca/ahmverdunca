import { SITE } from "./site";

export function canonicalUrl(pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE.domain}${path}`;
}

export function canonicalLink(pathname: string) {
  return [{ rel: "canonical", href: canonicalUrl(pathname) }];
}
