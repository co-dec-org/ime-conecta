export const GLOBAL_ROLES = ["admin", "director", "editor", "lector", "socix"] as const;
export const USER_STATUSES = ["activo", "suspendido", "revocado"] as const;
export const PROJECT_ROLES = ["director_responsable", "codirector", "editor", "comite", "lector"] as const;

export const PROJECT_TYPES = [
  "Proyecto",
  "Oportunidad",
  "Relación institucional",
  "Proceso interno",
  "Ruta estratégica"
] as const;

export const PROJECT_STATUSES = [
  "Idea",
  "En evaluación",
  "Activo",
  "Postulación",
  "Ejecución",
  "Bloqueado",
  "Cerrado"
] as const;

export const CLOSURE_STATUSES = [
  "Cerrado por ejecución",
  "Cerrado por no admisibilidad",
  "Cerrado por falta de tiempo",
  "Cerrado por decisión de directorio",
  "Cerrado y archivado"
] as const;

export const PRIORITIES = ["Alta", "Media", "Baja"] as const;
export const TRAFFIC_LIGHTS = ["Verde", "Amarillo", "Rojo", "Gris"] as const;

export const MANDATES = [
  "Idea no presentada",
  "Presentado informalmente",
  "En revisión por directorio",
  "Aprobado por directorio",
  "Requiere asamblea",
  "Aprobado por asamblea",
  "Rechazado",
  "En pausa"
] as const;

export const CONFIDENTIALITY_LEVELS = ["Pública", "Interna directorio", "Reservada", "Sensible"] as const;

export const SOCIX_VISIBILITY = [
  "No visible",
  "Visible como resumen",
  "Visible con hitos generales",
  "Visible con llamado a participar"
] as const;

export const DOCUMENT_BACKING_TYPES = [
  "Hilo Gmail",
  "Carpeta Drive",
  "Acta directorio",
  "Minuta",
  "Bases de fondo",
  "Formulario externo",
  "Otro"
] as const;

export const TASK_STATUSES = ["Pendiente", "En curso", "Bloqueada", "Terminada"] as const;

export const AGREEMENT_INSTANCES = ["Directorio", "Asamblea", "Reunión externa", "Comité", "Comisión", "Otro"] as const;
export const AGREEMENT_STATUSES = ["Pendiente", "Aprobado", "Rechazado", "En revisión", "Ejecutado"] as const;

export const ACTOR_TYPES = [
  "Institución pública",
  "Gremio",
  "Socio/a IME",
  "Aliado",
  "Financiamiento",
  "Centro evaluador",
  "Cooperativa",
  "Otro"
] as const;

export const DOCUMENT_LOCATIONS = ["Gmail", "Drive", "Web externa", "Otro"] as const;

export const APP_TAGLINE =
  "IME Hub permite saber en qué va cada proyecto, quién lo lleva, qué falta y dónde está el respaldo documental.";
