import type { SupabaseClient } from "@supabase/supabase-js";
import type { Project, PublicProfile } from "@/lib/types";

export async function loadPublicProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("id,first_name,last_name,email,global_role,status")
    .eq("status", "activo")
    .order("last_name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PublicProfile[];
}

export async function loadProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export function attachProjectResponsible(projects: Project[], profiles: PublicProfile[]) {
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  return projects.map((project) => ({
    ...project,
    main_responsible: project.main_responsible_id ? profileById.get(project.main_responsible_id) ?? null : null
  }));
}
