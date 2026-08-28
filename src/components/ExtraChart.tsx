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
    <div className="h-64 w-full rounded border border-gray-300 p-2">
      <p className="mb-1 text-sm font-medium">{title}</p>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {seriesIds.map((seriesId) => (
            <Line
              key={seriesId}
              type="monotone"
              dataKey={seriesId}
              stroke={SERIES_COLORS[seriesId]}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
