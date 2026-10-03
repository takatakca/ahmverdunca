const target = "https://www.ahmverdun.com/schedules?teamId=2025191400018816";
const origin = new URL(target).origin;

function absolute(value: string) {
  try { return new URL(value, origin).toString(); } catch { return null; }
}

function candidates(text: string) {
  const found = new Set<string>();
  for (const match of text.matchAll(/https?:\/\/[^"'\s<>]+/g)) found.add(match[0]!);
  for (const match of text.matchAll(/["'`](\/[A-Za-z0-9_./?=&%-]{4,})["'`]/g)) {
    const value = match[1]!;
    if (/api|schedule|game|team|stand|score|ajax|gamedata/i.test(value)) found.add(value);
  }
  for (const match of text.matchAll(/(?:fetch|axios\.(?:get|post)|url\s*:|endpoint\s*:)[^(="'`]{0,40}[("'\s]*([^"'\s)]+)["')\s]/gi)) {
    const value = match[1];
    if (value && /api|schedule|game|team|score|ajax|gamedata/i.test(value)) found.add(value);
  }
  return [...found].slice(0, 150);
}

try {
  const response = await fetch(target, {
    headers: {
      "user-agent": "Mozilla/5.0 AHMV-preproduction-public-endpoint-probe/1.0",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
  });
  const html = await response.text();
  console.log("PROBE_PAGE", response.status, response.url, html.length);

  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
    .map((m) => absolute(m[1]!))
    .filter((v): v is string => Boolean(v));

  const forms = [...html.matchAll(/<form[^>]+action=["']([^"']+)["']/gi)]
    .map((m) => absolute(m[1]!))
    .filter((v): v is string => Boolean(v));

  console.log("PROBE_SCRIPTS", JSON.stringify(scripts));
  console.log("PROBE_FORMS", JSON.stringify(forms));
  console.log("PROBE_INLINE_CANDIDATES", JSON.stringify(candidates(html)));

  for (const scriptUrl of scripts.slice(0, 20)) {
    try {
      const sr = await fetch(scriptUrl, {
        headers: { "user-agent": "Mozilla/5.0 AHMV-preproduction-public-endpoint-probe/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      const body = await sr.text();
      const hits = candidates(body);
      if (hits.length) {
        console.log("PROBE_SCRIPT", scriptUrl, sr.status, JSON.stringify(hits));
      }
    } catch (error) {
      console.log("PROBE_SCRIPT_ERROR", scriptUrl, error instanceof Error ? error.name : "unknown");
    }
  }
} catch (error) {
  console.log("PROBE_PAGE_ERROR", error instanceof Error ? error.name : "unknown");
}
