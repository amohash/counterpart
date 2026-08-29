import type { Proposal } from '../proposal';

interface ProposalHighlightProps {
  proposal: Proposal;
  oldValue: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function ProposalHighlight({ proposal, oldValue, onAccept, onReject }: ProposalHighlightProps) {
  return (
    <div className="animate-fade-in rounded border border-amber-400 bg-amber-50 p-2 text-xs">
      <span
        className="mb-1 inline-block rounded px-1.5 py-0.5 font-semibold text-white"
        style={{ backgroundColor: proposal.agentColor }}
      >
        {proposal.agentId}
      </span>
      <p className="font-medium text-amber-800">
        {oldValue} → {proposal.newValue}
      </p>
      <p className="mt-1 text-amber-700">{proposal.rationale}</p>
      {proposal.rebuttals?.length > 0 && (
        <div className="mt-2 space-y-2 border-l-2 border-amber-300 pl-2">
          {proposal.rebuttals.map((rebuttal, index) => (
            <div key={`${rebuttal.agentId}-${index}`}>
              <span
                className="inline-block rounded px-1.5 py-0.5 font-semibold text-white"
                style={{ backgroundColor: rebuttal.agentColor }}
              >
                {rebuttal.agentId}
              </span>
              <p className="mt-1 text-gray-700">{rebuttal.rationale}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onAccept(proposal.id)}
          className="rounded bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => onReject(proposal.id)}
          className="rounded bg-gray-200 px-2 py-1 font-medium hover:bg-gray-300"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
