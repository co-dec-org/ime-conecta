import type { SectionContent } from "../data/content";

type SectionNavProps = {
  sections: SectionContent[];
  activeId: string;
  matchedIds: Set<string>;
  query: string;
  onNavigate: (id: string) => void;
};

export default function SectionNav({
  sections,
  activeId,
  matchedIds,
  query,
  onNavigate,
}: SectionNavProps) {
  const renderItems = () =>
    sections.map((section, index) => {
      const isActive = section.id === activeId;
      const isMatch = !query || matchedIds.has(section.id);

      return (
        <li key={section.id}>
          <button
            type="button"
            className={isActive ? "active" : ""}
            data-muted={!isMatch}
            onClick={() => onNavigate(section.id)}
            aria-current={isActive ? "true" : undefined}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{section.navLabel}</strong>
          </button>
        </li>
      );
    });

  return (
    <>
      <nav className="section-nav" aria-label="Indice de secciones">
        <div className="rail-heading">
          <span>Indice</span>
          <small>{sections.length} secciones</small>
        </div>
        <ol>{renderItems()}</ol>
      </nav>

      <details className="mobile-section-nav">
        <summary>Indice de contenidos</summary>
        <ol>{renderItems()}</ol>
      </details>
    </>
  );
}
