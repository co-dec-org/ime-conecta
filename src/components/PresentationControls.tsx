import type { ViewMode } from "../hooks/usePresentationMode";

type PresentationControlsProps = {
  mode: ViewMode;
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onModeChange: (mode: ViewMode) => void;
  onFullscreen: () => void;
};

export default function PresentationControls({
  mode,
  currentIndex,
  total,
  onPrevious,
  onNext,
  onModeChange,
  onFullscreen,
}: PresentationControlsProps) {
  return (
    <aside className="presentation-controls" aria-label="Controles de presentacion">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentIndex <= 0}
        aria-label="Seccion anterior"
      >
        <span aria-hidden="true">&lt;</span>
        Anterior
      </button>

      <p aria-live="polite">
        Seccion {currentIndex + 1} de {total}
      </p>

      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex >= total - 1}
        aria-label="Seccion siguiente"
      >
        Siguiente
        <span aria-hidden="true">&gt;</span>
      </button>

      <button
        className="control-secondary"
        type="button"
        onClick={() =>
          onModeChange(mode === "presentation" ? "reading" : "presentation")
        }
      >
        {mode === "presentation" ? "Lectura" : "Presentacion"}
      </button>

      <button className="control-secondary" type="button" onClick={onFullscreen}>
        Fullscreen
      </button>
    </aside>
  );
}
