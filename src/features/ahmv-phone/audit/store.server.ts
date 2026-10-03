import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../integrations/supabase/client.server";
import type { AhmvPhoneChannel } from "../contacts/store.server";

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

export async function recordPhoneInteraction(input: {
  contactId?: string | undefined;
  channel: AhmvPhoneChannel;
  providerReferenceHash?: string | undefined;
  intent?: string | undefined;
  outcome: string;
  teamCode?: string | undefined;
  arenaSlug?: string | undefined;
  metadata?: Record<string, string | number | boolean | null> | undefined;
}) {
  const result = await db().from("ahmv_phone_interactions").insert({
    contact_id: input.contactId ?? null,
    channel: input.channel,
    provider_reference_hash: input.providerReferenceHash ?? null,
    intent: input.intent ?? null,
    outcome: input.outcome,
    team_code: input.teamCode ?? null,
    arena_slug: input.arenaSlug ?? null,
    metadata: input.metadata ?? {},
  });
  if (result.error) throw result.error;
}

export async function safeRecordPhoneInteraction(
  input: Parameters<typeof recordPhoneInteraction>[0],
) {
  try {
    await recordPhoneInteraction(input);
  } catch (error) {
    console.error("[AHMV phone interaction]", error);
  }
}
