"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/utils";

type SupabaseClient = Awaited<ReturnType<typeof requireProfile>>["supabase"];

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function requiredText(formData: FormData, key: string) {
  return text(formData, key) ?? "";
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

async function logActivity(
  supabase: SupabaseClient,
  actorUserId: string,
  input: {
    projectId?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: Record<string, unknown>;
  }
) {
  await supabase.from("activity_logs").insert({
    project_id: input.projectId ?? null,
    actor_user_id: actorUserId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    details: input.details ?? {}
  });
}

function projectPayload(formData: FormData) {
  return {
    name: requiredText(formData, "name"),
    description: text(formData, "description"),
    record_type: requiredText(formData, "record_type"),
    strategic_line: text(formData, "strategic_line"),
    status: requiredText(formData, "status"),
    closure_status: text(formData, "closure_status"),
    priority: requiredText(formData, "priority"),
    traffic_light: requiredText(formData, "traffic_light"),
    main_responsible_id: text(formData, "main_responsible_id"),
    committee_profile: text(formData, "committee_profile"),
    critical_date: text(formData, "critical_date"),
    review_date: text(formData, "review_date"),
    next_step: text(formData, "next_step"),
    required_decision: text(formData, "required_decision"),
    institutional_mandate: text(formData, "institutional_mandate"),
    confidentiality_level: requiredText(formData, "confidentiality_level"),
    socix_visibility: requiredText(formData, "socix_visibility"),
    main_risk: text(formData, "main_risk"),
    document_backing_type: text(formData, "document_backing_type"),
    gmail_thread_url: text(formData, "gmail_thread_url"),
    drive_folder_url: text(formData, "drive_folder_url"),
    main_document_url: text(formData, "main_document_url"),
    internal_notes: text(formData, "internal_notes")
  };
}

export async function createProject(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const payload = projectPayload(formData);
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...payload, created_by: profile.id })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await logActivity(supabase, profile.id, {
    projectId: data.id,
    action: "creó proyecto",
    entityType: "project",
    entityId: data.id,
    details: { name: payload.name }
  });

  revalidatePath("/");
  redirect(`/proyectos/${data.id}`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const payload = projectPayload(formData);
  const { error } = await supabase.from("projects").update(payload).eq("id", projectId);
  if (error) throw new Error(error.message);

  await logActivity(supabase, profile.id, {
    projectId,
    action: "editó proyecto",
    entityType: "project",
    entityId: projectId,
    details: { name: payload.name }
  });

  revalidatePath("/");
  revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const { supabase, profile } = await requireProfile();
  await logActivity(supabase, profile.id, {
    projectId,
    action: "eliminó proyecto",
    entityType: "project",
    entityId: projectId
  });
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  redirect("/proyectos");
}

export async function createTask(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const projectId = text(formData, "project_id");
  const payload = {
    project_id: projectId,
    title: requiredText(formData, "title"),
    description: text(formData, "description"),
    responsible_id: text(formData, "responsible_id"),
    due_date: text(formData, "due_date"),
    status: requiredText(formData, "status"),
    priority: requiredText(formData, "priority"),
    backing_url: text(formData, "backing_url"),
    observations: text(formData, "observations")
  };
  const { data, error } = await supabase.from("tasks").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await logActivity(supabase, profile.id, {
    projectId,
    action: "creó tarea",
    entityType: "task",
    entityId: data.id,
    details: { title: payload.title }
  });
  revalidatePath("/");
  revalidatePath("/tareas");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function updateTaskStatus(taskId: string, projectId: string | null, formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const status = requiredText(formData, "status");
  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, profile.id, {
    projectId,
    action: status === "Terminada" ? "cerró tarea" : "actualizó tarea",
    entityType: "task",
    entityId: taskId,
    details: { status }
  });
  revalidatePath("/");
  revalidatePath("/tareas");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string | null) {
  const { supabase, profile } = await requireProfile();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, profile.id, {
    projectId,
    action: "eliminó tarea",
    entityType: "task",
    entityId: taskId
  });
  revalidatePath("/");
  revalidatePath("/tareas");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function createMeeting(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const projectId = text(formData, "project_id");
  const payload = {
    project_id: projectId,
    date: requiredText(formData, "date"),
    institution: requiredText(formData, "institution"),
    ime_attendees: text(formData, "ime_attendees"),
    objective: text(formData, "objective"),
    prior_brief: text(formData, "prior_brief"),
    authorized_topics: text(formData, "authorized_topics"),
    unauthorized_topics: text(formData, "unauthorized_topics"),
    post_summary: text(formData, "post_summary"),
    agreements: text(formData, "agreements"),
    next_steps: text(formData, "next_steps"),
    gmail_url: text(formData, "gmail_url"),
    drive_url: text(formData, "drive_url"),
    observations: text(formData, "observations")
  };
  const { data, error } = await supabase.from("external_meetings").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await logActivity(supabase, profile.id, {
    projectId,
    action: "registró reunión",
    entityType: "external_meeting",
    entityId: data.id,
    details: { institution: payload.institution }
  });
  revalidatePath("/reuniones");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteMeeting(meetingId: string, projectId: string | null) {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("external_meetings").delete().eq("id", meetingId);
  if (error) throw new Error(error.message);
  revalidatePath("/reuniones");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function createAgreement(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const projectId = text(formData, "project_id");
  const payload = {
    project_id: projectId,
    decision: requiredText(formData, "decision"),
    instance: requiredText(formData, "instance"),
    date: requiredText(formData, "date"),
    status: requiredText(formData, "status"),
    follow_up_responsible_id: text(formData, "follow_up_responsible_id"),
    backing_url: text(formData, "backing_url"),
    observations: text(formData, "observations")
  };
  const { data, error } = await supabase.from("agreements").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await logActivity(supabase, profile.id, {
    projectId,
    action: "registró acuerdo",
    entityType: "agreement",
    entityId: data.id,
    details: { decision: payload.decision }
  });
  revalidatePath("/");
  revalidatePath("/acuerdos");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function updateAgreementStatus(agreementId: string, projectId: string | null, formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const status = requiredText(formData, "status");
  const { error } = await supabase.from("agreements").update({ status }).eq("id", agreementId);
  if (error) throw new Error(error.message);
  await logActivity(supabase, profile.id, {
    projectId,
    action: "modificó acuerdo",
    entityType: "agreement",
    entityId: agreementId,
    details: { status }
  });
  revalidatePath("/");
  revalidatePath("/acuerdos");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteAgreement(agreementId: string, projectId: string | null) {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("agreements").delete().eq("id", agreementId);
  if (error) throw new Error(error.message);
  revalidatePath("/acuerdos");
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function createStakeholder(formData: FormData) {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("stakeholders").insert({
    project_id: text(formData, "project_id"),
    name: requiredText(formData, "name"),
    institution: text(formData, "institution"),
    role: text(formData, "role"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    actor_type: requiredText(formData, "actor_type"),
    notes: text(formData, "notes")
  });
  if (error) throw new Error(error.message);
  revalidatePath("/stakeholders");
}

export async function deleteStakeholder(stakeholderId: string) {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("stakeholders").delete().eq("id", stakeholderId);
  if (error) throw new Error(error.message);
  revalidatePath("/stakeholders");
}

export async function createDocumentLink(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const projectId = requiredText(formData, "project_id");
  const payload = {
    project_id: projectId,
    title: requiredText(formData, "title"),
    document_type: requiredText(formData, "document_type"),
    url: requiredText(formData, "url"),
    location: requiredText(formData, "location"),
    version: text(formData, "version"),
    document_date: text(formData, "document_date"),
    notes: text(formData, "notes")
  };
  const { data, error } = await supabase.from("document_links").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await logActivity(supabase, profile.id, {
    projectId,
    action: "agregó enlace documental",
    entityType: "document_link",
    entityId: data.id,
    details: { title: payload.title, location: payload.location }
  });
  revalidatePath("/documentos");
  revalidatePath(`/proyectos/${projectId}`);
}

export async function deleteDocumentLink(documentId: string, projectId: string) {
  const { supabase } = await requireProfile();
  const { error } = await supabase.from("document_links").delete().eq("id", documentId);
  if (error) throw new Error(error.message);
  revalidatePath("/documentos");
  revalidatePath(`/proyectos/${projectId}`);
}

export async function createAuthorizedUser(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.global_role !== "admin") throw new Error("Solo Admin puede crear accesos.");
  const payload = {
    first_name: requiredText(formData, "first_name"),
    last_name: requiredText(formData, "last_name"),
    rut: text(formData, "rut"),
    email: normalizeEmail(requiredText(formData, "email")),
    phone: text(formData, "phone"),
    position: text(formData, "position"),
    global_role: requiredText(formData, "global_role"),
    status: requiredText(formData, "status"),
    can_view_sensitive_data: checkbox(formData, "can_view_sensitive_data")
  };
  const { data, error } = await supabase.from("authorized_users").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    actor_user_id: profile.id,
    action: "creó usuario autorizado",
    entity_type: "authorized_user",
    entity_id: data.id,
    details: { email: payload.email, global_role: payload.global_role }
  });
  revalidatePath("/accesos");
}

export async function updateAuthorizedUserStatus(userId: string, formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.global_role !== "admin") throw new Error("Solo Admin puede cambiar estados.");
  const status = requiredText(formData, "status");
  const { error } = await supabase.from("authorized_users").update({ status }).eq("id", userId);
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    actor_user_id: profile.id,
    action: "actualizó estado de usuario",
    entity_type: "authorized_user",
    entity_id: userId,
    details: { status }
  });
  revalidatePath("/accesos");
}

export async function forceUserValidation(userId: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.global_role !== "admin") throw new Error("Solo Admin puede forzar validación.");
  const { error } = await supabase
    .from("authorized_users")
    .update({ force_revalidation: true, last_validated_at: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    actor_user_id: profile.id,
    action: "forzó nueva validación",
    entity_type: "authorized_user",
    entity_id: userId
  });
  revalidatePath("/accesos");
}

export async function resetInitialPassword(userId: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.global_role !== "admin") throw new Error("Solo Admin puede restablecer claves.");

  const admin = createAdminClient();
  const { data: user, error: userError } = await admin
    .from("authorized_users")
    .select("id,auth_user_id,first_name,last_name,email")
    .eq("id", userId)
    .maybeSingle();

  if (userError) throw new Error(userError.message);
  if (!user?.email) throw new Error("Usuario no encontrado.");

  const email = normalizeEmail(user.email);
  let authUserId = user.auth_user_id as string | null;

  if (!authUserId) {
    const { data: authUsers, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) throw new Error(listError.message);
    authUserId = authUsers.users.find((authUser) => normalizeEmail(authUser.email ?? "") === email)?.id ?? null;
  }

  if (authUserId) {
    const { error } = await admin.auth.admin.updateUserById(authUserId, {
      email,
      email_confirm: true,
      password: email,
      user_metadata: {
        authorized_user_id: user.id,
        full_name: `${user.first_name} ${user.last_name}`.trim()
      }
    });
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: email,
      email_confirm: true,
      user_metadata: {
        authorized_user_id: user.id,
        full_name: `${user.first_name} ${user.last_name}`.trim()
      }
    });
    if (error) throw new Error(error.message);
    authUserId = data.user.id;
  }

  await admin
    .from("authorized_users")
    .update({ auth_user_id: authUserId, force_revalidation: false, last_validated_at: null })
    .eq("id", user.id);

  await supabase.from("audit_events").insert({
    actor_user_id: profile.id,
    action: "restableció clave inicial",
    entity_type: "authorized_user",
    entity_id: user.id,
    details: { email }
  });

  revalidatePath("/accesos");
}

export async function assignProjectRole(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (profile.global_role !== "admin") throw new Error("Solo Admin puede asignar roles.");
  const payload = {
    user_id: requiredText(formData, "user_id"),
    project_id: requiredText(formData, "project_id"),
    role: requiredText(formData, "role"),
    committee_profile_name: text(formData, "committee_profile_name")
  };
  const { error } = await supabase.from("project_memberships").upsert(payload, {
    onConflict: "user_id,project_id,role"
  });
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    actor_user_id: profile.id,
    action: "asignó rol por proyecto",
    entity_type: "project_membership",
    details: payload
  });
  revalidatePath("/accesos");
}

export async function removeProjectRole(membershipId: string) {
  const { supabase, profile } = await requireProfile();
  if (profile.global_role !== "admin") throw new Error("Solo Admin puede quitar roles.");
  const { error } = await supabase.from("project_memberships").delete().eq("id", membershipId);
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    actor_user_id: profile.id,
    action: "quitó rol por proyecto",
    entity_type: "project_membership",
    entity_id: membershipId
  });
  revalidatePath("/accesos");
}
