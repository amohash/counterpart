import { useState } from 'react';
import type { Assumptions } from '../model';
import { createProposal, withStatus, type Proposal } from '../proposal';

interface UseProposalsResult {
  proposals: Proposal[];
  pendingFor: (targetId: keyof Assumptions) => Proposal | undefined;
  addProposal: (targetId: keyof Assumptions, newValue: number, rationale: string) => Proposal;
  accept: (id: string) => void;
  reject: (id: string) => void;
  acceptAll: () => void;
}

export function useProposals(
  setAssumption: (key: keyof Assumptions, value: number) => void,
): UseProposalsResult {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const pendingFor = (targetId: keyof Assumptions) =>
    proposals.find((proposal) => proposal.targetId === targetId && proposal.status === 'pending');

  const addProposal = (targetId: keyof Assumptions, newValue: number, rationale: string) => {
    const proposal = createProposal(targetId, newValue, rationale);
    setProposals((current) => [...current, proposal]);
    return proposal;
  };

  const accept = (id: string) => {
    const proposal = proposals.find((item) => item.id === id);
    if (!proposal) return;

    setAssumption(proposal.targetId, proposal.newValue);
    setProposals((current) =>
      current.map((item) => (item.id === id ? withStatus(item, 'accepted') : item)),
    );
  };

  const reject = (id: string) => {
    setProposals((current) =>
      current.map((item) => (item.id === id ? withStatus(item, 'rejected') : item)),
    );
  };

  const acceptAll = () => {
    proposals
      .filter((proposal) => proposal.status === 'pending')
      .forEach((proposal) => accept(proposal.id));
  };

  return { proposals, pendingFor, addProposal, accept, reject, acceptAll };
}
