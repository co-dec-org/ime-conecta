import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, Panel } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDate, isPastDate, isWithinDays } from "@/lib/date";
import { attachProjectResponsible, loadProjects, loadPublicProfiles } from "@/lib/loaders";
import type { Agreement, Task } from "@/lib/types";
import { fullName, projectIsIncomplete } from "@/lib/utils";

export const dynamic = "force-dynamic";

function ProjectRow({ project, note }: { project: ReturnType<typeof attachProjectResponsible>[number]; note?: string }) {
  return (
    <Link className="grid gap-2 rounded-lg border border-line bg-white p-4 transition hover:border-forest/40" href={`/proyectos/${project.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{project.name}</p>
          <p className="mt-1 text-sm text-ink/60">{fullName(project.main_responsible)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={project.priority} />
          <StatusBadge value={project.traffic_light} />
        </div>
      </div>
      {note ? <p className="text-sm text-ink/70">{note}</p> : null}
    </Link>
  );
}

export default async function DirectorioPage() {
  const { supabase, profile } = await requireProfile();
  const profiles = await loadPublicProfiles(supabase);
  const projects = attachProjectResponsible(await loadProjects(supabase), profiles);

  const { data: tasksData } = await supabase
    .from("tasks")
    .select("*")
    .neq("status", "Terminada")
    .order("due_date", { ascending: true, nullsFirst: false });
  const { data: agreementsData } = await supabase
    .from("agreements")
    .select("*")
    .eq("status", "Pendiente")
    .order("date", { ascending: false });

  const tasks = (tasksData ?? []) as Task[];
  const agreements = (agreementsData ?? []) as Agreement[];
  const decisionProjects = projects.filter((project) => Boolean(project.required_decision?.trim()));
  const overdueTasks = tasks.filter((task) => isPastDate(task.due_date));
  const upcomingCritical = projects.filter((project) => isWithinDays(project.critical_date, 21));
  const blocked = projects.filter((project) => project.status === "Bloqueado" || project.traffic_light === "Rojo");
  const incomplete = projects.filter(projectIsIncomplete);
  const nextSteps = projects.filter((project) => Boolean(project.next_step?.trim())).slice(0, 10);

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Rutina semanal</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Directorio semanal</h2>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="text-lg font-bold">Proyectos que requieren decisión</h3>
            <div className="mt-4 grid gap-3">
              {decisionProjects.length ? (
                decisionProjects.map((project) => <ProjectRow key={project.id} project={project} note={project.required_decision ?? undefined} />)
              ) : (
                <EmptyState>No hay decisiones pendientes.</EmptyState>
              )}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Tareas vencidas</h3>
            <div className="mt-4 grid gap-3">
              {overdueTasks.length ? (
                overdueTasks.map((task) => (
                  <div className="rounded-lg border border-red-100 bg-red-50/50 p-4" key={task.id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{task.title}</p>
                      <StatusBadge value="Vencida" />
                    </div>
                    <p className="mt-1 text-sm text-ink/65">Venció: {formatDate(task.due_date)}</p>
                  </div>
                ))
              ) : (
                <EmptyState>No hay tareas vencidas.</EmptyState>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel>
            <h3 className="text-lg font-bold">Fechas críticas próximas</h3>
            <div className="mt-4 grid gap-3">
              {upcomingCritical.length ? (
                upcomingCritical.map((project) => <ProjectRow key={project.id} project={project} note={formatDate(project.critical_date)} />)
              ) : (
                <EmptyState>Sin fechas críticas cercanas.</EmptyState>
              )}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Acuerdos pendientes</h3>
            <div className="mt-4 grid gap-3">
              {agreements.length ? (
                agreements.map((agreement) => (
                  <div className="rounded-lg border border-line bg-white p-4" key={agreement.id}>
                    <p className="font-semibold">{agreement.decision}</p>
                    <p className="mt-1 text-sm text-ink/60">{agreement.instance} · {formatDate(agreement.date)}</p>
                  </div>
                ))
              ) : (
                <EmptyState>No hay acuerdos pendientes.</EmptyState>
              )}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Proyectos bloqueados</h3>
            <div className="mt-4 grid gap-3">
              {blocked.length ? (
                blocked.map((project) => <ProjectRow key={project.id} project={project} note={project.main_risk ?? "Bloqueo sin detalle"} />)
              ) : (
                <EmptyState>No hay proyectos bloqueados.</EmptyState>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="text-lg font-bold">Proyectos incompletos</h3>
            <div className="mt-4 grid gap-3">
              {incomplete.length ? (
                incomplete.map((project) => (
                  <ProjectRow key={project.id} project={project} note="Falta responsable, próximo paso, fecha de control o respaldo documental." />
                ))
              ) : (
                <EmptyState>Todos los proyectos operativos visibles tienen mínimos completos.</EmptyState>
              )}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Próximos pasos por responsable</h3>
            <div className="mt-4 grid gap-3">
              {nextSteps.length ? (
                nextSteps.map((project) => (
                  <ProjectRow key={project.id} project={project} note={`${fullName(project.main_responsible)}: ${project.next_step}`} />
                ))
              ) : (
                <EmptyState>No hay próximos pasos registrados.</EmptyState>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
