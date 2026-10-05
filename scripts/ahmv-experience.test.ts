import test from "node:test";
import assert from "node:assert/strict";

import {
  AHMV_EXPERIENCE_COOKIE,
  ahmvExperienceClearCookie,
  ahmvExperienceSetCookie,
  decodeAhmvExperienceSession,
  encodeAhmvExperienceSession,
  readAhmvExperienceSession,
} from "../src/features/ahmv-experience/session.server.ts";
import {
  requireLiveAhmvExperienceSession,
  verifyAhmvEntitlementLive,
} from "../src/features/ahmv-experience/entitlement.server.ts";
import { handleAhmvExperienceAuth } from "../src/features/ahmv-experience/auth-handler.server.ts";
import { gateAhmvExperience } from "../src/features/ahmv-experience/gate.server.ts";

const SESSION_SECRET = "test-session-secret-that-is-longer-than-thirty-two-characters";
const SERVICE_TOKEN = "test-service-token-that-is-longer-than-thirty-two-characters";

type EnvPatch = Record<string, string | undefined>;

async function withEnv<T>(patch: EnvPatch, run: () => Promise<T> | T): Promise<T> {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(patch)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    return await run();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function withFetch<T>(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> | Response,
  run: () => Promise<T> | T,
): Promise<T> {
  const previous = globalThis.fetch;
  globalThis.fetch = handler as typeof fetch;
  try {
    return await run();
  } finally {
    globalThis.fetch = previous;
  }
}

function sessionInput(overrides: Partial<{
  identityId: string;
  displayName: string | null;
  product: "ahmv";
  entitlement: "ahmv_access";
  planCode: string | null;
  exp: number;
}> = {}) {
  return {
    identityId: "identity-123",
    displayName: "Parent Test",
    product: "ahmv" as const,
    entitlement: "ahmv_access" as const,
    planCode: "parent_essential",
    exp: Date.now() + 60_000,
    ...overrides,
  };
}

function cookieHeader() {
  return ahmvExperienceSetCookie(sessionInput()).split(";")[0]!;
}

const experienceEnv = {
  AHMV_EXPERIENCE_ENABLED: "true",
  AHMV_EXPERIENCE_SESSION_SECRET: SESSION_SECRET,
  TAKATAK_AHMV_SERVICE_TOKEN: SERVICE_TOKEN,
  TAKATAK_AHMV_LAUNCH_URL: "https://takatak.ca/api/experiences/ahmv/launch",
  TAKATAK_AHMV_EXCHANGE_URL: "https://takatak.ca/api/experiences/ahmv/exchange",
  TAKATAK_AHMV_INTROSPECT_URL: "https://takatak.ca/api/experiences/ahmv/introspect",
};

test("AHMV Family session is signed, host-only, secure and expires fail-closed", async () => {
  await withEnv({ AHMV_EXPERIENCE_SESSION_SECRET: SESSION_SECRET }, () => {
    const encoded = encodeAhmvExperienceSession(sessionInput());
    const decoded = decodeAhmvExperienceSession(encoded);
    assert.equal(decoded?.identityId, "identity-123");
    assert.equal(decoded?.product, "ahmv");
    assert.equal(decoded?.entitlement, "ahmv_access");

    const [payload, signature] = encoded.split(".");
    assert.ok(payload && signature);
    assert.equal(decodeAhmvExperienceSession(`${payload}x.${signature}`), null);
    assert.equal(
      decodeAhmvExperienceSession(
        encodeAhmvExperienceSession(sessionInput({ exp: Date.now() - 1 })),
      ),
      null,
    );

    const setCookie = ahmvExperienceSetCookie(sessionInput());
    assert.match(setCookie, new RegExp(`^${AHMV_EXPERIENCE_COOKIE}=`));
    assert.match(setCookie, /Path=\//);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Secure/);
    assert.match(setCookie, /SameSite=Lax/);
    assert.doesNotMatch(setCookie, /Domain=/i);

    const cleared = ahmvExperienceClearCookie();
    assert.match(cleared, /Max-Age=0/);
    assert.match(cleared, /HttpOnly/);
    assert.match(cleared, /Secure/);
  });
});

test("AHMV Family cookie reader rejects tampering and accepts a valid signed cookie", async () => {
  await withEnv({ AHMV_EXPERIENCE_SESSION_SECRET: SESSION_SECRET }, () => {
    const validCookie = cookieHeader();
    const validRequest = new Request("https://ahmverdun.ca/experience", {
      headers: { cookie: validCookie },
    });
    assert.equal(readAhmvExperienceSession(validRequest)?.identityId, "identity-123");

    const tamperedRequest = new Request("https://ahmverdun.ca/experience", {
      headers: { cookie: `${validCookie}x` },
    });
    assert.equal(readAhmvExperienceSession(tamperedRequest), null);
  });
});

test("live entitlement introspection grants, revokes and restores access without trusting the cookie alone", async () => {
  await withEnv(experienceEnv, async () => {
    const signed = cookieHeader();
    const request = new Request("https://ahmverdun.ca/experience", {
      headers: { cookie: signed },
    });

    let active = true;
    await withFetch(async (_input, init) => {
      assert.equal(init?.method, "POST");
      assert.equal((init?.headers as Record<string, string>).authorization, `Bearer ${SERVICE_TOKEN}`);
      const body = JSON.parse(String(init?.body)) as { identityId?: string };
      assert.equal(body.identityId, "identity-123");
      return Response.json({
        ok: true,
        access: {
          active,
          product: "ahmv",
          entitlement: "ahmv_access",
          planCode: "parent_essential",
        },
      });
    }, async () => {
      assert.equal((await requireLiveAhmvExperienceSession(request))?.identityId, "identity-123");

      active = false;
      assert.equal(await requireLiveAhmvExperienceSession(request), null);

      active = true;
      assert.equal((await requireLiveAhmvExperienceSession(request))?.identityId, "identity-123");
    });
  });
});

test("live entitlement verification fails closed on provider error, wrong product or missing service secret", async () => {
  await withEnv(experienceEnv, async () => {
    const session = {
      v: 1 as const,
      ...sessionInput(),
    };

    await withFetch(
      async () => new Response("provider unavailable", { status: 503 }),
      async () => assert.equal(await verifyAhmvEntitlementLive(session), false),
    );

    await withFetch(
      async () =>
        Response.json({
          ok: true,
          access: {
            active: true,
            product: "other",
            entitlement: "ahmv_access",
          },
        }),
      async () => assert.equal(await verifyAhmvEntitlementLive(session), false),
    );

    await withEnv({ TAKATAK_AHMV_SERVICE_TOKEN: "" }, async () => {
      assert.equal(await verifyAhmvEntitlementLive(session), false);
    });
  });
});

test("experience auth stays hidden while disabled and rejects malformed launch codes", async () => {
  await withEnv({ AHMV_EXPERIENCE_ENABLED: "false" }, async () => {
    const disabled = await handleAhmvExperienceAuth(
      new Request("https://ahmverdun.ca/api/ahmv/experience/login"),
    );
    assert.equal(disabled?.status, 404);
    assert.equal(disabled?.headers.get("cache-control"), "no-store");
  });

  await withEnv(experienceEnv, async () => {
    const malformed = await handleAhmvExperienceAuth(
      new Request("https://ahmverdun.ca/api/ahmv/experience/callback?code=short"),
    );
    assert.equal(malformed?.status, 400);
  });
});

test("valid launch exchange creates a secure AHMV session and redirects into the independent experience", async () => {
  await withEnv(experienceEnv, async () => {
    const code = "a".repeat(48);

    await withFetch(async (input, init) => {
      assert.equal(String(input), experienceEnv.TAKATAK_AHMV_EXCHANGE_URL);
      assert.equal(init?.method, "POST");
      assert.equal((init?.headers as Record<string, string>).authorization, `Bearer ${SERVICE_TOKEN}`);
      assert.deepEqual(JSON.parse(String(init?.body)), { code });

      return Response.json({
        ok: true,
        session: {
          active: true,
          identityId: "identity-123",
          displayName: "Parent Test",
          product: "ahmv",
          entitlement: "ahmv_access",
          planCode: "parent_essential",
          status: "active",
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
        },
      });
    }, async () => {
      const response = await handleAhmvExperienceAuth(
        new Request(`https://ahmverdun.ca/api/ahmv/experience/callback?code=${code}`),
      );

      assert.equal(response?.status, 303);
      assert.equal(response?.headers.get("location"), "https://ahmverdun.ca/experience");
      const setCookie = response?.headers.get("set-cookie") ?? "";
      assert.match(setCookie, new RegExp(`${AHMV_EXPERIENCE_COOKIE}=`));
      assert.match(setCookie, /HttpOnly/);
      assert.match(setCookie, /Secure/);
    });
  });
});

test("expired or invalid exchange result never creates an AHMV session", async () => {
  await withEnv(experienceEnv, async () => {
    const code = "b".repeat(48);

    await withFetch(
      async () =>
        Response.json({
          ok: true,
          session: {
            active: true,
            identityId: "identity-123",
            product: "ahmv",
            entitlement: "ahmv_access",
            expiresAt: new Date(Date.now() - 1_000).toISOString(),
          },
        }),
      async () => {
        const response = await handleAhmvExperienceAuth(
          new Request(`https://ahmverdun.ca/api/ahmv/experience/callback?code=${code}`),
        );
        assert.equal(response?.status, 403);
        assert.equal(response?.headers.get("set-cookie"), null);
      },
    );
  });
});

test("logout is same-origin only and clears the host-only Family session", async () => {
  await withEnv(experienceEnv, async () => {
    const forbidden = await handleAhmvExperienceAuth(
      new Request("https://ahmverdun.ca/api/ahmv/experience/logout", {
        method: "POST",
        headers: { origin: "https://evil.example" },
      }),
    );
    assert.equal(forbidden?.status, 403);

    const response = await handleAhmvExperienceAuth(
      new Request("https://ahmverdun.ca/api/ahmv/experience/logout", {
        method: "POST",
        headers: { origin: "https://ahmverdun.ca" },
      }),
    );
    assert.equal(response?.status, 303);
    assert.equal(response?.headers.get("location"), "https://ahmverdun.ca/");
    assert.match(response?.headers.get("set-cookie") ?? "", /Max-Age=0/);
  });
});

test("protected experience redirects to server login when live entitlement is revoked", async () => {
  await withEnv(experienceEnv, async () => {
    const request = new Request("https://ahmverdun.ca/experience", {
      headers: { cookie: cookieHeader() },
    });

    await withFetch(
      async () =>
        Response.json({
          ok: true,
          access: {
            active: false,
            product: "ahmv",
            entitlement: "ahmv_access",
          },
        }),
      async () => {
        const response = await gateAhmvExperience(request);
        assert.equal(response?.status, 303);
        assert.equal(
          response?.headers.get("location"),
          "https://ahmverdun.ca/api/ahmv/experience/login",
        );
      },
    );
  });
});
