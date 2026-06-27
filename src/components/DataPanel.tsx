// Panel "Gestiona mis datos" (derechos ARSOPB). Scaffolding — opera sobre el adaptador local.
import { useEffect, useState } from "react";
import { TraceClient, type TraceEvent } from "../lib/traces";
import { consentHistory, recordConsent, clearConsents, hasConsent } from "../lib/consent";

const client = new TraceClient();

export default function DataPanel() {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [tracking, setTracking] = useState<boolean>(hasConsent("tracking"));

  const refresh = () => {
    void client.export().then(setEvents);
  };

  useEffect(() => {
    refresh();
  }, []);

  const download = () => {
    const payload = { consents: consentHistory(), traces: events };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mis-datos-ime-conecta.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const eraseAll = () => {
    void client.erase().then(() => {
      clearConsents();
      setTracking(false);
      refresh();
    });
  };

  const revoke = () => {
    recordConsent("tracking", false);
    setTracking(false);
  };

  return (
    <section className="data-panel" aria-label="Gestiona mis datos">
      <h2>Gestiona mis datos</h2>
      <p className="data-meta">
        Trazas registradas: {events.length} · Captura: {tracking ? "activa" : "desactivada"}
      </p>
      <div className="data-actions">
        <button type="button" onClick={download}>Descargar mis datos</button>
        <button type="button" onClick={revoke} disabled={!tracking}>Revocar captura de trazas</button>
        <button type="button" onClick={eraseAll}>Eliminar mis datos</button>
      </div>
      <p className="data-note">
        Scaffolding local. Sin backend ni datos personales: al conectar Supabase, estas acciones
        operarán sobre tu cuenta real (acceso, portabilidad y supresión).
      </p>
    </section>
  );
}
