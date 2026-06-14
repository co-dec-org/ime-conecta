import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthorizedUser, GlobalRole } from "@/lib/types";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) return { supabase, user: null, profile: null };

  const { data } = await supabase
    .from("authorized_users")
    .select("*")
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email.toLowerCase()}`)
    .maybeSingle();

  return { supabase, user, profile: data as AuthorizedUser | null };
}

export async function requireProfile() {
  const { supabase, user, profile } = await getCurrentProfile();

  if (!user || !profile) {
    redirect("/login");
  }

  if (profile.status !== "activo") {
    redirect("/login?reason=inactive");
  }

  const lastActiveAt = profile.last_active_at ? new Date(profile.last_active_at).getTime() : 0;
  const needsFreshValidation = profile.force_revalidation || Date.now() - lastActiveAt > FIVE_DAYS_MS;

  if (needsFreshValidation) {
    await supabase.auth.signOut();
    redirect("/login?reason=session");
  }

  await supabase.rpc("touch_current_authorized_user");

  return { supabase, user, profile };
}

export async function requireRole(roles: GlobalRole[]) {
  const session = await requireProfile();
  if (!roles.includes(session.profile.global_role)) {
    redirect("/");
  }
  return session;
}

export function canManageUsers(role: GlobalRole) {
  return role === "admin";
}

export function canEditGlobally(role: GlobalRole) {
  return role === "admin" || role === "director" || role === "editor";
}

export function canViewSensitive(profile: AuthorizedUser) {
  return profile.global_role === "admin" || profile.can_view_sensitive_data;
}
