// Banner de consentimiento granular (capa privada). Scaffolding — aún no montado.
// Separa lo obligatorio (cuenta) de lo opcional (captura de trazas).
import { useState } from "react";
import { recordConsent, hasConsent } from "../lib/consent";

type ConsentBannerProps = {
  onDone?: () => void;
};

export default function ConsentBanner({ onDone }: ConsentBannerProps) {
  const [tracking, setTracking] = useState(false);
  const [done, setDone] = useState<boolean>(hasConsent("account"));

  if (done) return null;

  const accept = () => {
    recordConsent("account", true);
    recordConsent("tracking", tracking);
    setDone(true);
    if (onDone) onDone();
  };

  return (
    <div className="consent-banner" role="dialog" aria-label="Consentimiento de datos">
      <p className="consent-title">Antes de continuar</p>
      <p className="consent-text">
        Para crear tu cuenta tratamos tu correo y nombre. Opcionalmente puedes autorizar la
        captura de tus trazas de navegación para análisis y modelado.
      </p>
      <label className="consent-row">
        <input type="checkbox" checked readOnly aria-label="Consentimiento de cuenta (obligatorio)" />
        <span>Acepto el Aviso de Privacidad y el tratamiento de mi correo y nombre para gestionar mi cuenta.</span>
      </label>
      <label className="consent-row">
        <input
          type="checkbox"
          checked={tracking}
          onChange={(e) => setTracking(e.target.checked)}
          aria-label="Consentimiento de captura de trazas (opcional)"
        />
        <span>Autorizo (opcional) la captura de mis trazas de navegación para análisis y modelado.</span>
      </label>
      <button type="button" className="consent-accept" onClick={accept}>
        Continuar
      </button>
    </div>
  );
}
