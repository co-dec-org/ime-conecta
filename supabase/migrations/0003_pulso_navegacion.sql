-- Pulso de navegación — energía colectiva viva del campo generativo.
-- Base COMÚN a los tres sitios IME: aplicar UNA sola vez.
--
-- Expone a los visitantes anónimos SOLO un agregado (número de eventos
-- de navegación de la última hora por sitio), para que la gráfica viva
-- "respire" con la actividad real. No expone filas, sesiones ni datos
-- individuales: la RLS de ime_eventos sigue intacta.
--
-- Nota: asume que ime_eventos tiene columna created_at (timestamptz
-- default now()). Si la columna de fecha tiene otro nombre, ajustarlo.

create or replace function public.ime_pulso(p_app text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.ime_eventos
  where app_key = p_app
    and created_at > now() - interval '60 minutes';
$$;

revoke all on function public.ime_pulso(text) from public;
grant execute on function public.ime_pulso(text) to anon, authenticated;
