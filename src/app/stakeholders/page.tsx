import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StakeholderForm } from "@/components/record-forms";
import { EmptyState, Panel } from "@/components/ui";
import { createStakeholder, deleteStakeholder } from "@/lib/actions";
import { requireProfile } from "@/lib/auth";
import { loadProjects } from "@/lib/loaders";
import type { Stakeholder } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StakeholdersPage() {
  const { supabase, profile } = await requireProfile();
  const projects = await loadProjects(supabase);
  const { data } = await supabase.from("stakeholders").select("*").order("name", { ascending: true });
  const stakeholders = (data ?? []) as Stakeholder[];
  const projectById = new Map(projects.map((project) => [project.id, project]));

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Mapa externo</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Stakeholders</h2>
        </header>

        <Panel>
          <h3 className="text-lg font-bold">Registrar stakeholder</h3>
          <div className="mt-5">
            <StakeholderForm action={createStakeholder} projects={projects} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Listado</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {stakeholders.length ? (
              stakeholders.map((stakeholder) => {
                const project = stakeholder.project_id ? projectById.get(stakeholder.project_id) : null;
                return (
                  <div className="rounded-lg border border-line bg-white p-4" key={stakeholder.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{stakeholder.name}</p>
                        <p className="mt-1 text-sm text-ink/60">{stakeholder.institution ?? "Sin institución"} · {stakeholder.actor_type}</p>
                        {project ? <Link className="mt-2 inline-block text-sm font-semibold text-forest hover:underline" href={`/proyectos/${project.id}`}>{project.name}</Link> : null}
                      </div>
                      <form action={deleteStakeholder.bind(null, stakeholder.id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>No hay stakeholders visibles.</EmptyState>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
