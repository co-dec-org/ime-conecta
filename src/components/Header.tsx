import type { ViewMode } from "../hooks/usePresentationMode";
import ThemeToggle from "./ThemeToggle";

type HeaderProps = {
  theme: "dark" | "light";
  mode: ViewMode;
  copied: boolean;
  fullscreenMessage: string;
  onThemeToggle: () => void;
  onCopySummary: () => void;
  onModeChange: (mode: ViewMode) => void;
  onFullscreen: () => void;
};

export default function Header({
  theme,
  mode,
  copied,
  fullscreenMessage,
  onThemeToggle,
  onCopySummary,
  onModeChange,
  onFullscreen,
}: HeaderProps) {
  const nextMode = mode === "presentation" ? "reading" : "presentation";

  return (
    <header className="site-header">
      <a className="brand-mark" href="#portada" aria-label="Ir a portada">
        <span className="brand-sigil" aria-hidden="true">
          <img src="/logo-ime-mark.png" alt="" className="brand-sigil-logo" />
        </span>
        <span>
          <strong>IME Conecta</strong>
          <small>Gobernanza operacional</small>
        </span>
      </a>

      <div className="header-actions" aria-label="Controles principales">
        <button
          className="toolbar-button"
          type="button"
          onClick={onCopySummary}
          aria-live="polite"
        >
          <span aria-hidden="true">{copied ? "OK" : "CP"}</span>
          <span>{copied ? "Copiado" : "Copiar resumen"}</span>
        </button>

        <ThemeToggle theme={theme} onToggle={onThemeToggle} />

        <button
          className="toolbar-button"
          type="button"
          onClick={() => onModeChange(nextMode)}
          aria-pressed={mode === "presentation"}
        >
          <span aria-hidden="true">{mode === "presentation" ? "LR" : "MP"}</span>
          <span>
            {mode === "presentation" ? "Modo lectura" : "Modo presentacion"}
          </span>
        </button>

        <button
          className="toolbar-button compact"
          type="button"
          onClick={onFullscreen}
          aria-label="Activar pantalla completa"
          title="Pantalla completa"
        >
          <span aria-hidden="true">FS</span>
          <span>Full</span>
        </button>
      </div>

      {fullscreenMessage ? (
        <p className="header-status" role="status">
          {fullscreenMessage}
        </p>
      ) : null}
    </header>
  );
}
