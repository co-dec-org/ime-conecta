import Link from "next/link";
import { AgreementForm } from "@/components/record-forms";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, Panel } from "@/components/ui";
import { createAgreement, deleteAgreement, updateAgreementStatus } from "@/lib/actions";
import { requireProfile } from "@/lib/auth";
import { AGREEMENT_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import { loadProjects, loadPublicProfiles } from "@/lib/loaders";
import type { Agreement } from "@/lib/types";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AgreementsPage() {
  const { supabase, profile } = await requireProfile();
  const [projects, profiles] = await Promise.all([loadProjects(supabase), loadPublicProfiles(supabase)]);
  const { data } = await supabase
    .from("agreements")
    .select("*")
    .order("date", { ascending: false });
  const agreements = (data ?? []) as Agreement[];
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const profileById = new Map(profiles.map((item) => [item.id, item]));

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Gobernanza</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Acuerdos</h2>
        </header>

        <Panel>
          <h3 className="text-lg font-bold">Registrar acuerdo</h3>
          <div className="mt-5">
            <AgreementForm action={createAgreement} projects={projects} users={profiles} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Listado</h3>
          <div className="mt-4 grid gap-3">
            {agreements.length ? (
              agreements.map((agreement) => {
                const project = agreement.project_id ? projectById.get(agreement.project_id) : null;
                return (
                  <div className="rounded-lg border border-line bg-white p-4" key={agreement.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{agreement.decision}</p>
                        <p className="mt-1 text-sm text-ink/60">
                          {agreement.instance} · {formatDate(agreement.date)} · {project ? <Link className="text-forest hover:underline" href={`/proyectos/${project.id}`}>{project.name}</Link> : "Sin proyecto"}
                        </p>
                        <p className="mt-1 text-sm text-ink/60">
                          Seguimiento: {fullName(agreement.follow_up_responsible_id ? profileById.get(agreement.follow_up_responsible_id) : null)}
                        </p>
                      </div>
                      <StatusBadge value={agreement.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={updateAgreementStatus.bind(null, agreement.id, agreement.project_id)}>
                        <div className="flex gap-2">
                          <select className="focus-ring min-h-9 rounded-md border border-line px-2 text-sm" name="status" defaultValue={agreement.status}>
                            {AGREEMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
                          </select>
                          <button className="focus-ring rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" type="submit">Actualizar</button>
                        </div>
                      </form>
                      <form action={deleteAgreement.bind(null, agreement.id, agreement.project_id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>No hay acuerdos visibles.</EmptyState>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
