import {
  ACTOR_TYPES,
  AGREEMENT_INSTANCES,
  AGREEMENT_STATUSES,
  DOCUMENT_BACKING_TYPES,
  DOCUMENT_LOCATIONS,
  GLOBAL_ROLES,
  PROJECT_ROLES,
  USER_STATUSES
} from "@/lib/constants";
import type { Project, PublicProfile } from "@/lib/types";
import { Field, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { fullName } from "@/lib/utils";

type ProjectOption = Pick<Project, "id" | "name">;

export function MeetingForm({
  action,
  projects,
  fixedProjectId
}: {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  fixedProjectId?: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      {fixedProjectId ? (
        <input type="hidden" name="project_id" value={fixedProjectId} />
      ) : (
        <SelectField label="Proyecto asociado" name="project_id" options={projects.map((p) => ({ value: p.id, label: p.name }))} includeEmpty />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Fecha" name="date" type="date" required />
        <Field label="Institución o contraparte" name="institution" required />
      </div>
      <Field label="Asistentes IME" name="ime_attendees" />
      <TextArea label="Objetivo" name="objective" />
      <TextArea label="Brief previo" name="prior_brief" />
      <TextArea label="Temas autorizados" name="authorized_topics" />
      <TextArea label="Temas no autorizados" name="unauthorized_topics" />
      <TextArea label="Resumen posterior" name="post_summary" />
      <TextArea label="Acuerdos" name="agreements" />
      <TextArea label="Próximos pasos" name="next_steps" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Link Gmail" name="gmail_url" type="url" />
        <Field label="Link Drive" name="drive_url" type="url" />
      </div>
      <TextArea label="Observaciones" name="observations" />
      <div>
        <SubmitButton>Registrar reunión</SubmitButton>
      </div>
    </form>
  );
}

export function AgreementForm({
  action,
  projects,
  users,
  fixedProjectId
}: {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  users: PublicProfile[];
  fixedProjectId?: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      {fixedProjectId ? (
        <input type="hidden" name="project_id" value={fixedProjectId} />
      ) : (
        <SelectField label="Proyecto asociado" name="project_id" options={projects.map((p) => ({ value: p.id, label: p.name }))} includeEmpty />
      )}
      <TextArea label="Acuerdo o decisión" name="decision" required />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Instancia" name="instance" options={AGREEMENT_INSTANCES} defaultValue="Directorio" required />
        <Field label="Fecha" name="date" type="date" required />
        <SelectField label="Estado" name="status" options={AGREEMENT_STATUSES} defaultValue="Pendiente" required />
        <SelectField
          label="Responsable seguimiento"
          name="follow_up_responsible_id"
          options={users.map((user) => ({ value: user.id, label: fullName(user) }))}
          includeEmpty
        />
      </div>
      <Field label="Link al acta o respaldo" name="backing_url" type="url" />
      <TextArea label="Observaciones" name="observations" />
      <div>
        <SubmitButton>Registrar acuerdo</SubmitButton>
      </div>
    </form>
  );
}

export function StakeholderForm({
  action,
  projects
}: {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
}) {
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" name="name" required />
        <Field label="Institución" name="institution" />
        <Field label="Rol" name="role" />
        <SelectField label="Proyecto vinculado" name="project_id" options={projects.map((p) => ({ value: p.id, label: p.name }))} includeEmpty />
        <Field label="Email" name="email" type="email" />
        <Field label="Teléfono" name="phone" />
        <SelectField label="Tipo de actor" name="actor_type" options={ACTOR_TYPES} defaultValue="Otro" required />
      </div>
      <TextArea label="Notas" name="notes" />
      <div>
        <SubmitButton>Registrar stakeholder</SubmitButton>
      </div>
    </form>
  );
}

export function DocumentLinkForm({
  action,
  projects,
  fixedProjectId
}: {
  action: (formData: FormData) => void | Promise<void>;
  projects: ProjectOption[];
  fixedProjectId?: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      {fixedProjectId ? (
        <input type="hidden" name="project_id" value={fixedProjectId} />
      ) : (
        <SelectField label="Proyecto asociado" name="project_id" options={projects.map((p) => ({ value: p.id, label: p.name }))} required />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título del documento" name="title" required />
        <SelectField label="Tipo de documento" name="document_type" options={DOCUMENT_BACKING_TYPES} defaultValue="Otro" required />
        <Field label="Link" name="url" type="url" required />
        <SelectField label="Ubicación" name="location" options={DOCUMENT_LOCATIONS} defaultValue="Drive" required />
        <Field label="Versión" name="version" />
        <Field label="Fecha" name="document_date" type="date" />
      </div>
      <TextArea label="Notas" name="notes" />
      <div>
        <SubmitButton>Agregar enlace</SubmitButton>
      </div>
    </form>
  );
}

export function AuthorizedUserForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" name="first_name" required />
        <Field label="Apellido" name="last_name" required />
        <Field label="RUT" name="rut" />
        <Field label="Correo" name="email" type="email" required />
        <Field label="Teléfono / WhatsApp" name="phone" />
        <Field label="Cargo o condición" name="position" />
        <SelectField label="Perfil global" name="global_role" options={GLOBAL_ROLES} defaultValue="lector" required />
        <SelectField label="Estado" name="status" options={USER_STATUSES} defaultValue="activo" required />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-ink">
        <input className="size-4 rounded border-line text-forest" name="can_view_sensitive_data" type="checkbox" />
        Puede ver RUT y teléfono/WhatsApp
      </label>
      <div>
        <SubmitButton>Crear usuario</SubmitButton>
      </div>
    </form>
  );
}

export function ProjectRoleForm({
  action,
  users,
  projects
}: {
  action: (formData: FormData) => void | Promise<void>;
  users: PublicProfile[];
  projects: ProjectOption[];
}) {
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Usuario" name="user_id" options={users.map((user) => ({ value: user.id, label: fullName(user) }))} required />
        <SelectField label="Proyecto" name="project_id" options={projects.map((project) => ({ value: project.id, label: project.name }))} required />
        <SelectField label="Rol por proyecto" name="role" options={PROJECT_ROLES} defaultValue="lector" required />
        <Field label="Perfil comité" name="committee_profile_name" placeholder="Comite_Nombre" />
      </div>
      <div>
        <SubmitButton>Asignar rol</SubmitButton>
      </div>
    </form>
  );
}
