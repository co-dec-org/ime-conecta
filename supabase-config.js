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
  tables: { directors: "ime_directors", notes: "ime_section_notes" },

  // Mapa alias -> correo (solo correos públicos; sin contraseñas).
  directors: {
    "co-dec":  "co.dec.org@gmail.com",
    "teko":    "tekopamies@gmail.com",
    "max":     "max.johnson.la@gmail.com",
    "javier":  "jgonzaler@uc.cl",
    "josefa":  "mujicajf1@gmail.com",
    "ignacia": "ignacia.munoz@mail.udp.cl",
    "fran":    "franbakovic@gmail.com"
  }
};
