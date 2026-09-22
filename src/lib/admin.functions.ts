import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole =
  | "admin"
  | "schedule_manager"
  | "comms_manager"
  | "photo_manager"
  | "volunteer";

/** Roles of the signed-in volunteer, verified server-side (never from the browser). */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    const { data: roleRows, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw error;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    const email = typeof claims["email"] === "string" ? (claims["email"] as string) : null;

    if (!profile) {
      await supabase.from("profiles").insert({ id: userId, display_name: email });
    }

    return {
      userId,
      email,
      displayName: profile?.display_name ?? email,
      roles: (roleRows ?? []).map((r) => r.role as AppRole),
    };
  });

/** Counts of real database content, so the panel never shows mockup numbers as real. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const tables = [
      "activities",
      "teams",
      "arenas",
      "news",
      "albums",
      "faq",
      "contact_messages",
    ] as const;

    const entries = await Promise.all(
      tables.map(async (table) => {
        const { count } = await supabase.from(table).select("id", { count: "exact", head: true });
        return [table, count ?? 0] as const;
      }),
    );

    return Object.fromEntries(entries) as Record<(typeof tables)[number], number>;
  });
