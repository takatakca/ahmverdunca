import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/integrations/supabase/client.server";

type AutopilotPreferences = {
  auto_calendar: boolean;
  remind_rsvp: boolean;
  alert_schedule_changes: boolean;
  recalculate_departure: boolean;
  notify_other_caregiver: boolean;
  remind_documents: boolean;
  group_children_activities: boolean;
};

const DEFAULT_AUTOPILOT: AutopilotPreferences = {
  auto_calendar: false,
  remind_rsvp: true,
  alert_schedule_changes: true,
  recalculate_departure: true,
  notify_other_caregiver: false,
  remind_documents: true,
  group_children_activities: true,
};

function db(): SupabaseClient {
  return supabaseAdmin as unknown as SupabaseClient;
}

function assertNoError(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`AHMV family hub ${operation} failed: ${error.message}`);
}

export async function ensureAhmvFamilyHub(input: {
  identityId: string;
  displayName: string | null;
}) {
  const client = db();
  const now = new Date().toISOString();
  const familyPayload: Record<string, unknown> = {
    owner_takatak_identity_id: input.identityId,
    updated_at: now,
  };
  if (input.displayName) familyPayload["display_name"] = input.displayName;

  const familyResult = await client
    .from("ahmv_families")
    .upsert(familyPayload, { onConflict: "owner_takatak_identity_id" })
    .select("id, display_name, onboarding_completed")
    .single();
  assertNoError(familyResult.error, "family bootstrap");
  if (!familyResult.data) throw new Error("AHMV family hub bootstrap returned no family.");

  const familyId = String(familyResult.data.id);

  const caregiverResult = await client
    .from("ahmv_family_caregivers")
    .upsert(
      {
        family_id: familyId,
        takatak_identity_id: input.identityId,
        role: "owner",
        status: "active",
        updated_at: now,
      },
      { onConflict: "family_id,takatak_identity_id" },
    );
  assertNoError(caregiverResult.error, "caregiver bootstrap");

  const preferenceSeed = await client
    .from("ahmv_autopilot_preferences")
    .upsert(
      { family_id: familyId },
      { onConflict: "family_id", ignoreDuplicates: true },
    );
  assertNoError(preferenceSeed.error, "autopilot bootstrap");

  const [childrenResult, preferencesResult] = await Promise.all([
    client
      .from("ahmv_family_children")
      .select("id, display_name, active")
      .eq("family_id", familyId)
      .eq("active", true)
      .order("created_at", { ascending: true }),
    client
      .from("ahmv_autopilot_preferences")
      .select(
        "auto_calendar, remind_rsvp, alert_schedule_changes, recalculate_departure, notify_other_caregiver, remind_documents, group_children_activities",
      )
      .eq("family_id", familyId)
      .single(),
  ]);
  assertNoError(childrenResult.error, "children load");
  assertNoError(preferencesResult.error, "autopilot load");

  const children = (childrenResult.data ?? []).map((child) => ({
    id: String(child.id),
    displayName: String(child.display_name),
  }));
  const childIds = children.map((child) => child.id);

  let teamLinks: Array<{ child_id: string; official_team_id: string; team_label: string | null }> = [];
  if (childIds.length > 0) {
    const teamResult = await client
      .from("ahmv_family_team_links")
      .select("child_id, official_team_id, team_label")
      .in("child_id", childIds);
    assertNoError(teamResult.error, "team link load");
    teamLinks = (teamResult.data ?? []).map((row) => ({
      child_id: String(row.child_id),
      official_team_id: String(row.official_team_id),
      team_label: typeof row.team_label === "string" ? row.team_label : null,
    }));
  }

  const prefs = (preferencesResult.data ?? DEFAULT_AUTOPILOT) as AutopilotPreferences;

  return {
    family: {
      id: familyId,
      displayName:
        typeof familyResult.data.display_name === "string"
          ? familyResult.data.display_name
          : input.displayName,
      onboardingCompleted: Boolean(familyResult.data.onboarding_completed),
    },
    children: children.map((child) => ({
      ...child,
      teams: teamLinks
        .filter((link) => link.child_id === child.id)
        .map((link) => ({
          id: link.official_team_id,
          label: link.team_label,
        })),
    })),
    autopilot: {
      autoCalendar: Boolean(prefs.auto_calendar),
      remindRsvp: Boolean(prefs.remind_rsvp),
      alertScheduleChanges: Boolean(prefs.alert_schedule_changes),
      recalculateDeparture: Boolean(prefs.recalculate_departure),
      notifyOtherCaregiver: Boolean(prefs.notify_other_caregiver),
      remindDocuments: Boolean(prefs.remind_documents),
      groupChildrenActivities: Boolean(prefs.group_children_activities),
    },
  };
}

export async function updateAhmvAutopilot(
  identityId: string,
  patch: Partial<{
    autoCalendar: boolean;
    remindRsvp: boolean;
    alertScheduleChanges: boolean;
    recalculateDeparture: boolean;
    notifyOtherCaregiver: boolean;
    remindDocuments: boolean;
    groupChildrenActivities: boolean;
  }>,
) {
  const client = db();
  const familyResult = await client
    .from("ahmv_families")
    .select("id")
    .eq("owner_takatak_identity_id", identityId)
    .maybeSingle();
  assertNoError(familyResult.error, "family lookup");
  if (!familyResult.data) throw new Error("AHMV family does not exist.");

  const columnPatch: Record<string, boolean | string> = {
    updated_at: new Date().toISOString(),
  };
  const mapping = {
    autoCalendar: "auto_calendar",
    remindRsvp: "remind_rsvp",
    alertScheduleChanges: "alert_schedule_changes",
    recalculateDeparture: "recalculate_departure",
    notifyOtherCaregiver: "notify_other_caregiver",
    remindDocuments: "remind_documents",
    groupChildrenActivities: "group_children_activities",
  } as const;

  for (const [key, column] of Object.entries(mapping)) {
    const value = patch[key as keyof typeof mapping];
    if (typeof value === "boolean") columnPatch[column] = value;
  }

  const result = await client
    .from("ahmv_autopilot_preferences")
    .update(columnPatch)
    .eq("family_id", familyResult.data.id);
  assertNoError(result.error, "autopilot update");
}


export async function addAhmvFamilyChild(identityId: string, displayName: string) {
  const client = db();
  const familyResult = await client
    .from("ahmv_families")
    .select("id")
    .eq("owner_takatak_identity_id", identityId)
    .single();
  assertNoError(familyResult.error, "family lookup");
  if (!familyResult.data) throw new Error("AHMV family does not exist.");

  const childResult = await client
    .from("ahmv_family_children")
    .insert({
      family_id: familyResult.data.id,
      display_name: displayName,
      active: true,
    })
    .select("id, display_name")
    .single();
  assertNoError(childResult.error, "child creation");
  if (!childResult.data) throw new Error("AHMV child creation returned no child.");

  return {
    id: String(childResult.data.id),
    displayName: String(childResult.data.display_name),
    teams: [] as Array<{ id: string; label: string | null }>,
  };
}
