create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.authorized_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  login_username text unique,
  rut text,
  email text not null unique,
  phone text,
  position text,
  global_role text not null default 'lector' check (global_role in ('admin', 'director', 'editor', 'lector', 'socix')),
  status text not null default 'activo' check (status in ('activo', 'suspendido', 'revocado')),
  can_view_sensitive_data boolean not null default false,
  force_revalidation boolean not null default false,
  password_changed_at timestamptz,
  last_validated_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists authorized_users_email_lower_idx
  on public.authorized_users (lower(email));

create unique index if not exists authorized_users_login_username_lower_idx
  on public.authorized_users (lower(login_username))
  where login_username is not null;

create trigger authorized_users_set_updated_at
before update on public.authorized_users
for each row execute function public.set_updated_at();

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  record_type text not null default 'Proyecto' check (record_type in ('Proyecto', 'Oportunidad', 'Relación institucional', 'Proceso interno', 'Ruta estratégica')),
  strategic_line text,
  status text not null default 'Idea' check (status in ('Idea', 'En evaluación', 'Activo', 'Postulación', 'Ejecución', 'Bloqueado', 'Cerrado')),
  closure_status text check (closure_status is null or closure_status in ('Cerrado por ejecución', 'Cerrado por no admisibilidad', 'Cerrado por falta de tiempo', 'Cerrado por decisión de directorio', 'Cerrado y archivado')),
  priority text not null default 'Media' check (priority in ('Alta', 'Media', 'Baja')),
  traffic_light text not null default 'Gris' check (traffic_light in ('Verde', 'Amarillo', 'Rojo', 'Gris')),
  main_responsible_id uuid references public.authorized_users(id) on delete set null,
  committee_profile text,
  critical_date date,
  review_date date,
  next_step text,
  required_decision text,
  institutional_mandate text check (institutional_mandate is null or institutional_mandate in ('Idea no presentada', 'Presentado informalmente', 'En revisión por directorio', 'Aprobado por directorio', 'Requiere asamblea', 'Aprobado por asamblea', 'Rechazado', 'En pausa')),
  confidentiality_level text not null default 'Interna directorio' check (confidentiality_level in ('Pública', 'Interna directorio', 'Reservada', 'Sensible')),
  socix_visibility text not null default 'No visible' check (socix_visibility in ('No visible', 'Visible como resumen', 'Visible con hitos generales', 'Visible con llamado a participar')),
  main_risk text,
  document_backing_type text check (document_backing_type is null or document_backing_type in ('Hilo Gmail', 'Carpeta Drive', 'Acta directorio', 'Minuta', 'Bases de fondo', 'Formulario externo', 'Otro')),
  gmail_thread_url text,
  drive_folder_url text,
  main_document_url text,
  internal_notes text,
  created_by uuid references public.authorized_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create table if not exists public.project_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.authorized_users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('director_responsable', 'codirector', 'editor', 'comite', 'lector')),
  committee_profile_name text,
  created_at timestamptz not null default now(),
  unique (user_id, project_id, role)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  responsible_id uuid references public.authorized_users(id) on delete set null,
  due_date date,
  status text not null default 'Pendiente' check (status in ('Pendiente', 'En curso', 'Bloqueada', 'Terminada')),
  priority text not null default 'Media' check (priority in ('Alta', 'Media', 'Baja')),
  backing_url text,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create table if not exists public.external_meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  date date not null,
  institution text not null,
  ime_attendees text,
  objective text,
  prior_brief text,
  authorized_topics text,
  unauthorized_topics text,
  post_summary text,
  agreements text,
  next_steps text,
  gmail_url text,
  drive_url text,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger external_meetings_set_updated_at
before update on public.external_meetings
for each row execute function public.set_updated_at();

create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  decision text not null,
  instance text not null check (instance in ('Directorio', 'Asamblea', 'Reunión externa', 'Comité', 'Comisión', 'Otro')),
  date date not null,
  status text not null default 'Pendiente' check (status in ('Pendiente', 'Aprobado', 'Rechazado', 'En revisión', 'Ejecutado')),
  follow_up_responsible_id uuid references public.authorized_users(id) on delete set null,
  backing_url text,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger agreements_set_updated_at
before update on public.agreements
for each row execute function public.set_updated_at();

create table if not exists public.stakeholders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  institution text,
  role text,
  email text,
  phone text,
  actor_type text not null default 'Otro' check (actor_type in ('Institución pública', 'Gremio', 'Socio/a IME', 'Aliado', 'Financiamiento', 'Centro evaluador', 'Cooperativa', 'Otro')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger stakeholders_set_updated_at
before update on public.stakeholders
for each row execute function public.set_updated_at();

create table if not exists public.document_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  document_type text not null,
  url text not null,
  location text not null check (location in ('Gmail', 'Drive', 'Web externa', 'Otro')),
  version text,
  document_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger document_links_set_updated_at
before update on public.document_links
for each row execute function public.set_updated_at();

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  actor_user_id uuid references public.authorized_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.authorized_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create or replace view public.public_profiles as
select id, first_name, last_name, email, global_role, status
from public.authorized_users
where status = 'activo';

create or replace function public.current_authorized_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.authorized_users
  where auth_user_id = auth.uid()
    and status = 'activo'
  limit 1
$$;

create or replace function public.current_global_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select global_role
  from public.authorized_users
  where auth_user_id = auth.uid()
    and status = 'activo'
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_global_role() = 'admin', false)
$$;

create or replace function public.touch_current_authorized_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.authorized_users
  set last_active_at = now()
  where auth_user_id = auth.uid()
    and status = 'activo';
end;
$$;

create or replace function public.can_access_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_global_role() in ('admin', 'director', 'editor')
    or exists (
      select 1
      from public.project_memberships pm
      where pm.project_id = project_uuid
        and pm.user_id = public.current_authorized_user_id()
    )
    or exists (
      select 1
      from public.projects p
      where p.id = project_uuid
        and public.current_global_role() = 'lector'
        and p.confidentiality_level <> 'Sensible'
    )
    or exists (
      select 1
      from public.projects p
      where p.id = project_uuid
        and public.current_global_role() = 'socix'
        and p.confidentiality_level not in ('Reservada', 'Sensible')
        and p.socix_visibility <> 'No visible'
    ),
    false
  )
$$;

create or replace function public.can_edit_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_global_role() in ('admin', 'director', 'editor')
    or exists (
      select 1
      from public.project_memberships pm
      where pm.project_id = project_uuid
        and pm.user_id = public.current_authorized_user_id()
        and pm.role in ('director_responsable', 'codirector', 'editor', 'comite')
    ),
    false
  )
$$;

alter table public.authorized_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;
alter table public.tasks enable row level security;
alter table public.external_meetings enable row level security;
alter table public.agreements enable row level security;
alter table public.stakeholders enable row level security;
alter table public.document_links enable row level security;
alter table public.activity_logs enable row level security;
alter table public.audit_events enable row level security;

create policy "authorized users read self or admin"
on public.authorized_users for select
to authenticated
using (auth_user_id = auth.uid() or public.is_admin());

create policy "admins insert authorized users"
on public.authorized_users for insert
to authenticated
with check (public.is_admin());

create policy "admins update authorized users"
on public.authorized_users for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admins delete authorized users"
on public.authorized_users for delete
to authenticated
using (public.is_admin());

create policy "profiles visible to authenticated users"
on public.authorized_users for select
to service_role
using (true);

create policy "projects selectable by role"
on public.projects for select
to authenticated
using (public.can_access_project(id));

create policy "projects insertable by editors"
on public.projects for insert
to authenticated
with check (public.current_global_role() in ('admin', 'director', 'editor'));

create policy "projects editable by project editors"
on public.projects for update
to authenticated
using (public.can_edit_project(id))
with check (public.can_edit_project(id));

create policy "projects deletable by admins"
on public.projects for delete
to authenticated
using (public.is_admin());

create policy "memberships visible by project access"
on public.project_memberships for select
to authenticated
using (public.is_admin() or user_id = public.current_authorized_user_id() or public.can_access_project(project_id));

create policy "memberships managed by admins"
on public.project_memberships for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "tasks selectable by project access"
on public.tasks for select
to authenticated
using (project_id is null or public.can_access_project(project_id));

create policy "tasks insertable by project editors"
on public.tasks for insert
to authenticated
with check (project_id is null or public.can_edit_project(project_id));

create policy "tasks editable by project editors"
on public.tasks for update
to authenticated
using (project_id is null or public.can_edit_project(project_id))
with check (project_id is null or public.can_edit_project(project_id));

create policy "tasks deletable by project editors"
on public.tasks for delete
to authenticated
using (project_id is null or public.can_edit_project(project_id));

create policy "meetings selectable by project access"
on public.external_meetings for select
to authenticated
using (project_id is null or public.can_access_project(project_id));

create policy "meetings editable by project editors"
on public.external_meetings for all
to authenticated
using (project_id is null or public.can_edit_project(project_id))
with check (project_id is null or public.can_edit_project(project_id));

create policy "agreements selectable by project access"
on public.agreements for select
to authenticated
using (project_id is null or public.can_access_project(project_id));

create policy "agreements editable by project editors"
on public.agreements for all
to authenticated
using (project_id is null or public.can_edit_project(project_id))
with check (project_id is null or public.can_edit_project(project_id));

create policy "stakeholders selectable by project access"
on public.stakeholders for select
to authenticated
using (project_id is null or public.can_access_project(project_id));

create policy "stakeholders editable by project editors"
on public.stakeholders for all
to authenticated
using (project_id is null or public.can_edit_project(project_id))
with check (project_id is null or public.can_edit_project(project_id));

create policy "document links selectable by project access"
on public.document_links for select
to authenticated
using (public.can_access_project(project_id));

create policy "document links editable by project editors"
on public.document_links for all
to authenticated
using (public.can_edit_project(project_id))
with check (public.can_edit_project(project_id));

create policy "activity logs selectable by project access"
on public.activity_logs for select
to authenticated
using (project_id is null or public.can_access_project(project_id));

create policy "activity logs insertable by authenticated users"
on public.activity_logs for insert
to authenticated
with check (actor_user_id = public.current_authorized_user_id());

create policy "audit events selectable by admins"
on public.audit_events for select
to authenticated
using (public.is_admin());

create policy "audit events insertable by admins"
on public.audit_events for insert
to authenticated
with check (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select on public.public_profiles to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all routines in schema public to authenticated;
