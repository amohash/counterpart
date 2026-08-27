import type { MonthlyRow } from '../model';

interface ProjectionTableProps {
  rows: MonthlyRow[];
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function ProjectionTable({ rows }: ProjectionTableProps) {
  return (
    <div className="max-h-96 overflow-y-auto rounded border border-gray-300">
      <table className="w-full text-right text-sm">
        <thead className="sticky top-0 bg-gray-100">
          <tr>
            <th className="p-2 text-left">Month</th>
            <th className="p-2">Customers</th>
            <th className="p-2">MRR</th>
            <th className="p-2">ARR</th>
            <th className="p-2">Gross profit</th>
            <th className="p-2">Burn</th>
            <th className="p-2">Cumulative cash</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month} className="border-t border-gray-200">
              <td className="p-2 text-left">{row.month}</td>
              <td className="p-2">{formatter.format(row.customers)}</td>
              <td className="p-2">{formatter.format(row.mrr)}</td>
              <td className="p-2">{formatter.format(row.arr)}</td>
              <td className="p-2">{formatter.format(row.grossProfit)}</td>
              <td className="p-2">{formatter.format(row.burn)}</td>
              <td className="p-2">{formatter.format(row.cumulativeCash)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
