type GovernanceFlowProps = {
  steps: string[];
  renderText: (text: string) => React.ReactNode;
};

export default function GovernanceFlow({ steps, renderText }: GovernanceFlowProps) {
  return (
    <ol className="governance-flow">
      {steps.map((step, index) => (
        <li key={step}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{renderText(step)}</strong>
        </li>
      ))}
    </ol>
  );
}
