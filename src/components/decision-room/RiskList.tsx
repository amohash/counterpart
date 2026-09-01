import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Risk, RiskSeverity } from '../../risks';

const SEVERITY_STYLES: Record<RiskSeverity, string> = {
  critical: 'border-[#0b0d0c] bg-[#0b0d0c] text-white',
  'at-risk': 'border-[#8a6a26] bg-[#f4ecd8] text-[#6f5620]',
  warning: 'border-[#8a6a26] bg-[#f4ecd8] text-[#6f5620]',
};

const SEVERITY_LABEL: Record<RiskSeverity, string> = {
  critical: 'Critical',
  'at-risk': 'At risk',
  warning: 'Warning',
};

interface RiskListProps {
  risks: Risk[];
}

export function RiskList({ risks }: RiskListProps) {
  return (
    <section className="rounded-none bg-[#ffffff] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
        <AlertTriangle aria-hidden="true" className="text-[#0b0d0c]" size={16} strokeWidth={1.9} />
        Financial risks
      </h2>
      {risks.length === 0 ? (
        <p className="flex items-center gap-2 text-xs leading-5 text-[#55605a]">
          <ShieldCheck aria-hidden="true" className="text-[#8a6a26]" size={14} />
          No deterministic risk rules are currently triggered.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {risks.map((risk) => (
            <li key={risk.id} className={`rounded-none border px-3 py-2.5 text-xs ${SEVERITY_STYLES[risk.severity]}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{risk.title}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.06em]">
                  {SEVERITY_LABEL[risk.severity]}
                </span>
              </div>
              <p className="mt-1 leading-5 opacity-90">{risk.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
