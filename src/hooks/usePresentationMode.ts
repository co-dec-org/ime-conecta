import { useCallback, useEffect, useState } from "react";
import { smoothScrollToElement } from "../utils/smoothScroll";

export type ViewMode = "reading" | "presentation";

export function usePresentationMode(sectionIds: string[], activeId: string) {
  const [mode, setMode] = useState<ViewMode>("reading");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const index = Math.max(0, sectionIds.indexOf(activeId));
    setCurrentIndex(index);
  }, [activeId, sectionIds]);

  const goToIndex = useCallback(
    (requestedIndex: number) => {
      const nextIndex = Math.min(
        Math.max(requestedIndex, 0),
        Math.max(sectionIds.length - 1, 0),
      );
      const nextId = sectionIds[nextIndex];
      const element = nextId ? document.getElementById(nextId) : null;

      setCurrentIndex(nextIndex);

      smoothScrollToElement(element);
    },
    [sectionIds],
  );

  const next = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);

  const previous = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);

  useEffect(() => {
    document.body.classList.toggle("is-presenting", mode === "presentation");
    return () => document.body.classList.remove("is-presenting");
  }, [mode]);

  useEffect(() => {
    if (mode !== "presentation") {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }

      if (event.key === "Escape") {
        setMode("reading");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, next, previous]);

  return {
    mode,
    setMode,
    currentIndex,
    goToIndex,
    next,
    previous,
  };
}
