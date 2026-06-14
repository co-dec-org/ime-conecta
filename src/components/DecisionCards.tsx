type DecisionCardsProps = {
  items: string[];
  variant: "questions" | "agreements";
  renderText: (text: string) => React.ReactNode;
};

export default function DecisionCards({
  items,
  variant,
  renderText,
}: DecisionCardsProps) {
  return (
    <div className={`decision-grid ${variant}`}>
      {items.map((item, index) => (
        <article key={item} className="decision-card">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{renderText(item)}</p>
        </article>
      ))}
    </div>
  );
}
