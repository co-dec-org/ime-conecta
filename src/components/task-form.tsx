import { PRIORITIES, TASK_STATUSES } from "@/lib/constants";
import type { Project, PublicProfile, Task } from "@/lib/types";
import { Field, SelectField, SubmitButton, TextArea } from "@/components/ui";
import { fullName } from "@/lib/utils";

export function TaskForm({
  action,
  projects,
  users,
  task,
  fixedProjectId
}: {
  action: (formData: FormData) => void | Promise<void>;
  projects: Pick<Project, "id" | "name">[];
  users: PublicProfile[];
  task?: Task;
  fixedProjectId?: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      {fixedProjectId ? (
        <input type="hidden" name="project_id" value={fixedProjectId} />
      ) : (
        <SelectField
          label="Proyecto asociado"
          name="project_id"
          options={projects.map((project) => ({ value: project.id, label: project.name }))}
          defaultValue={task?.project_id}
          includeEmpty
        />
      )}
      <Field label="Título" name="title" defaultValue={task?.title} required />
      <TextArea label="Descripción" name="description" defaultValue={task?.description} />
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          label="Responsable"
          name="responsible_id"
          options={users.map((user) => ({ value: user.id, label: fullName(user) }))}
          defaultValue={task?.responsible_id}
          includeEmpty
        />
        <Field label="Fecha límite" name="due_date" defaultValue={task?.due_date} type="date" />
        <SelectField label="Estado" name="status" options={TASK_STATUSES} defaultValue={task?.status ?? "Pendiente"} required />
        <SelectField label="Prioridad" name="priority" options={PRIORITIES} defaultValue={task?.priority ?? "Media"} required />
        <Field label="Link de respaldo" name="backing_url" defaultValue={task?.backing_url} type="url" />
      </div>
      <TextArea label="Observaciones" name="observations" defaultValue={task?.observations} />
      <div>
        <SubmitButton>Crear tarea</SubmitButton>
      </div>
    </form>
  );
}
