import { ChartSpline } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyRow, MonthlySeriesId } from '../model';

const SERIES_COLORS: Record<MonthlySeriesId, string> = {
  customers: '#7c3aed',
  mrr: '#2563eb',
  arr: '#0891b2',
  grossProfit: '#16a34a',
  burn: '#dc2626',
  cumulativeCash: '#ea580c',
};

interface ExtraChartProps {
  rows: MonthlyRow[];
  seriesIds: MonthlySeriesId[];
  title: string;
}

export function ExtraChart({ rows, seriesIds, title }: ExtraChartProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-[#f8f7f3] shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <div className="flex items-center gap-2 border-b border-[#dedfd9] px-4 py-3.5">
        <ChartSpline aria-hidden="true" className="text-[#176f55]" size={17} strokeWidth={1.9} />
        <h2 className="text-sm font-semibold tracking-[-0.01em]">{title}</h2>
      </div>
      <div className="h-64 w-full px-2 pb-2 pt-4 sm:h-72 sm:px-4" role="img" aria-label={`${title} chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#dfe1dc" strokeDasharray="2 5" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#526059', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: '#526059', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                border: 0,
                borderRadius: 10,
                background: '#17211d',
                color: '#f7f8f5',
                boxShadow: '0 10px 24px rgba(23,33,29,0.2)',
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {seriesIds.map((seriesId) => (
              <Line
                key={seriesId}
                type="monotone"
                dataKey={seriesId}
                stroke={SERIES_COLORS[seriesId]}
                strokeWidth={2.25}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
