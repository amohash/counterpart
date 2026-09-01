import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, CornerDownRight, Gauge, X } from 'lucide-react';
import { formatCurrency, formatMonths, formatRatio } from '../../health';
import type { Assumptions, ModelOutput } from '../../model';
import type { Proposal } from '../../proposal';
import { computeProposalImpact } from '../../proposalImpact';
import { AgentBadge } from '../AgentBadge';

interface PendingDecisionsProps {
  proposals: Proposal[];
  assumptions: Assumptions;
  output: ModelOutput;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onExploreImpact: (proposal: Proposal) => void;
}

const IMPACT_ROWS: Array<{ key: 'runwayMonths' | 'arr' | 'ltvOverCac' | 'monthlyBurn'; label: string; format: (value: number) => string }> = [
  { key: 'runwayMonths', label: 'Runway', format: formatMonths },
  { key: 'arr', label: 'ARR', format: formatCurrency },
  { key: 'ltvOverCac', label: 'LTV/CAC', format: formatRatio },
  { key: 'monthlyBurn', label: 'Monthly burn', format: formatCurrency },
];

/** First-class Pending Decisions surface for the Decision Room (CLAUDE.md
 * section 10). Reuses the same accept/reject callbacks as the Forecast tab's
 * ProposalHighlight, so approving here goes through the identical
 * pending -> accepted state transition; this component only adds the
 * current/proposed/impact framing and the "Explore impact" action. */
export function PendingDecisions({
  proposals,
  assumptions,
  output,
  onAccept,
  onReject,
  onExploreImpact,
}: PendingDecisionsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const pending = proposals.filter((proposal) => proposal.status === 'pending');

  const toggleImpact = (proposal: Proposal) => {
    const wasExpanded = expandedIds.has(proposal.id);
    // The timeline log is a side effect and must not live inside the setState
    // updater below — React (StrictMode in dev) can invoke updater functions
    // more than once, which would double-log the same exploration.
    setExpandedIds((current) => {
      const next = new Set(current);
      if (wasExpanded) {
        next.delete(proposal.id);
      } else {
        next.add(proposal.id);
      }
      return next;
    });
    if (!wasExpanded) onExploreImpact(proposal);
  };

  return (
    <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
        <Gauge aria-hidden="true" className="text-[#8a5c14]" size={16} strokeWidth={1.9} />
        Pending decisions
      </h2>
      {pending.length === 0 ? (
        <p className="text-xs leading-5 text-[#526059]">
          No proposals are awaiting your decision right now.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((proposal) => {
            const currentValue = assumptions[proposal.targetId];
            const impact = computeProposalImpact(assumptions, output, proposal);
            const isExpanded = expandedIds.has(proposal.id);

            return (
              <li
                key={proposal.id}
                className="overflow-hidden rounded-xl border border-[#dfbe78] bg-[#fffaf0] text-xs shadow-[0_7px_18px_rgba(107,75,19,0.10)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#ead7ad] px-3 py-2.5">
                  <AgentBadge name={proposal.agentId} color={proposal.agentColor} />
                  <p className="tabular-nums text-sm font-bold text-[#5f4517]">
                    {proposal.targetId}: {currentValue} <span className="px-1 text-[#a17a32]">→</span> {proposal.newValue}
                  </p>
                </div>
                <p className="px-3 py-2.5 leading-5 text-[#6b5327]">{proposal.rationale}</p>

                {proposal.rebuttals?.length > 0 && (
                  <div className="space-y-2 border-t border-[#ead7ad] bg-[#f5f2ea] px-3 py-2.5">
                    {proposal.rebuttals.map((rebuttal, index) => (
                      <div key={`${rebuttal.agentId}-${index}`} className="grid grid-cols-[16px_1fr] gap-2">
                        <CornerDownRight aria-hidden="true" className="mt-1 text-[#8f968f]" size={14} />
                        <div>
                          <AgentBadge name={rebuttal.agentId} color={rebuttal.agentColor} />
                          <p className="mt-1.5 leading-5 text-[#4c5751]">{rebuttal.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-[#ead7ad] px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleImpact(proposal)}
                    aria-expanded={isExpanded}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8a5c14]"
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      size={13}
                    />
                    Explore impact
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.dl
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 grid grid-cols-2 gap-2 overflow-hidden sm:grid-cols-4"
                      >
                        {IMPACT_ROWS.map((row) => (
                          <div key={row.key} className="rounded-lg bg-white/70 p-2">
                            <dt className="text-[10px] uppercase tracking-[0.06em] text-[#8a7449]">{row.label}</dt>
                            <dd className="tabular-nums font-semibold text-[#5f4517]">
                              {row.format(impact[row.key].before)} → {row.format(impact[row.key].after)}
                            </dd>
                          </div>
                        ))}
                      </motion.dl>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-2 border-t border-[#ead7ad] px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => onAccept(proposal.id)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#176f55] px-3 font-semibold text-white transition hover:bg-[#115e47] active:translate-y-px"
                  >
                    <Check aria-hidden="true" size={14} strokeWidth={2.2} />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(proposal.id)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#e6e8e3] px-3 font-semibold text-[#3e4a44] transition hover:bg-[#daddd6] active:translate-y-px"
                  >
                    <X aria-hidden="true" size={14} strokeWidth={2.2} />
                    Reject
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
