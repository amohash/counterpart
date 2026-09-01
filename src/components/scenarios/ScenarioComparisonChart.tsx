import { ChartSpline } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DEFAULT_RUNWAY_CAP_MONTHS, type RunwayComparisonPoint } from '../../scenarioViewModel';

interface ScenarioComparisonChartProps {
  data: RunwayComparisonPoint[];
}

/** Bar chart of compared scenarios' runway, alongside `ComparisonTable`.
 * Read-only — never touches the active model. Rendered only when at least one
 * scenario is checked for comparison. */
export function ScenarioComparisonChart({ data }: ScenarioComparisonChartProps) {
  return (
    <div
      className="mt-4 h-56 w-full sm:h-64"
      role="img"
      aria-label="Runway (months) by compared scenario"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e4e3dc" strokeDasharray="2 5" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#55605a', fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} width={40} tick={{ fill: '#55605a', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              border: 0,
              borderRadius: 10,
              background: '#0b0d0c',
              color: '#f7f6f2',
              boxShadow: '0 10px 24px rgba(23,33,29,0.2)',
              fontSize: 12,
            }}
            formatter={(value) => [`${value} mo`, 'Runway']}
          />
          <Bar dataKey="runwayMonths" fill="#8a6a26" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 flex items-center gap-1 text-[10px] text-[#8b928c]">
        <ChartSpline aria-hidden="true" size={11} strokeWidth={2} /> Runway capped at{' '}
        {DEFAULT_RUNWAY_CAP_MONTHS} months for scenarios with an infinite runway.
      </p>
    </div>
  );
}
