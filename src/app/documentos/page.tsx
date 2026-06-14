import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DocumentLinkForm } from "@/components/record-forms";
import { EmptyState, Panel } from "@/components/ui";
import { createDocumentLink, deleteDocumentLink } from "@/lib/actions";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { loadProjects } from "@/lib/loaders";
import type { DocumentLink } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const { supabase, profile } = await requireProfile();
  const projects = await loadProjects(supabase);
  const { data } = await supabase.from("document_links").select("*").order("created_at", { ascending: false });
  const documents = (data ?? []) as DocumentLink[];
  const projectById = new Map(projects.map((project) => [project.id, project]));

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Respaldo manual</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Enlaces documentales</h2>
        </header>

        <Panel>
          <h3 className="text-lg font-bold">Agregar enlace</h3>
          <div className="mt-5">
            <DocumentLinkForm action={createDocumentLink} projects={projects} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Listado</h3>
          <div className="mt-4 grid gap-3">
            {documents.length ? (
              documents.map((document) => {
                const project = projectById.get(document.project_id);
                return (
                  <div className="rounded-lg border border-line bg-white p-4" key={document.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <a className="font-semibold text-forest hover:underline" href={document.url} rel="noreferrer" target="_blank">{document.title}</a>
                        <p className="mt-1 text-sm text-ink/60">
                          {document.location} · {document.document_type} · {formatDate(document.document_date)}
                        </p>
                        {project ? <Link className="mt-2 inline-block text-sm font-semibold text-forest hover:underline" href={`/proyectos/${project.id}`}>{project.name}</Link> : null}
                      </div>
                      <form action={deleteDocumentLink.bind(null, document.id, document.project_id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>No hay enlaces visibles.</EmptyState>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
