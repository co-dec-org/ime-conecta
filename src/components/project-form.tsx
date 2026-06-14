import {
  CONFIDENTIALITY_LEVELS,
  CLOSURE_STATUSES,
  DOCUMENT_BACKING_TYPES,
  MANDATES,
  PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  SOCIX_VISIBILITY,
  TRAFFIC_LIGHTS
} from "@/lib/constants";
import type { Project, PublicProfile } from "@/lib/types";
import { Field, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { fullName } from "@/lib/utils";

export function ProjectForm({
  action,
  users,
  project
}: {
  action: (formData: FormData) => void | Promise<void>;
  users: PublicProfile[];
  project?: Project;
}) {
  const userOptions = users.map((user) => ({ value: user.id, label: fullName(user) }));

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" name="name" defaultValue={project?.name} required />
        <SelectField label="Tipo de registro" name="record_type" options={PROJECT_TYPES} defaultValue={project?.record_type ?? "Proyecto"} required />
        <Field label="Línea estratégica" name="strategic_line" defaultValue={project?.strategic_line} />
        <SelectField label="Estado" name="status" options={PROJECT_STATUSES} defaultValue={project?.status ?? "Idea"} required />
        <SelectField label="Estado de cierre" name="closure_status" options={CLOSURE_STATUSES} defaultValue={project?.closure_status} includeEmpty />
        <SelectField label="Prioridad" name="priority" options={PRIORITIES} defaultValue={project?.priority ?? "Media"} required />
        <SelectField label="Semáforo" name="traffic_light" options={TRAFFIC_LIGHTS} defaultValue={project?.traffic_light ?? "Gris"} required />
        <SelectField label="Responsable principal" name="main_responsible_id" options={userOptions} defaultValue={project?.main_responsible_id} includeEmpty />
        <Field label="Comité asignado" name="committee_profile" defaultValue={project?.committee_profile} placeholder="Comite_Nombre" />
        <Field label="Fecha crítica" name="critical_date" defaultValue={project?.critical_date} type="date" />
        <Field label="Fecha de revisión" name="review_date" defaultValue={project?.review_date} type="date" />
        <SelectField label="Mandato institucional" name="institutional_mandate" options={MANDATES} defaultValue={project?.institutional_mandate} includeEmpty />
        <SelectField label="Confidencialidad" name="confidentiality_level" options={CONFIDENTIALITY_LEVELS} defaultValue={project?.confidentiality_level ?? "Interna directorio"} required />
        <SelectField label="Visibilidad para socixs" name="socix_visibility" options={SOCIX_VISIBILITY} defaultValue={project?.socix_visibility ?? "No visible"} required />
        <SelectField label="Tipo respaldo documental" name="document_backing_type" options={DOCUMENT_BACKING_TYPES} defaultValue={project?.document_backing_type} includeEmpty />
      </div>

      <TextArea label="Descripción" name="description" defaultValue={project?.description} />
      <TextArea label="Próximo paso" name="next_step" defaultValue={project?.next_step} />
      <TextArea label="Decisión requerida" name="required_decision" defaultValue={project?.required_decision} />
      <TextArea label="Riesgo principal" name="main_risk" defaultValue={project?.main_risk} />

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Link hilo Gmail" name="gmail_thread_url" defaultValue={project?.gmail_thread_url} type="url" />
        <Field label="Link carpeta Drive" name="drive_folder_url" defaultValue={project?.drive_folder_url} type="url" />
        <Field label="Link documento principal" name="main_document_url" defaultValue={project?.main_document_url} type="url" />
      </div>

      <TextArea label="Notas internas" name="internal_notes" defaultValue={project?.internal_notes} rows={4} />
      <div>
        <SubmitButton>{project ? "Guardar proyecto" : "Crear proyecto"}</SubmitButton>
      </div>
    </form>
  );
}
