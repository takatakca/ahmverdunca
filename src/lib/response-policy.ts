export function robotsDirectiveForResponse({
  pathname,
  status,
  publicIndexingEnabled,
}: {
  pathname: string;
  status: number;
  publicIndexingEnabled: boolean;
}) {
  if (
    pathname === "/recherche" ||
    pathname === "/healthz" ||
    pathname === "/experience" ||
    pathname.startsWith("/experience/") ||
    status >= 400
  ) {
    return "noindex, follow";
  }
  return publicIndexingEnabled ? "index, follow" : "noindex, nofollow";
}

export function applyPublicResponsePolicy(
  response: Response,
  request: Request,
  publicIndexingEnabled: boolean,
) {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), payment=(), usb=()",
  );

  const pathname = new URL(request.url).pathname;
  if (pathname === "/experience" || pathname.startsWith("/experience/")) {
    headers.set("Cache-Control", "private, no-store");
  }

  if (contentType.includes("text/html")) {
    headers.set(
      "X-Robots-Tag",
      robotsDirectiveForResponse({
        pathname,
        status: response.status,
        publicIndexingEnabled,
      }),
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
