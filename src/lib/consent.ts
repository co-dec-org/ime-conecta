// Gestión de consentimiento (capa privada).
// Scaffolding: persiste en localStorage. Se reemplazará por Supabase al conectar el backend.
// Cumplimiento por diseño: registro auditable (versión de política + marca de tiempo).

export type ConsentScope = "account" | "tracking";

export type ConsentRecord = {
  scope: ConsentScope;
  granted: boolean;
  policyVersion: string;
  at: string; // ISO 8601
};

export const POLICY_VERSION = "0.1";
const KEY = "ime-conecta-consents";

function load(): ConsentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ConsentRecord[]) : [];
  } catch {
    return [];
  }
}

function save(list: ConsentRecord[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // almacenamiento no disponible; continúa sin persistir
  }
}

export function recordConsent(scope: ConsentScope, granted: boolean): ConsentRecord {
  const record: ConsentRecord = {
    scope,
    granted,
    policyVersion: POLICY_VERSION,
    at: new Date().toISOString(),
  };
  const list = load();
  list.push(record);
  save(list);
  return record;
}

export function hasConsent(scope: ConsentScope): boolean {
  const list = load().filter((c) => c.scope === scope);
  if (list.length === 0) return false;
  return list[list.length - 1].granted;
}

export function consentHistory(): ConsentRecord[] {
  return load();
}

export function clearConsents(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
