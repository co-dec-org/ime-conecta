-- Calibración global de la gráfica viva (ime-skin) — sets por clase de dispositivo.
-- Base COMÚN a los tres sitios IME: se aplica UNA sola vez y sirve a
-- ime-link, ime-conecta e ime-planificacion.
--
-- Modelo: una fila por (sitio, clase de dispositivo) con los parámetros
-- de entrada del motor (radio, agitación, halo, suavizado, fuerzas, atractores).
-- Lectura pública: cada visitante recibe al cargar el set de su clase.
-- Escritura: solo la cuenta directora, desde el panel de calibración.

-- ── Tabla ─────────────────────────────────────────────────────────────────

create table if not exists public.ime_skin_calibracion (
  app_key      text not null check (app_key in ('ime-link','ime-conecta','ime-planificacion')),
  device_class text not null check (device_class in ('phone','tablet','desktop')),
  params       jsonb not null,
  updated_by   uuid references auth.users(id),
  updated_at   timestamptz not null default now(),
  primary key (app_key, device_class)
);

-- Mantener updated_at al día en cada actualización
create or replace function public.ime_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists ime_skin_calibracion_touch on public.ime_skin_calibracion;
create trigger ime_skin_calibracion_touch
  before update on public.ime_skin_calibracion
  for each row execute function public.ime_touch_updated_at();

-- ── Seguridad a nivel de fila (RLS) ───────────────────────────────────────

alter table public.ime_skin_calibracion enable row level security;

-- Cualquiera puede leer (incluye visitantes anónimos con la anon key)
drop policy if exists "skin_calibracion_lectura_publica" on public.ime_skin_calibracion;
create policy "skin_calibracion_lectura_publica"
  on public.ime_skin_calibracion for select
  using (true);

-- Solo la cuenta directora puede escribir
drop policy if exists "skin_calibracion_insert_directora" on public.ime_skin_calibracion;
create policy "skin_calibracion_insert_directora"
  on public.ime_skin_calibracion for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'co.dec.org@gmail.com');

drop policy if exists "skin_calibracion_update_directora" on public.ime_skin_calibracion;
create policy "skin_calibracion_update_directora"
  on public.ime_skin_calibracion for update to authenticated
  using ((auth.jwt() ->> 'email') = 'co.dec.org@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'co.dec.org@gmail.com');

drop policy if exists "skin_calibracion_delete_directora" on public.ime_skin_calibracion;
create policy "skin_calibracion_delete_directora"
  on public.ime_skin_calibracion for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'co.dec.org@gmail.com');
