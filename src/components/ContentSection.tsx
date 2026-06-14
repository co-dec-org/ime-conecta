import type { ReactNode } from "react";
import type { SectionContent } from "../data/content";
import DecisionCards from "./DecisionCards";
import GovernanceFlow from "./GovernanceFlow";
import ProblemGrid from "./ProblemGrid";
import RiskMatrix from "./RiskMatrix";
import StrategyTable from "./StrategyTable";
import Timeline from "./Timeline";

type ContentSectionProps = {
  section: SectionContent;
  index: number;
  query: string;
  isSearchMatch: boolean;
  children?: ReactNode;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function HighlightedText({ text, query }: { text: string; query: string }) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmedQuery)})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={`${part}-${index}`}>{part}</mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

export default function ContentSection({
  section,
  index,
  query,
  isSearchMatch,
  children,
}: ContentSectionProps) {
  const renderText = (text: string) => (
    <HighlightedText text={text} query={query} />
  );

  return (
    <section
      className="slide content-slide"
      id={section.id}
      data-section
      data-search-dim={query ? !isSearchMatch : false}
      aria-labelledby={`${section.id}-title`}
      tabIndex={-1}
    >
      <div className="section-heading">
        <p className="eyebrow">Seccion {String(index + 1).padStart(2, "0")}</p>
        <h2 id={`${section.id}-title`}>{renderText(section.title)}</h2>
        {section.subtitle ? <p>{renderText(section.subtitle)}</p> : null}
      </div>

      <div className="section-body">
        {section.body ? <p>{renderText(section.body)}</p> : null}

        {section.definition ? (
          <p className="definition">{renderText(section.definition)}</p>
        ) : null}

        {section.highlight ? (
          <blockquote>{renderText(section.highlight)}</blockquote>
        ) : null}

        {section.bullets ? (
          <ul className="bullet-list">
            {section.bullets.map((item) => (
              <li key={item}>{renderText(item)}</li>
            ))}
          </ul>
        ) : null}

        {section.cards ? (
          <ProblemGrid cards={section.cards} renderText={renderText} />
        ) : null}

        {section.blocks ? (
          <div className="block-grid">
            {section.blocks.map((block) => (
              <span key={block}>{renderText(block)}</span>
            ))}
          </div>
        ) : null}

        {section.table && section.id === "riesgos" ? (
          <RiskMatrix table={section.table} renderText={renderText} />
        ) : null}

        {section.table && section.id !== "riesgos" ? (
          <StrategyTable
            table={section.table}
            caption={section.title}
            renderText={renderText}
          />
        ) : null}

        {section.comparison ? (
          <StrategyTable
            table={{
              columns: [
                section.comparison.leftTitle,
                section.comparison.rightTitle,
              ],
              rows: section.comparison.rows,
            }}
            caption={section.title}
            renderText={renderText}
          />
        ) : null}

        {section.flow ? (
          <GovernanceFlow steps={section.flow} renderText={renderText} />
        ) : null}

        {section.timeline ? (
          <Timeline timeline={section.timeline} renderText={renderText} />
        ) : null}

        {section.questions ? (
          <DecisionCards
            items={section.questions}
            variant="questions"
            renderText={renderText}
          />
        ) : null}

        {section.agreements ? (
          <DecisionCards
            items={section.agreements}
            variant="agreements"
            renderText={renderText}
          />
        ) : null}

        {section.phrases ? (
          <div className="phrase-stack">
            {section.phrases.map((phrase) => (
              <p key={phrase}>{renderText(phrase)}</p>
            ))}
          </div>
        ) : null}

        {children}
      </div>
    </section>
  );
}
