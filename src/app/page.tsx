import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, CircleHelp, FolderKanban, ListTodo } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, Panel } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDate, isPastDate, isWithinDays } from "@/lib/date";
import { attachProjectResponsible, loadProjects, loadPublicProfiles } from "@/lib/loaders";
import type { Agreement, Task } from "@/lib/types";
import { fullName, projectIsIncomplete } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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
  const activeProjects = projects.filter((project) => project.status !== "Cerrado");
  const overdueTasks = tasks.filter((task) => isPastDate(task.due_date));
  const upcomingCritical = projects.filter((project) => isWithinDays(project.critical_date, 30));
  const blockedProjects = projects.filter((project) => project.status === "Bloqueado" || project.traffic_light === "Rojo");
  const decisionProjects = projects.filter((project) => Boolean(project.required_decision?.trim()));
  const noNextStep = activeProjects.filter((project) => !project.next_step?.trim());
  const incompleteProjects = projects.filter(projectIsIncomplete);

  const stats = [
    { label: "Proyectos activos", value: activeProjects.length, icon: FolderKanban },
    { label: "Tareas pendientes", value: tasks.length, icon: ListTodo },
    { label: "Tareas vencidas", value: overdueTasks.length, icon: AlertTriangle },
    { label: "Fechas críticas", value: upcomingCritical.length, icon: CalendarClock },
    { label: "Requieren decisión", value: decisionProjects.length, icon: CircleHelp },
    { label: "Acuerdos pendientes", value: agreements.length, icon: CheckCircle2 }
  ];

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Panel operativo</p>
            <h2 className="mt-1 text-3xl font-bold text-ink">Dashboard general</h2>
          </div>
          <Link
            className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90"
            href="/api/export/projects.csv"
          >
            Exportar CSV
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Panel className="p-4" key={stat.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink/65">{stat.label}</p>
                  <Icon className="text-forest" size={18} />
                </div>
                <p className="mt-3 text-3xl font-bold text-ink">{stat.value}</p>
              </Panel>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold">Proyectos que requieren decisión</h3>
              <Link className="text-sm font-semibold text-forest" href="/directorio">
                Ver directorio
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {decisionProjects.length ? (
                decisionProjects.slice(0, 6).map((project) => (
                  <Link className="rounded-lg border border-line p-4 transition hover:border-forest/40" href={`/proyectos/${project.id}`} key={project.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-ink">{project.name}</p>
                        <p className="mt-1 text-sm text-ink/60">{project.required_decision}</p>
                      </div>
                      <StatusBadge value={project.priority} />
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState>No hay proyectos con decisión requerida.</EmptyState>
              )}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Tareas vencidas</h3>
            <div className="mt-4 grid gap-3">
              {overdueTasks.length ? (
                overdueTasks.slice(0, 7).map((task) => (
                  <div className="rounded-lg border border-red-100 bg-red-50/40 p-4" key={task.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-ink">{task.title}</p>
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
                upcomingCritical.slice(0, 6).map((project) => (
                  <Link className="rounded-lg border border-line p-4 transition hover:border-forest/40" href={`/proyectos/${project.id}`} key={project.id}>
                    <p className="font-semibold">{project.name}</p>
                    <p className="mt-1 text-sm text-ink/60">{formatDate(project.critical_date)}</p>
                  </Link>
                ))
              ) : (
                <EmptyState>Sin fechas críticas en los próximos 30 días.</EmptyState>
              )}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Proyectos bloqueados</h3>
            <div className="mt-4 grid gap-3">
              {blockedProjects.length ? (
                blockedProjects.slice(0, 6).map((project) => (
                  <Link className="rounded-lg border border-line p-4 transition hover:border-forest/40" href={`/proyectos/${project.id}`} key={project.id}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{project.name}</p>
                      <StatusBadge value={project.traffic_light} />
                    </div>
                    <p className="mt-1 text-sm text-ink/60">{project.main_risk ?? "Sin riesgo descrito"}</p>
                  </Link>
                ))
              ) : (
                <EmptyState>No hay bloqueos registrados.</EmptyState>
              )}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Responsables y pendientes</h3>
            <div className="mt-4 grid gap-3">
              {activeProjects.slice(0, 8).map((project) => (
                <Link className="rounded-lg border border-line p-4 transition hover:border-forest/40" href={`/proyectos/${project.id}`} key={project.id}>
                  <p className="font-semibold">{project.name}</p>
                  <p className="mt-1 text-sm text-ink/60">{fullName(project.main_responsible)}</p>
                </Link>
              ))}
              {activeProjects.length === 0 ? <EmptyState>No hay proyectos activos visibles.</EmptyState> : null}
            </div>
          </Panel>
        </div>

        {noNextStep.length || incompleteProjects.length ? (
          <Panel>
            <h3 className="text-lg font-bold">Alertas operativas</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {noNextStep.slice(0, 6).map((project) => (
                <Link className="rounded-lg border border-amber-100 bg-amber-50/50 p-4" href={`/proyectos/${project.id}`} key={`step-${project.id}`}>
                  <p className="font-semibold">{project.name}</p>
                  <p className="mt-1 text-sm text-amber-900">Sin próximo paso.</p>
                </Link>
              ))}
              {incompleteProjects.slice(0, 6).map((project) => (
                <Link className="rounded-lg border border-amber-100 bg-amber-50/50 p-4" href={`/proyectos/${project.id}`} key={`incomplete-${project.id}`}>
                  <p className="font-semibold">{project.name}</p>
                  <p className="mt-1 text-sm text-amber-900">Proyecto operativo incompleto.</p>
                </Link>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}
