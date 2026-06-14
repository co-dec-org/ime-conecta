import { documentLinks } from "../data/content";

export default function DownloadPanel() {
  return (
    <section className="download-panel" aria-labelledby="downloads-title">
      <div>
        <p className="eyebrow">Documentos asociados</p>
        <h3 id="downloads-title">Material DOCX, PDF y PPTX</h3>
      </div>

      <div className="download-grid">
        {documentLinks.map((document) => (
          <a key={document.path} href={document.path} download>
            <span>{document.label}</span>
            <small>{document.meta}</small>
          </a>
        ))}
      </div>
    </section>
  );
}
