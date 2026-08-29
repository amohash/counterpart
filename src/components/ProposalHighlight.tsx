import { motion } from 'framer-motion';
import { Check, CornerDownRight, X } from 'lucide-react';
import type { Proposal } from '../proposal';
import { AgentBadge } from './AgentBadge';

interface ProposalHighlightProps {
  proposal: Proposal;
  oldValue: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function ProposalHighlight({ proposal, oldValue, onAccept, onReject }: ProposalHighlightProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className="overflow-hidden rounded-xl border border-[#dfbe78] bg-[#fffaf0] text-xs shadow-[0_7px_18px_rgba(107,75,19,0.10)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#ead7ad] px-3 py-2.5">
        <AgentBadge name={proposal.agentId} color={proposal.agentColor} />
        <p className="tabular-nums text-sm font-bold text-[#5f4517]">
          {oldValue} <span className="px-1 text-[#a17a32]">→</span> {proposal.newValue}
        </p>
      </div>
      <p className="px-3 py-2.5 leading-5 text-[#6b5327]">{proposal.rationale}</p>
      {proposal.rebuttals?.length > 0 && (
        <div className="space-y-2 border-t border-[#ead7ad] bg-[#f5f2ea] px-3 py-2.5">
          {proposal.rebuttals.map((rebuttal, index) => (
            <motion.div
              key={`${rebuttal.agentId}-${index}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-[16px_1fr] gap-2"
            >
              <CornerDownRight aria-hidden="true" className="mt-1 text-[#8f968f]" size={14} />
              <div>
                <AgentBadge name={rebuttal.agentId} color={rebuttal.agentColor} />
                <p className="mt-1.5 leading-5 text-[#4c5751]">{rebuttal.rationale}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="flex gap-2 border-t border-[#ead7ad] px-3 py-2.5">
        <button
          type="button"
          onClick={() => onAccept(proposal.id)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#176f55] px-3 font-semibold text-white transition hover:bg-[#115e47] active:translate-y-px"
        >
          <Check aria-hidden="true" size={14} strokeWidth={2.2} />
          Accept
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
    </motion.div>
  );
}
