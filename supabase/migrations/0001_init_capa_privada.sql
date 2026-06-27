-- Capa privada de IME Conecta — esquema inicial.
-- Generado del diseño en Diseno_Modelo_Datos_Supabase_IME_Conecta.md
-- Aplicar SOLO tras la validación legal (consentimiento, aviso de privacidad).

-- ── Tablas ────────────────────────────────────────────────────────────────

-- Perfil mínimo, ligado a auth.users
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Consentimientos (auditable, versionado)
create table if not exists public.consents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  scope          text not null check (scope in ('account','tracking')),
  granted        boolean not null,
  policy_version text not null,
  channel        text not null default 'web',
  created_at     timestamptz not null default now()
);

-- Sesiones de navegación
create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);

-- Trazas: activo digital + tiempo + evento
create table if not exists public.nav_events (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references public.sessions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  asset       text not null,
  event_type  text not null check (event_type in ('view','dwell','scroll','click','download','audio')),
  dwell_ms    integer,
  value       jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists nav_events_user_time_idx on public.nav_events (user_id, occurred_at);
create index if not exists nav_events_asset_idx on public.nav_events (asset);

-- Datos agregados anonimizados (para el laboratorio; ya no son datos personales)
create table if not exists public.analytics_anonymized (
  asset        text not null,
  bucket_date  date not null,
  views        integer not null default 0,
  dwell_ms_avg integer,
  primary key (asset, bucket_date)
);

-- ── Seguridad a nivel de fila (RLS) ───────────────────────────────────────

alter table public.profiles   enable row level security;
alter table public.consents   enable row level security;
alter table public.sessions   enable row level security;
alter table public.nav_events enable row level security;

create policy "perfil propio" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "consentimientos propios" on public.consents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sesiones propias" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ¿Tiene consentimiento de tracking vigente?
create or replace function public.has_tracking_consent(uid uuid)
returns boolean language sql stable as $$
  select coalesce((
    select granted from public.consents
    where user_id = uid and scope = 'tracking'
    order by created_at desc limit 1
  ), false);
$$;

create policy "trazas propias - select" on public.nav_events
  for select using (auth.uid() = user_id);

-- Inserción de trazas SOLO con consentimiento vigente (cumplimiento por diseño)
create policy "trazas propias - insert con consentimiento" on public.nav_events
  for insert with check (auth.uid() = user_id and public.has_tracking_consent(auth.uid()));
