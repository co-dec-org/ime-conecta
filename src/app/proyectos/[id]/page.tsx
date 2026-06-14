import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProjectForm } from "@/components/project-form";
import { AgreementForm, DocumentLinkForm, MeetingForm, StakeholderForm } from "@/components/record-forms";
import { StatusBadge } from "@/components/status-badge";
import { TaskForm } from "@/components/task-form";
import { EmptyState, Panel, SelectField, SubmitButton } from "@/components/ui";
import {
  createAgreement,
  createDocumentLink,
  createMeeting,
  createStakeholder,
  createTask,
  deleteAgreement,
  deleteDocumentLink,
  deleteMeeting,
  deleteProject,
  deleteTask,
  updateAgreementStatus,
  updateProject,
  updateTaskStatus
} from "@/lib/actions";
import { AGREEMENT_STATUSES, TASK_STATUSES } from "@/lib/constants";
import { requireProfile } from "@/lib/auth";
import { formatDate, formatDateTime, isPastDate } from "@/lib/date";
import { loadProjects, loadPublicProfiles } from "@/lib/loaders";
import type { ActivityLog, Agreement, DocumentLink, Meeting, Project, Stakeholder, Task } from "@/lib/types";
import { fullName, projectIsIncomplete } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireProfile();
  const profiles = await loadPublicProfiles(supabase);
  const projects = await loadProjects(supabase);
  const project = projects.find((item) => item.id === id) as Project | undefined;
  if (!project) notFound();

  const [tasksResult, meetingsResult, agreementsResult, stakeholdersResult, documentsResult, logsResult] = await Promise.all([
    supabase.from("tasks").select("*").eq("project_id", id).order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("external_meetings").select("*").eq("project_id", id).order("date", { ascending: false }),
    supabase.from("agreements").select("*").eq("project_id", id).order("date", { ascending: false }),
    supabase.from("stakeholders").select("*").eq("project_id", id).order("name", { ascending: true }),
    supabase.from("document_links").select("*").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("activity_logs").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(25)
  ]);

  const tasks = (tasksResult.data ?? []) as Task[];
  const meetings = (meetingsResult.data ?? []) as Meeting[];
  const agreements = (agreementsResult.data ?? []) as Agreement[];
  const stakeholders = (stakeholdersResult.data ?? []) as Stakeholder[];
  const documents = (documentsResult.data ?? []) as DocumentLink[];
  const logs = (logsResult.data ?? []) as ActivityLog[];
  const profileById = new Map(profiles.map((item) => [item.id, item]));
  const updateAction = updateProject.bind(null, id);
  const deleteProjectAction = deleteProject.bind(null, id);

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link className="text-sm font-semibold text-forest hover:underline" href="/proyectos">
              Proyectos
            </Link>
            <h2 className="mt-1 text-3xl font-bold text-ink">{project.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge value={project.status} />
              <StatusBadge value={project.priority} />
              <StatusBadge value={project.traffic_light} />
              {projectIsIncomplete(project) ? <StatusBadge value="Pendiente" /> : null}
            </div>
          </div>
          <form action={deleteProjectAction}>
            <button
              className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-danger hover:bg-red-50"
              title="Eliminar proyecto"
              type="submit"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </form>
        </header>

        <Panel>
          <h3 className="text-lg font-bold">Ficha del proyecto</h3>
          <div className="mt-5">
            <ProjectForm action={updateAction} users={profiles} project={project} />
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="text-lg font-bold">Tareas</h3>
            <div className="mt-4 grid gap-3">
              {tasks.length ? (
                tasks.map((task) => (
                  <div className={isPastDate(task.due_date) && task.status !== "Terminada" ? "rounded-lg border border-red-100 bg-red-50/40 p-4" : "rounded-lg border border-line p-4"} key={task.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="mt-1 text-sm text-ink/60">
                          {fullName(task.responsible_id ? profileById.get(task.responsible_id) : null)} · {formatDate(task.due_date)}
                        </p>
                      </div>
                      <StatusBadge value={task.status} />
                    </div>
                    {task.description ? <p className="mt-3 text-sm text-ink/70">{task.description}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={updateTaskStatus.bind(null, task.id, id)}>
                        <div className="flex gap-2">
                          <select className="focus-ring min-h-9 rounded-md border border-line px-2 text-sm" name="status" defaultValue={task.status}>
                            {TASK_STATUSES.map((status) => <option key={status}>{status}</option>)}
                          </select>
                          <button className="focus-ring rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" type="submit">Actualizar</button>
                        </div>
                      </form>
                      <form action={deleteTask.bind(null, task.id, id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState>Sin tareas registradas.</EmptyState>
              )}
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <TaskForm action={createTask} projects={projects} users={profiles} fixedProjectId={id} />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Acuerdos</h3>
            <div className="mt-4 grid gap-3">
              {agreements.length ? (
                agreements.map((agreement) => (
                  <div className="rounded-lg border border-line p-4" key={agreement.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{agreement.decision}</p>
                        <p className="mt-1 text-sm text-ink/60">{agreement.instance} · {formatDate(agreement.date)}</p>
                      </div>
                      <StatusBadge value={agreement.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <form action={updateAgreementStatus.bind(null, agreement.id, id)}>
                        <div className="flex gap-2">
                          <select className="focus-ring min-h-9 rounded-md border border-line px-2 text-sm" name="status" defaultValue={agreement.status}>
                            {AGREEMENT_STATUSES.map((status) => <option key={status}>{status}</option>)}
                          </select>
                          <button className="focus-ring rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" type="submit">Actualizar</button>
                        </div>
                      </form>
                      <form action={deleteAgreement.bind(null, agreement.id, id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState>Sin acuerdos registrados.</EmptyState>
              )}
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <AgreementForm action={createAgreement} projects={projects} users={profiles} fixedProjectId={id} />
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="text-lg font-bold">Enlaces documentales</h3>
            <div className="mt-4 grid gap-3">
              {documents.length ? (
                documents.map((document) => (
                  <div className="rounded-lg border border-line p-4" key={document.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <a className="font-semibold text-forest hover:underline" href={document.url} rel="noreferrer" target="_blank">
                          {document.title}
                        </a>
                        <p className="mt-1 text-sm text-ink/60">{document.location} · {document.document_type}</p>
                      </div>
                      <form action={deleteDocumentLink.bind(null, document.id, id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState>No hay enlaces documentales.</EmptyState>
              )}
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <DocumentLinkForm action={createDocumentLink} projects={projects} fixedProjectId={id} />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Reuniones externas</h3>
            <div className="mt-4 grid gap-3">
              {meetings.length ? (
                meetings.map((meeting) => (
                  <div className="rounded-lg border border-line p-4" key={meeting.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{meeting.institution}</p>
                        <p className="mt-1 text-sm text-ink/60">{formatDate(meeting.date)}</p>
                      </div>
                      <form action={deleteMeeting.bind(null, meeting.id, id)}>
                        <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Eliminar</button>
                      </form>
                    </div>
                    {meeting.objective ? <p className="mt-3 text-sm text-ink/70">{meeting.objective}</p> : null}
                  </div>
                ))
              ) : (
                <EmptyState>Sin reuniones registradas.</EmptyState>
              )}
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <MeetingForm action={createMeeting} projects={projects} fixedProjectId={id} />
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="text-lg font-bold">Stakeholders vinculados</h3>
            <div className="mt-4 grid gap-3">
              {stakeholders.length ? (
                stakeholders.map((stakeholder) => (
                  <div className="rounded-lg border border-line p-4" key={stakeholder.id}>
                    <p className="font-semibold">{stakeholder.name}</p>
                    <p className="mt-1 text-sm text-ink/60">{stakeholder.institution ?? "Sin institución"} · {stakeholder.actor_type}</p>
                  </div>
                ))
              ) : (
                <EmptyState>Sin stakeholders vinculados.</EmptyState>
              )}
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <StakeholderForm action={createStakeholder} projects={[project]} />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Bitácora de actividad</h3>
            <div className="mt-4 grid gap-3">
              {logs.length ? (
                logs.map((log) => (
                  <div className="rounded-lg border border-line p-4" key={log.id}>
                    <p className="font-semibold">{log.action}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {fullName(log.actor_user_id ? profileById.get(log.actor_user_id) : null)} · {formatDateTime(log.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState>No hay actividad registrada para este proyecto.</EmptyState>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
