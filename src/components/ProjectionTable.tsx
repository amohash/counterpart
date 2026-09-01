import { TableProperties } from 'lucide-react';
import type { MonthlyRow } from '../model';

interface ProjectionTableProps {
  rows: MonthlyRow[];
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function ProjectionTable({ rows }: ProjectionTableProps) {
  return (
    <section className="overflow-hidden rounded-none bg-[#ffffff] shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <div className="flex items-center justify-between border-b border-[#e4e3dc] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <TableProperties aria-hidden="true" className="text-[#8a6a26]" size={17} strokeWidth={1.9} />
          <h2 className="text-sm font-semibold tracking-[-0.01em]">Projection detail</h2>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b928c]">Monthly</span>
      </div>
      <div className="max-h-96 overflow-auto" tabIndex={0} aria-label="Scrollable projection table">
      <table className="tabular-nums min-w-[780px] w-full text-right text-xs sm:text-sm">
        <thead className="sticky top-0 z-10 bg-[#e4e3dc] text-[#4d5952] shadow-[0_1px_0_#e4e3dc]">
          <tr>
            <th className="px-3 py-2.5 text-left font-semibold">Month</th>
            <th className="px-3 py-2.5 font-semibold">Customers</th>
            <th className="px-3 py-2.5 font-semibold">MRR</th>
            <th className="px-3 py-2.5 font-semibold">ARR</th>
            <th className="px-3 py-2.5 font-semibold">Gross profit</th>
            <th className="px-3 py-2.5 font-semibold">Burn</th>
            <th className="px-3 py-2.5 font-semibold">Cumulative cash</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month} className="border-t border-[#e4e3dc] transition-colors hover:bg-[#f0efe9]">
              <td className="px-3 py-2.5 text-left font-semibold text-[#55605a]">{row.month}</td>
              <td className="px-3 py-2.5">{formatter.format(row.customers)}</td>
              <td className="px-3 py-2.5">{formatter.format(row.mrr)}</td>
              <td className="px-3 py-2.5">{formatter.format(row.arr)}</td>
              <td className="px-3 py-2.5">{formatter.format(row.grossProfit)}</td>
              <td className="px-3 py-2.5">{formatter.format(row.burn)}</td>
              <td className={`px-3 py-2.5 font-medium ${row.cumulativeCash < 0 ? 'text-[#0b0d0c]' : 'text-[#8a6a26]'}`}>
                {formatter.format(row.cumulativeCash)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}
