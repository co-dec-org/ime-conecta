import type { SectionContent } from "../data/content";

type HeroSectionProps = {
  section: SectionContent;
  onExplore: () => void;
  onIndex: () => void;
  onPresentation: () => void;
};

export default function HeroSection({
  section,
  onExplore,
  onIndex,
  onPresentation,
}: HeroSectionProps) {
  return (
    <section
      className="slide hero-slide"
      id={section.id}
      data-section
      aria-labelledby={`${section.id}-title`}
    >
      <div className="hero-network" aria-hidden="true">
        <span className="network-line line-a" />
        <span className="network-line line-b" />
        <span className="network-line line-c" />
        <span className="network-node node-a">Socios/as</span>
        <span className="network-node node-b">Acuerdos</span>
        <span className="network-node node-c">Comites</span>
        <span className="network-node node-d">Datos</span>
        <span className="network-node node-e">IME Link 2027</span>
      </div>

      <div className="hero-content">
        <p className="eyebrow">{section.eyebrow}</p>
        <h1 id={`${section.id}-title`}>{section.title}</h1>
        <p className="hero-subtitle">{section.subtitle}</p>

        <div className="hero-authors" aria-label="Autoria">
          {section.authors?.map((author) => <span key={author}>{author}</span>)}
        </div>

        <div className="hero-actions">
          <button className="primary-action" type="button" onClick={onExplore}>
            Explorar propuesta
          </button>
          <button className="secondary-action" type="button" onClick={onIndex}>
            Ver indice
          </button>
          <button
            className="secondary-action"
            type="button"
            onClick={onPresentation}
          >
            Activar modo presentacion
          </button>
        </div>
      </div>
    </section>
  );
}
