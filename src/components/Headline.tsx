import type { ModelOutput } from '../model';

interface HeadlineProps {
  output: ModelOutput;
}

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function formatRunway(months: number): string {
  return Number.isFinite(months) ? `${months} mo` : 'infinite';
}

function formatRatio(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '∞';
}

export function Headline({ output }: HeadlineProps) {
  const lastRow = output.rows[output.rows.length - 1];

  return (
    <div className="flex gap-6 rounded border border-gray-300 p-4">
      <div>
        <div className="text-xs text-gray-500">ARR</div>
        <div className="text-2xl font-bold">{formatter.format(lastRow?.arr ?? 0)}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">LTV / CAC</div>
        <div className="text-2xl font-bold">{formatRatio(output.ltvOverCac)}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">Runway</div>
        <div className="text-2xl font-bold">{formatRunway(output.runwayMonths)}</div>
      </div>
    </div>
  );
}
