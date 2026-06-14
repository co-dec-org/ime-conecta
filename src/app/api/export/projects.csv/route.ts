import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { loadProjects, loadPublicProfiles } from "@/lib/loaders";
import { csvEscape, fullName } from "@/lib/utils";

export async function GET() {
  const { supabase } = await requireProfile();
  const profiles = await loadPublicProfiles(supabase);
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const projects = await loadProjects(supabase);

  const header = [
    "nombre",
    "tipo_registro",
    "linea_estrategica",
    "estado",
    "prioridad",
    "semaforo",
    "responsable_principal",
    "fecha_critica",
    "proximo_paso",
    "decision_requerida",
    "confidencialidad",
    "visibilidad_socixs",
    "link_gmail",
    "link_drive",
    "link_documento"
  ];

  const rows = projects.map((project) => [
    project.name,
    project.record_type,
    project.strategic_line,
    project.status,
    project.priority,
    project.traffic_light,
    fullName(project.main_responsible_id ? profileById.get(project.main_responsible_id) : null),
    project.critical_date,
    project.next_step,
    project.required_decision,
    project.confidentiality_level,
    project.socix_visibility,
    project.gmail_thread_url,
    project.drive_folder_url,
    project.main_document_url
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ime-hub-proyectos.csv"`
    }
  });
}
