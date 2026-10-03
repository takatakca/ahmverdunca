import {
  addAhmvFamilyChild,
  ensureAhmvFamilyHub,
  updateAhmvAutopilot,
} from "./family-hub.server";
import { requireLiveAhmvExperienceSession } from "./entitlement.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function booleanPatch(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const allowed = [
    "autoCalendar",
    "remindRsvp",
    "alertScheduleChanges",
    "recalculateDeparture",
    "notifyOtherCaregiver",
    "remindDocuments",
    "groupChildrenActivities",
  ] as const;

  const patch: Partial<Record<(typeof allowed)[number], boolean>> = {};
  for (const key of allowed) {
    if (key in input) {
      if (typeof input[key] !== "boolean") return null;
      patch[key] = input[key] as boolean;
    }
  }
  return patch;
}

export async function handleAhmvExperienceApi(
  request: Request,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/ahmv/experience/")) return null;
  if (
    url.pathname === "/api/ahmv/experience/login" ||
    url.pathname === "/api/ahmv/experience/callback" ||
    url.pathname === "/api/ahmv/experience/logout"
  ) {
    return null;
  }

  if (process.env["AHMV_EXPERIENCE_ENABLED"] !== "true") {
    return json({ ok: false }, 404);
  }

  const session = await requireLiveAhmvExperienceSession(request);
  if (!session) return json({ ok: false, message: "Unauthorized." }, 401);

  if (url.pathname === "/api/ahmv/experience/bootstrap" && request.method === "GET") {
    try {
      const hub = await ensureAhmvFamilyHub({
        identityId: session.identityId,
        displayName: session.displayName,
      });
      return json({
        ok: true,
        session: {
          displayName: session.displayName,
          planCode: session.planCode,
          expiresAt: new Date(session.exp).toISOString(),
        },
        hub,
      });
    } catch (error) {
      console.error("[AHMV experience bootstrap]", error);
      return json({ ok: false, message: "Family Hub is temporarily unavailable." }, 503);
    }
  }

  if (url.pathname === "/api/ahmv/experience/children" && request.method === "POST") {
    if (request.headers.get("origin") !== url.origin) {
      return json({ ok: false, message: "Forbidden." }, 403);
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, message: "Invalid JSON." }, 400);
    }

    const name =
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      typeof (body as Record<string, unknown>).displayName === "string"
        ? ((body as Record<string, unknown>).displayName as string).trim()
        : "";

    if (name.length < 2 || name.length > 80) {
      return json({ ok: false, message: "Child name must contain 2 to 80 characters." }, 400);
    }

    try {
      const child = await addAhmvFamilyChild(session.identityId, name);
      return json({ ok: true, child }, 201);
    } catch (error) {
      console.error("[AHMV family child]", error);
      return json({ ok: false, message: "Child could not be added." }, 503);
    }
  }

  if (url.pathname === "/api/ahmv/experience/autopilot" && request.method === "PATCH") {
    if (request.headers.get("origin") !== url.origin) {
      return json({ ok: false, message: "Forbidden." }, 403);
    }
    const declaredLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > 4096) {
      return json({ ok: false, message: "Request too large." }, 413);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, message: "Invalid JSON." }, 400);
    }
    const patch = booleanPatch(body);
    if (!patch || Object.keys(patch).length === 0) {
      return json({ ok: false, message: "Invalid Auto-Pilot settings." }, 400);
    }

    try {
      await updateAhmvAutopilot(session.identityId, patch);
      return json({ ok: true });
    } catch (error) {
      console.error("[AHMV Auto-Pilot]", error);
      return json({ ok: false, message: "Auto-Pilot settings could not be saved." }, 503);
    }
  }

  return json({ ok: false, message: "Not found." }, 404);
}
