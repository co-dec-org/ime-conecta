import type { ReactNode } from "react";

type ProblemGridProps = {
  cards: string[];
  renderText: (text: string) => ReactNode;
};

export default function ProblemGrid({ cards, renderText }: ProblemGridProps) {
  return (
    <div className="problem-grid">
      {cards.map((card) => (
        <article key={card} className="problem-card">
          <span aria-hidden="true" />
          <p>{renderText(card)}</p>
        </article>
      ))}
    </div>
  );
}
