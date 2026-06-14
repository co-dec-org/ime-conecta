import type { TableData } from "../data/content";

type StrategyTableProps = {
  table: TableData;
  caption: string;
  renderText: (text: string) => React.ReactNode;
};

export default function StrategyTable({
  table,
  caption,
  renderText,
}: StrategyTableProps) {
  return (
    <div className="table-shell">
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column} scope="col">
                {renderText(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`}>{renderText(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
