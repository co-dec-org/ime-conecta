import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProjectForm } from "@/components/project-form";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, Panel } from "@/components/ui";
import { createProject } from "@/lib/actions";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { attachProjectResponsible, loadProjects, loadPublicProfiles } from "@/lib/loaders";
import { fullName, projectIsIncomplete } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { supabase, profile } = await requireProfile();
  const profiles = await loadPublicProfiles(supabase);
  const projects = attachProjectResponsible(await loadProjects(supabase), profiles);

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Portafolio</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Proyectos</h2>
        </header>

        <Panel>
          <div className="mb-5 flex items-center gap-2">
            <Plus className="text-forest" size={20} />
            <h3 className="text-lg font-bold">Nuevo proyecto</h3>
          </div>
          <ProjectForm action={createProject} users={profiles} />
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Proyectos visibles</h3>
          <div className="mt-4 overflow-x-auto">
            {projects.length ? (
              <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-ink/50">
                  <tr>
                    <th className="px-3 py-2">Proyecto</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Prioridad</th>
                    <th className="px-3 py-2">Responsable</th>
                    <th className="px-3 py-2">Fecha crítica</th>
                    <th className="px-3 py-2">Operativo</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr className="bg-white shadow-sm" key={project.id}>
                      <td className="rounded-l-lg px-3 py-3">
                        <Link className="font-semibold text-forest hover:underline" href={`/proyectos/${project.id}`}>
                          {project.name}
                        </Link>
                        <p className="mt-1 text-xs text-ink/55">{project.strategic_line ?? "Sin línea estratégica"}</p>
                      </td>
                      <td className="px-3 py-3"><StatusBadge value={project.status} /></td>
                      <td className="px-3 py-3"><StatusBadge value={project.priority} /></td>
                      <td className="px-3 py-3">{fullName(project.main_responsible)}</td>
                      <td className="px-3 py-3">{formatDate(project.critical_date)}</td>
                      <td className="rounded-r-lg px-3 py-3">
                        {projectIsIncomplete(project) ? <StatusBadge value="Pendiente" /> : <StatusBadge value="Terminada" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState>No hay proyectos visibles para tu perfil.</EmptyState>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
