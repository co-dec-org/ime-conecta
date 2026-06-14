import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { SectionContent } from "../data/content";
import { useLocalStorage } from "../hooks/useLocalStorage";

type FloatingNotesProps = {
  activeSection: SectionContent;
};

type NotesBySection = Record<string, string>;
type NotePosition = {
  x: number;
  y: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

type MouseDragState = Omit<DragState, "pointerId">;

const defaultPosition: NotePosition = {
  x: 24,
  y: 132,
};

const clampPosition = (
  position: NotePosition,
  panelOpen: boolean,
): NotePosition => {
  if (typeof window === "undefined") {
    return position;
  }

  const widgetWidth = panelOpen ? 390 : 76;
  const widgetHeight = panelOpen ? 430 : 64;
  const margin = 14;

  return {
    x: Math.min(
      Math.max(margin, position.x),
      Math.max(margin, window.innerWidth - widgetWidth - margin),
    ),
    y: Math.min(
      Math.max(margin, position.y),
      Math.max(margin, window.innerHeight - widgetHeight - margin),
    ),
  };
};

export default function FloatingNotes({ activeSection }: FloatingNotesProps) {
  const [notes, setNotes] = useLocalStorage<NotesBySection>(
    "ime-conecta-slide-notes",
    {},
  );
  const [position, setPosition] = useLocalStorage<NotePosition>(
    "ime-conecta-slide-notes-position",
    defaultPosition,
  );
  const [isOpen, setIsOpen] = useLocalStorage(
    "ime-conecta-slide-notes-open",
    false,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const dragRef = useRef<DragState | null>(null);
  const mouseDragRef = useRef<MouseDragState | null>(null);
  const movedRef = useRef(false);

  const note = notes[activeSection.id] ?? "";
  const notesCount = useMemo(
    () => Object.values(notes).filter((value) => value.trim()).length,
    [notes],
  );

  useEffect(() => {
    setSaveFeedback("");
  }, [activeSection.id]);

  useEffect(() => {
    const placeDefault = () => {
      const nextPosition =
        position.x === defaultPosition.x && position.y === defaultPosition.y
          ? {
              x: Math.max(14, window.innerWidth - 414),
              y: Math.max(96, window.innerHeight - 520),
            }
          : position;

      const clampedPosition = clampPosition(nextPosition, isOpen);

      if (
        clampedPosition.x !== position.x ||
        clampedPosition.y !== position.y
      ) {
        setPosition(clampedPosition);
      }
    };

    placeDefault();
    window.addEventListener("resize", placeDefault);
    return () => window.removeEventListener("resize", placeDefault);
  }, [isOpen, position, setPosition]);

  useEffect(() => {
    const movePointerDrag = (event: PointerEvent) => {
      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
        movedRef.current = true;
      }

      setPosition(
        clampPosition(
          {
            x: drag.originX + deltaX,
            y: drag.originY + deltaY,
          },
          isOpen,
        ),
      );
    };

    const endPointerDrag = (event: PointerEvent) => {
      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      dragRef.current = null;
      setIsDragging(false);
    };

    const moveMouseDrag = (event: MouseEvent) => {
      const drag = mouseDragRef.current;

      if (!drag) {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
        movedRef.current = true;
      }

      setPosition(
        clampPosition(
          {
            x: drag.originX + deltaX,
            y: drag.originY + deltaY,
          },
          isOpen,
        ),
      );
    };

    const endMouseDrag = () => {
      if (!mouseDragRef.current) {
        return;
      }

      mouseDragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", movePointerDrag);
    window.addEventListener("pointerup", endPointerDrag);
    window.addEventListener("pointercancel", endPointerDrag);
    window.addEventListener("mousemove", moveMouseDrag);
    window.addEventListener("mouseup", endMouseDrag);
    return () => {
      window.removeEventListener("pointermove", movePointerDrag);
      window.removeEventListener("pointerup", endPointerDrag);
      window.removeEventListener("pointercancel", endPointerDrag);
      window.removeEventListener("mousemove", moveMouseDrag);
      window.removeEventListener("mouseup", endMouseDrag);
    };
  }, [isOpen, setPosition]);

  const updateNote = (value: string) => {
    setSaveFeedback("");
    setNotes({
      ...notes,
      [activeSection.id]: value,
    });
  };

  const clearNote = () => {
    const nextNotes = { ...notes };
    delete nextNotes[activeSection.id];
    setSaveFeedback("");
    setNotes(nextNotes);
  };

  const submitNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!note.trim()) {
      return;
    }

    setNotes({
      ...notes,
      [activeSection.id]: note,
    });
    setSaveFeedback("Nota enviada");
  };

  const startDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    movedRef.current = false;
    setIsDragging(true);

    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const startMouseDrag = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || dragRef.current) {
      return;
    }

    mouseDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    movedRef.current = false;
    setIsDragging(true);
  };

  const moveDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;

      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - drag.startX;
      const deltaY = event.clientY - drag.startY;

      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
        movedRef.current = true;
      }

      setPosition(
        clampPosition(
          {
            x: drag.originX + deltaX,
            y: drag.originY + deltaY,
          },
          isOpen,
        ),
      );
    },
    [isOpen, setPosition],
  );

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;

    if (
      drag?.pointerId === event.pointerId &&
      typeof event.currentTarget.releasePointerCapture === "function"
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;
    setIsDragging(false);
  };

  const toggleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (movedRef.current) {
      event.preventDefault();
      movedRef.current = false;
      return;
    }

    setIsOpen(!isOpen);
  };

  return (
    <aside
      className="floating-notes"
      data-open={isOpen}
      data-dragging={isDragging}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      aria-label="Notas por lamina"
    >
      <button
        type="button"
        className="notes-handle"
        onClick={toggleOpen}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseDown={startMouseDrag}
        aria-expanded={isOpen}
      >
        <span>N</span>
        <strong>{notesCount}</strong>
      </button>

      {isOpen ? (
        <form className="notes-panel" onSubmit={submitNote}>
          <header className="notes-header">
            <div>
              <span>Nota</span>
              <strong>{activeSection.navLabel}</strong>
            </div>
            <button type="button" onClick={() => setIsOpen(false)}>
              Cerrar
            </button>
          </header>

          <textarea
            value={note}
            onChange={(event) => updateNote(event.target.value)}
            placeholder="Escribe notas para esta lamina..."
            aria-label={`Notas para ${activeSection.navLabel}`}
          />

          <footer className="notes-footer">
            <span>
              {saveFeedback || `${note.trim().length} caracteres`}
            </span>
            <div className="notes-footer-actions">
              <button type="button" onClick={clearNote} disabled={!note.trim()}>
                Limpiar
              </button>
              <button
                type="submit"
                className="notes-submit"
                disabled={!note.trim()}
              >
                Enviar nota
              </button>
            </div>
          </footer>
        </form>
      ) : null}
    </aside>
  );
}
