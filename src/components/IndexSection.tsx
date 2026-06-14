import type { SectionContent } from "../data/content";

type IndexSectionProps = {
  section: SectionContent;
  indexedSections: SectionContent[];
  onNavigate: (id: string) => void;
};

export default function IndexSection({
  section,
  indexedSections,
  onNavigate,
}: IndexSectionProps) {
  return (
    <section
      className="slide index-slide"
      id={section.id}
      data-section
      aria-labelledby={`${section.id}-title`}
    >
      <div className="section-heading">
        <p className="eyebrow">Mapa de la presentacion</p>
        <h2 id={`${section.id}-title`}>{section.title}</h2>
        <p>{section.body}</p>
      </div>

      <ol className="index-grid">
        {indexedSections.map((item, index) => (
          <li key={item.id}>
            <button type="button" onClick={() => onNavigate(item.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
