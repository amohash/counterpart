import { Gauge, Hourglass, Landmark } from 'lucide-react';
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
    <div className="grid min-h-12 grid-cols-3 divide-x divide-white/12 overflow-hidden rounded-none bg-[#0b0d0c] text-[#f7f6f2] shadow-[0_10px_26px_rgba(23,33,29,0.15)]">
      <div className="flex min-w-0 items-center gap-2.5 px-3 py-3 sm:px-4">
        <Landmark aria-hidden="true" className="hidden shrink-0 text-[#c9ad6e] sm:block" size={17} strokeWidth={1.8} />
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b928c]">ARR</div>
          <div className="tabular-nums truncate text-base font-semibold tracking-[-0.02em] sm:text-lg">
            ${formatter.format(lastRow?.arr ?? 0)}
          </div>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2.5 px-3 py-3 sm:px-4">
        <Gauge aria-hidden="true" className="hidden shrink-0 text-[#c9ad6e] sm:block" size={17} strokeWidth={1.8} />
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b928c]">LTV / CAC</div>
          <div className="tabular-nums text-base font-semibold tracking-[-0.02em] sm:text-lg">
            {formatRatio(output.ltvOverCac)}×
          </div>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2.5 px-3 py-3 sm:px-4">
        <Hourglass aria-hidden="true" className="hidden shrink-0 text-[#8a6a26] sm:block" size={17} strokeWidth={1.8} />
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b928c]">Runway</div>
          <div className="tabular-nums text-base font-semibold tracking-[-0.02em] text-[#8a6a26] sm:text-lg">
            {formatRunway(output.runwayMonths)}
          </div>
        </div>
      </div>
    </div>
  );
}
