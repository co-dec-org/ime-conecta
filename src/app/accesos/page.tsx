import { AppShell } from "@/components/app-shell";
import { AuthorizedUserForm, ProjectRoleForm } from "@/components/record-forms";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, Panel } from "@/components/ui";
import {
  assignProjectRole,
  createAuthorizedUser,
  forceUserValidation,
  removeProjectRole,
  resetInitialPassword,
  updateAuthorizedUserStatus
} from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { USER_STATUSES } from "@/lib/constants";
import { formatDateTime } from "@/lib/date";
import { loadProjects, loadPublicProfiles } from "@/lib/loaders";
import type { AuthorizedUser, ProjectRole } from "@/lib/types";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccessPage() {
  const { supabase, profile } = await requireRole(["admin"]);
  const [projects, publicProfiles] = await Promise.all([loadProjects(supabase), loadPublicProfiles(supabase)]);
  const { data: usersData } = await supabase
    .from("authorized_users")
    .select("*")
    .order("last_name", { ascending: true });
  const { data: membershipsData } = await supabase
    .from("project_memberships")
    .select("*")
    .order("created_at", { ascending: false });

  const users = (usersData ?? []) as AuthorizedUser[];
  const memberships = (membershipsData ?? []) as ProjectRole[];
  const userById = new Map(users.map((user) => [user.id, user]));
  const projectById = new Map(projects.map((project) => [project.id, project]));

  return (
    <AppShell profile={profile}>
      <div className="grid gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Administración</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Accesos y perfiles</h2>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel>
            <h3 className="text-lg font-bold">Registrar correo autorizado</h3>
            <div className="mt-5">
              <AuthorizedUserForm action={createAuthorizedUser} />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-bold">Asignar rol por proyecto</h3>
            <div className="mt-5">
              <ProjectRoleForm action={assignProjectRole} users={publicProfiles} projects={projects} />
            </div>
          </Panel>
        </div>

        <Panel>
          <h3 className="text-lg font-bold">Usuarios autorizados</h3>
          <div className="mt-4 overflow-x-auto">
            {users.length ? (
              <table className="w-full min-w-[1050px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-ink/50">
                  <tr>
                    <th className="px-3 py-2">Usuario</th>
                    <th className="px-3 py-2">Contacto</th>
                    <th className="px-3 py-2">Perfil</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Último acceso</th>
                    <th className="px-3 py-2">Última validación</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr className="bg-white shadow-sm" key={user.id}>
                      <td className="rounded-l-lg px-3 py-3">
                        <p className="font-semibold">{fullName(user)}</p>
                        <p className="mt-1 text-xs text-ink/55">Usuario: {user.first_name}</p>
                        <p className="mt-1 text-xs text-ink/55">RUT: {user.rut ?? "No registrado"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p>{user.email}</p>
                        <p className="mt-1 text-xs text-ink/55">{user.phone ?? "Sin teléfono"}</p>
                      </td>
                      <td className="px-3 py-3">{user.global_role}</td>
                      <td className="px-3 py-3"><StatusBadge value={user.status} /></td>
                      <td className="px-3 py-3">{formatDateTime(user.last_active_at)}</td>
                      <td className="px-3 py-3">{formatDateTime(user.last_validated_at)}</td>
                      <td className="rounded-r-lg px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <form action={updateAuthorizedUserStatus.bind(null, user.id)}>
                            <div className="flex gap-2">
                              <select className="focus-ring min-h-9 rounded-md border border-line px-2 text-sm" name="status" defaultValue={user.status}>
                                {USER_STATUSES.map((status) => <option key={status}>{status}</option>)}
                              </select>
                              <button className="focus-ring rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" type="submit">Guardar</button>
                            </div>
                          </form>
                          <form action={forceUserValidation.bind(null, user.id)}>
                            <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Forzar validación</button>
                          </form>
                          <form action={resetInitialPassword.bind(null, user.id)}>
                            <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Clave inicial</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState>No hay usuarios autorizados.</EmptyState>
            )}
          </div>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Roles por proyecto</h3>
          <div className="mt-4 grid gap-3">
            {memberships.length ? (
              memberships.map((membership) => (
                <div className="rounded-lg border border-line bg-white p-4" key={membership.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{fullName(userById.get(membership.user_id))}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {projectById.get(membership.project_id)?.name ?? "Proyecto no visible"} · {membership.role}
                        {membership.committee_profile_name ? ` · ${membership.committee_profile_name}` : ""}
                      </p>
                    </div>
                    <form action={removeProjectRole.bind(null, membership.id)}>
                      <button className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-semibold" type="submit">Quitar</button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState>No hay roles por proyecto.</EmptyState>
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
