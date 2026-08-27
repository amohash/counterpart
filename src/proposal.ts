import type { Assumptions } from './model';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface Proposal {
  id: string;
  targetId: keyof Assumptions;
  newValue: number;
  rationale: string;
  status: ProposalStatus;
}

let nextId = 1;

export function createProposal(
  targetId: keyof Assumptions,
  newValue: number,
  rationale: string,
): Proposal {
  const id = `proposal-${nextId}`;
  nextId += 1;
  return { id, targetId, newValue, rationale, status: 'pending' };
}

export function withStatus(proposal: Proposal, status: ProposalStatus): Proposal {
  return { ...proposal, status };
}
