import type { SectionContent } from "../data/content";

type SearchPanelProps = {
  query: string;
  matches: SectionContent[];
  onQueryChange: (query: string) => void;
  onNavigate: (id: string) => void;
};

export default function SearchPanel({
  query,
  matches,
  onQueryChange,
  onNavigate,
}: SearchPanelProps) {
  return (
    <section className="search-panel" aria-labelledby="search-title">
      <div className="rail-heading">
        <span id="search-title">Busqueda</span>
        {query ? <small>{matches.length} resultados</small> : null}
      </div>

      <label className="search-input">
        <span className="sr-only">Buscar por palabras clave</span>
        <input
          type="search"
          value={query}
          placeholder="Sercotec, datos, IME Conecta..."
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      {query ? (
        <div className="search-results">
          {matches.length ? (
            matches.slice(0, 6).map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => onNavigate(section.id)}
              >
                {section.navLabel}
              </button>
            ))
          ) : (
            <p>No hay secciones relacionadas.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
