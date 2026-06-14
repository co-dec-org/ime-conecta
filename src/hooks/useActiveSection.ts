import { useEffect, useState } from "react";

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return undefined;
    }

    if (typeof window.IntersectionObserver === "undefined") {
      const updateByScroll = () => {
        const sorted = elements
          .map((element) => ({
            id: element.id,
            distance: Math.abs(element.getBoundingClientRect().top),
          }))
          .sort((a, b) => a.distance - b.distance);

        setActiveId(sorted[0]?.id ?? sectionIds[0] ?? "");
      };

      updateByScroll();
      window.addEventListener("scroll", updateByScroll, { passive: true });
      return () => window.removeEventListener("scroll", updateByScroll);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries[0]?.target.id) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.75],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
