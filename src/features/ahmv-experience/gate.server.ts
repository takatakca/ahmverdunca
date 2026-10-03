import { readAhmvExperienceSession } from "./session.server";

export function gateAhmvExperience(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== "/experience" && !url.pathname.startsWith("/experience/")) {
    return null;
  }

  if (process.env["AHMV_EXPERIENCE_ENABLED"] !== "true") {
    return new Response("Not found", {
      status: 404,
      headers: { "cache-control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  if (!readAhmvExperienceSession(request)) {
    const login = new URL("/api/ahmv/experience/login", url.origin);
    const response = Response.redirect(login, 303);
    response.headers.set("cache-control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return null;
}
