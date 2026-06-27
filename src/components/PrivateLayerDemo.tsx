// Demo local de la capa privada (scaffolding). Sin backend ni datos personales.
// Acceso: agregar ?demo=privada a la URL. No es parte del sitio público.
import { useState } from "react";
import ConsentBanner from "./ConsentBanner";
import DataPanel from "./DataPanel";
import { TraceClient } from "../lib/traces";
import { hasConsent } from "../lib/consent";

const client = new TraceClient();
const DEMO_ASSETS = ["portada", "gobernanza", "datos", "ime-conecta", "sercotec"];

export default function PrivateLayerDemo() {
  const [ready, setReady] = useState<boolean>(hasConsent("account"));
  const [tick, setTick] = useState(0);
  const [note, setNote] = useState("");

  const simulate = async () => {
    const asset = DEMO_ASSETS[Math.floor(Math.random() * DEMO_ASSETS.length)];
    const ok = await client.capture(asset, "dwell", Math.round(3000 + Math.random() * 15000));
    setNote(
      ok
        ? `Traza capturada: ${asset}`
        : "Sin consentimiento de trazas: no se capturó (cumplimiento por diseño).",
    );
    setTick((t) => t + 1);
  };

  return (
    <main className="private-demo">
      <h1>Capa privada — demo local</h1>
      <p className="private-demo-intro">
        Andamiaje sin backend ni datos personales. Las trazas y el consentimiento se guardan solo
        en este navegador (localStorage). Al conectar Supabase, estas mismas piezas operarán sobre
        tu cuenta real.
      </p>

      {!ready ? (
        <ConsentBanner onDone={() => setReady(true)} />
      ) : (
        <>
          <div className="private-demo-actions">
            <button type="button" onClick={simulate}>
              Simular navegación (capturar traza)
            </button>
          </div>
          {note && <p className="private-demo-note">{note}</p>}
          <DataPanel key={tick} />
        </>
      )}
    </main>
  );
}
