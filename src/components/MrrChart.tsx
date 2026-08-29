import { Activity } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyRow } from '../model';

interface MrrChartProps {
  rows: MonthlyRow[];
}

export function MrrChart({ rows }: MrrChartProps) {
  return (
    <section className="overflow-hidden rounded-xl bg-[#f8f7f3] shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <div className="flex items-center justify-between border-b border-[#dedfd9] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Activity aria-hidden="true" className="text-[#176f55]" size={17} strokeWidth={1.9} />
          <h2 className="text-sm font-semibold tracking-[-0.01em]">Monthly recurring revenue</h2>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#768078]">24-month view</span>
      </div>
      <div
        className="h-64 w-full px-2 pb-2 pt-4 sm:h-72 sm:px-4"
        role="img"
        aria-label="Monthly recurring revenue projection over 24 months"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#dfe1dc" strokeDasharray="2 5" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#526059', fontSize: 11 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={48}
              tick={{ fill: '#526059', fontSize: 11 }}
              tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
            />
            <Tooltip
              contentStyle={{
                border: 0,
                borderRadius: 10,
                background: '#17211d',
                color: '#f7f8f5',
                boxShadow: '0 10px 24px rgba(23,33,29,0.2)',
                fontSize: 12,
              }}
              labelStyle={{ color: '#f8f7f3' }}
              formatter={(value) => [`$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'MRR']}
            />
            <Line
              type="monotone"
              dataKey="mrr"
              stroke="#176f55"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
