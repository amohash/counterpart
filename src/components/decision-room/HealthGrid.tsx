import type { HealthMetric, HealthSeverity } from '../../health';

const SEVERITY_STYLES: Record<HealthSeverity, string> = {
  good: 'border-[#bcd9cb] bg-[#eef6f1] text-[#176f55]',
  watch: 'border-[#e7cf9c] bg-[#fbf3e2] text-[#8a5c14]',
  risk: 'border-[#e2b3ab] bg-[#faece9] text-[#9c3b32]',
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
          className="flex flex-col gap-2 rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8880]">
              {metric.label}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${SEVERITY_STYLES[metric.severity]}`}
            >
              {metric.statusText}
            </span>
          </div>
          <p className="tabular-nums text-xl font-semibold tracking-[-0.02em] text-[#17211d]">{metric.value}</p>
          <p className="text-xs leading-5 text-[#526059]">{metric.interpretation}</p>
        </div>
      ))}
    </div>
  );
}
