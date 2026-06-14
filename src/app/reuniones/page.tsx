import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MeetingForm } from "@/components/record-forms";
import { EmptyState, Panel } from "@/components/ui";
import { createMeeting, deleteMeeting } from "@/lib/actions";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/date";
import { loadProjects } from "@/lib/loaders";
import type { Meeting } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const { supabase, profile } = await requireProfile();
  const projects = await loadProjects(supabase);
  const { data } = await supabase
    .from("external_meetings")
    .select("*")
    .order("date", { ascending: false });
  const meetings = (data ?? []) as Meeting[];
  const projectById = new Map(projects.map((project) => [project.id, project]));

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Relaciones externas</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Reuniones externas</h2>
        </header>

        <Panel>
          <h3 className="text-lg font-bold">Registrar reunión</h3>
          <div className="mt-5">
            <MeetingForm action={createMeeting} projects={projects} />
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Historial</h3>
          <div className="mt-4 grid gap-3">
            {meetings.length ? (
              meetings.map((meeting) => {
                const project = meeting.project_id ? projectById.get(meeting.project_id) : null;
                return (
                  <div className="rounded-lg border border-line bg-white p-4" key={meeting.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{meeting.institution}</p>
                        <p className="mt-1 text-sm text-ink/60">
                          {formatDate(meeting.date)} · {project ? <Link className="text-forest hover:underline" href={`/proyectos/${project.id}`}>{project.name}</Link> : "Sin proyecto"}
                        </p>
                      </div>
                      <form action={deleteMeeting.bind(null, meeting.id, meeting.project_id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                    {meeting.objective ? <p className="mt-3 text-sm text-ink/70">{meeting.objective}</p> : null}
                  </div>
                );
              })
            ) : (
              <EmptyState>No hay reuniones visibles.</EmptyState>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
