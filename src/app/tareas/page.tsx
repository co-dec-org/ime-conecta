import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { TaskForm } from "@/components/task-form";
import { EmptyState, Panel } from "@/components/ui";
import { createTask, deleteTask, updateTaskStatus } from "@/lib/actions";
import { requireProfile } from "@/lib/auth";
import { TASK_STATUSES } from "@/lib/constants";
import { formatDate, isPastDate } from "@/lib/date";
import { loadProjects, loadPublicProfiles } from "@/lib/loaders";
import type { Task } from "@/lib/types";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const { supabase, profile } = await requireProfile();
  const [projects, profiles] = await Promise.all([loadProjects(supabase), loadPublicProfiles(supabase)]);
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });
  const tasks = (data ?? []) as Task[];
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const profileById = new Map(profiles.map((item) => [item.id, item]));

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Seguimiento</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Tareas</h2>
        </header>

        <Panel>
          <h3 className="text-lg font-bold">Nueva tarea</h3>
          <div className="mt-5">
            <TaskForm action={createTask} projects={projects} users={profiles} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Listado de tareas</h3>
          <div className="mt-4 grid gap-3">
            {tasks.length ? (
              tasks.map((task) => {
                const project = task.project_id ? projectById.get(task.project_id) : null;
                return (
                  <div
                    className={isPastDate(task.due_date) && task.status !== "Terminada" ? "rounded-lg border border-red-100 bg-red-50/40 p-4" : "rounded-lg border border-line bg-white p-4"}
                    key={task.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="mt-1 text-sm text-ink/60">
                          {project ? <Link className="text-forest hover:underline" href={`/proyectos/${project.id}`}>{project.name}</Link> : "Sin proyecto"} · {fullName(task.responsible_id ? profileById.get(task.responsible_id) : null)} · {formatDate(task.due_date)}
                        </p>
                      </div>
                      <StatusBadge value={task.status} />
                    </div>
                    {task.description ? <p className="mt-3 text-sm text-ink/70">{task.description}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={updateTaskStatus.bind(null, task.id, task.project_id)}>
                        <div className="flex gap-2">
                          <select className="focus-ring min-h-9 rounded-md border border-line px-2 text-sm" name="status" defaultValue={task.status}>
                            {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
                          </select>
                          <button className="focus-ring rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" type="submit">Actualizar</button>
                        </div>
                      </form>
                      <form action={deleteTask.bind(null, task.id, task.project_id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>No hay tareas visibles.</EmptyState>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
