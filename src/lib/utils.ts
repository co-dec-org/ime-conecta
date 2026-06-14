import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Project } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fullName(user?: { first_name: string; last_name: string } | null) {
  if (!user) return "Sin responsable";
  return `${user.first_name} ${user.last_name}`.trim();
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeRut(rut: string) {
  return rut.trim().replace(/[.\-\s]/g, "").toLowerCase();
}

export function projectIsIncomplete(project: Project) {
  if (!["Activo", "Postulación", "Ejecución"].includes(project.status)) return false;
  const hasResponsible = Boolean(project.main_responsible_id);
  const hasNextStep = Boolean(project.next_step?.trim());
  const hasDate = Boolean(project.critical_date || project.review_date);
  const hasBacking = Boolean(project.gmail_thread_url || project.drive_folder_url || project.main_document_url);
  return !hasResponsible || !hasNextStep || !hasDate || !hasBacking;
}

export function csvEscape(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
