import type { HealthMetric, HealthSeverity } from '../../health';

const SEVERITY_STYLES: Record<HealthSeverity, string> = {
  good: 'border-[#e8ddc0] bg-[#f4ecd8] text-[#8a6a26]',
  watch: 'border-[#8a6a26] bg-[#f4ecd8] text-[#6f5620]',
  risk: 'border-[#0b0d0c] bg-[#0b0d0c] text-white',
};

interface HealthGridProps {
  metrics: HealthMetric[];
}

export function HealthGrid({ metrics }: HealthGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="flex flex-col gap-2 rounded-none bg-[#ffffff] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b928c]">
              {metric.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${SEVERITY_STYLES[metric.severity]}`}
            >
              {metric.statusText}
            </span>
          </div>
          <p className="tabular-nums text-2xl font-semibold tracking-[-0.01em] text-[#0b0d0c]">{metric.value}</p>
          <p className="text-xs leading-5 text-[#55605a]">{metric.interpretation}</p>
        </div>
      ))}
    </div>
  );
}
