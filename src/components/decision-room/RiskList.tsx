import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Risk, RiskSeverity } from '../../risks';

const SEVERITY_STYLES: Record<RiskSeverity, string> = {
  critical: 'border-[#e2b3ab] bg-[#faece9] text-[#9c3b32]',
  'at-risk': 'border-[#e7cf9c] bg-[#fbf3e2] text-[#8a5c14]',
  warning: 'border-[#e7cf9c] bg-[#fbf3e2] text-[#8a5c14]',
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
    <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
        <AlertTriangle aria-hidden="true" className="text-[#9c3b32]" size={16} strokeWidth={1.9} />
        Financial risks
      </h2>
      {risks.length === 0 ? (
        <p className="flex items-center gap-2 text-xs leading-5 text-[#526059]">
          <ShieldCheck aria-hidden="true" className="text-[#176f55]" size={14} />
          No deterministic risk rules are currently triggered.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {risks.map((risk) => (
            <li key={risk.id} className={`rounded-lg border px-3 py-2.5 text-xs ${SEVERITY_STYLES[risk.severity]}`}>
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
