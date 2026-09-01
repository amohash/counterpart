import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { Assumptions } from '../model';
import type { Proposal } from '../proposal';
import { ProposalHighlight } from './ProposalHighlight';

const FIELD_GROUPS: { title: string; fields: { key: keyof Assumptions; label: string }[] }[] = [
  {
    title: 'Revenue engine',
    fields: [
      { key: 'startingMRR', label: 'Starting MRR' },
      { key: 'newCustomersPerMonth', label: 'New customers / month' },
      { key: 'arpu', label: 'ARPU' },
    ],
  },
  {
    title: 'Retention and unit economics',
    fields: [
      { key: 'monthlyChurnPct', label: 'Monthly churn %' },
      { key: 'cac', label: 'CAC' },
      { key: 'grossMarginPct', label: 'Gross margin %' },
    ],
  },
  {
    title: 'Operating plan',
    fields: [{ key: 'monthlyOpex', label: 'Monthly opex' }],
  },
  {
    title: 'Forecast horizon',
    fields: [{ key: 'months', label: 'Months' }],
  },
];

interface AssumptionsPanelProps {
  assumptions: Assumptions;
  onChange: (key: keyof Assumptions, value: number) => void;
  onReset: () => void;
  pendingFor: (targetId: keyof Assumptions) => Proposal | undefined;
  onAcceptProposal: (id: string) => void;
  onRejectProposal: (id: string) => void;
  annotations: Partial<Record<keyof Assumptions, string>>;
  highlightedIds: ReadonlySet<keyof Assumptions>;
}

export function AssumptionsPanel({
  assumptions,
  onChange,
  onReset,
  pendingFor,
  onAcceptProposal,
  onRejectProposal,
  annotations,
  highlightedIds,
}: AssumptionsPanelProps) {
  return (
    <section className="rounded-xl bg-[#f8f7f3] shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <div className="flex items-center justify-between border-b border-[#dedfd9] px-4 py-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" className="text-[#176f55]" size={17} strokeWidth={1.9} />
          <h2 className="text-sm font-semibold tracking-[-0.01em]">Model assumptions</h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#526059] transition hover:bg-[#e9ebe6] hover:text-[#25312b] active:translate-y-px"
        >
          <RotateCcw aria-hidden="true" size={14} strokeWidth={2} />
          Reset model
        </button>
      </div>
      <div className="flex flex-col gap-5 p-4">
        {FIELD_GROUPS.map(({ title, fields }) => (
          <fieldset key={title} className="flex flex-col gap-3">
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#78827c]">
              {title}
            </legend>
            {fields.map(({ key, label }) => {
              const proposal = pendingFor(key);
              const note = annotations[key];
              const isHighlighted = highlightedIds.has(key);
              return (
                <div
                  key={key}
                  className={`flex flex-col gap-1.5 rounded-lg transition-[box-shadow,background-color] duration-300 ${
                    isHighlighted ? 'bg-[#e7f2ed] shadow-[0_0_0_2px_#238061]' : ''
                  }`}
                >
                  <label className="flex items-center gap-3 text-xs font-medium text-[#526059]">
                    <span className="min-w-0 flex-1">{label}</span>
                    <input
                      type="number"
                      className="tabular-nums h-11 w-28 rounded-lg border border-[#cfd3cc] bg-white px-2.5 text-right text-sm font-semibold text-[#17211d] transition hover:border-[#9ca69f] focus:border-[#176f55] sm:h-9 sm:w-32"
                      value={assumptions[key]}
                      onChange={(event) => onChange(key, Number(event.target.value))}
                    />
                  </label>
                  {note && (
                    <p className="rounded-lg bg-[#e8eef0] px-2.5 py-2 text-xs leading-4 text-[#294b55]">
                      {note}
                    </p>
                  )}
                  {proposal && (
                    <ProposalHighlight
                      proposal={proposal}
                      oldValue={assumptions[key]}
                      onAccept={onAcceptProposal}
                      onReject={onRejectProposal}
                    />
                  )}
                </div>
              );
            })}
          </fieldset>
        ))}
      </div>
    </section>
  );
}
