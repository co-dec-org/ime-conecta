/* ============================================================
   IME Conecta — Configuración pública de Supabase
   Base de datos COMÚN a los tres proyectos IME.
   Aquí solo va la clave PUBLICABLE (anon). NUNCA la service_role.
   ------------------------------------------------------------
   Pendiente antes del deploy:
   - Verificar que la ANON KEY esté ROTADA (la anterior quedó expuesta).
   - Registrar el dominio de este sitio en Supabase → Auth → URL config.
   ============================================================ */

window.IME_SUPABASE = {
  // Proyecto Supabase compartido de la trilogía IME.
  url: "https://nldxjciamqvoppvvclfi.supabase.co",

  // ⚠️ Anon/publishable key (pública por diseño, protegida por RLS). Verificar rotación.
  anonKey: "sb_publishable_z81yTosz9ieejddTj4NMqw_jFSVLBzV",

  // Separa las notas de ESTE sitio del resto de proyectos IME. Fija la identidad violeta-magenta.
  appKey: "ime-conecta",

  // Tablas compartidas del modelo de datos unificado.
  // El padrón de directores vive solo en la tabla ime_directors (con RLS).
  // No se listan correos personales en el cliente público (Ley 21.719: minimización).
  tables: { directors: "ime_directors", notes: "ime_section_notes" }
};
