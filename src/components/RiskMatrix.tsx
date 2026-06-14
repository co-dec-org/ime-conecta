import type { TableData } from "../data/content";
import StrategyTable from "./StrategyTable";

type RiskMatrixProps = {
  table: TableData;
  renderText: (text: string) => React.ReactNode;
};

export default function RiskMatrix({ table, renderText }: RiskMatrixProps) {
  return (
    <div className="risk-matrix">
      <StrategyTable
        table={table}
        caption="Matriz de riesgos y mitigaciones"
        renderText={renderText}
      />
    </div>
  );
}
