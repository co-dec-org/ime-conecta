// Captura de trazas de navegación (capa privada).
// Scaffolding con adaptador local; el adaptador Supabase se implementará al conectar el backend.
// Cumplimiento por diseño: solo captura si hay consentimiento de tracking vigente.

import { hasConsent } from "./consent";

export type TraceEventType =
  | "view"
  | "dwell"
  | "scroll"
  | "click"
  | "download"
  | "audio";

export type TraceEvent = {
  asset: string; // sección / activo digital
  eventType: TraceEventType;
  dwellMs?: number;
  at: string; // ISO 8601
};

export interface TraceAdapter {
  capture(event: TraceEvent): Promise<void>;
  list(): Promise<TraceEvent[]>;
  clear(): Promise<void>;
}

const LOCAL_KEY = "ime-conecta-traces";
const MAX_EVENTS = 1000;

// Adaptador local (sin backend) — para desarrollo y pruebas del scaffolding.
export class LocalTraceAdapter implements TraceAdapter {
  async capture(event: TraceEvent): Promise<void> {
    const list = await this.list();
    list.push(event);
    const trimmed = list.slice(-MAX_EVENTS);
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(trimmed));
    } catch {
      // sin almacenamiento; no persiste
    }
  }
  async list(): Promise<TraceEvent[]> {
    try {
      const raw = window.localStorage.getItem(LOCAL_KEY);
      return raw ? (JSON.parse(raw) as TraceEvent[]) : [];
    } catch {
      return [];
    }
  }
  async clear(): Promise<void> {
    try {
      window.localStorage.removeItem(LOCAL_KEY);
    } catch {
      // no-op
    }
  }
}

// Stub del adaptador Supabase — pendiente de implementación en la capa privada.
export class SupabaseTraceAdapter implements TraceAdapter {
  async capture(): Promise<void> {
    throw new Error("SupabaseTraceAdapter pendiente (capa privada).");
  }
  async list(): Promise<TraceEvent[]> {
    throw new Error("SupabaseTraceAdapter pendiente (capa privada).");
  }
  async clear(): Promise<void> {
    throw new Error("SupabaseTraceAdapter pendiente (capa privada).");
  }
}

export class TraceClient {
  private adapter: TraceAdapter;
  constructor(adapter: TraceAdapter = new LocalTraceAdapter()) {
    this.adapter = adapter;
  }
  // Devuelve true si capturó; false si no hay consentimiento de tracking.
  async capture(
    asset: string,
    eventType: TraceEventType,
    dwellMs?: number,
  ): Promise<boolean> {
    if (!hasConsent("tracking")) return false;
    const event: TraceEvent = {
      asset,
      eventType,
      at: new Date().toISOString(),
    };
    if (typeof dwellMs === "number") event.dwellMs = dwellMs;
    await this.adapter.capture(event);
    return true;
  }
  async export(): Promise<TraceEvent[]> {
    return this.adapter.list();
  }
  async erase(): Promise<void> {
    return this.adapter.clear();
  }
}
