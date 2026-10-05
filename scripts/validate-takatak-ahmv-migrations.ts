import { readFile } from "node:fs/promises";
import path from "node:path";

const files = [
  "supabase/migrations/20261004170500_takatak_ahmv_control_plane.sql",
  "supabase/migrations/20261004212500_takatak_ahmv_content_provenance.sql",
  "supabase/migrations/20261004214000_takatak_ahmv_content_reviews.sql",
  "supabase/migrations/20261004215500_takatak_ahmv_publication_schedules.sql",
];

const errors: string[] = [];

for (const relative of files) {
  const sql = await readFile(path.join(process.cwd(), relative), "utf8");

  if (/\n\$;\s*(?:\n|$)/.test(sql)) {
    errors.push(`${relative}: malformed dollar-quote terminator "$;"`);
  }

  const opens = (sql.match(/\$\$/g) ?? []).length;
  if (opens % 2 !== 0) {
    errors.push(`${relative}: unbalanced $$ SQL delimiters (${opens})`);
  }

  if (/create table if not exists public\.ahmv_takatak_/i.test(sql)) {
    if (!/enable row level security/i.test(sql)) {
      errors.push(`${relative}: missing RLS enablement`);
    }
    if (!/revoke all on table[\s\S]*from public, anon, authenticated/i.test(sql)) {
      errors.push(`${relative}: missing public/anon/authenticated revoke`);
    }
    if (!/grant all on table[\s\S]*to service_role/i.test(sql)) {
      errors.push(`${relative}: missing service_role table grant`);
    }
  }

  for (const fn of sql.matchAll(/create or replace function\s+([^(\s]+)[\s\S]*?\$\$;/gi)) {
    const block = fn[0] ?? "";
    const name = fn[1] ?? "unknown";
    if (!/security definer/i.test(block)) {
      errors.push(`${relative}: ${name} missing SECURITY DEFINER`);
    }
    if (!/set search_path\s*=\s*''/i.test(block)) {
      errors.push(`${relative}: ${name} missing fixed empty search_path`);
    }
  }
}

if (errors.length) {
  console.error("TAKATAK AHMV migration safeguards failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("TAKATAK AHMV migration safeguards: OK");
