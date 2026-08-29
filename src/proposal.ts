import type { Assumptions } from './model';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface Rebuttal {
  agentId: string;
  agentColor: string;
  rationale: string;
}

export interface Proposal {
  id: string;
  targetId: keyof Assumptions;
  newValue: number;
  rationale: string;
  status: ProposalStatus;
  agentId: string;
  agentColor: string;
  rebuttals: Rebuttal[];
}

let nextId = 1;

/** Fixed palette; assigned to agent names in the order they're first seen. */
const AGENT_COLOR_PALETTE = ['#2563eb', '#dc2626', '#059669', '#7c3aed', '#d97706', '#0891b2'];
const agentColorsByName = new Map<string, string>();

/** Same agent name always gets the same color; new names cycle the palette. */
export function getAgentColor(agentName: string): string {
  const existing = agentColorsByName.get(agentName);
  if (existing) return existing;

  const color = AGENT_COLOR_PALETTE[agentColorsByName.size % AGENT_COLOR_PALETTE.length];
  agentColorsByName.set(agentName, color);
  return color;
}

export function createProposal(
  targetId: keyof Assumptions,
  newValue: number,
  rationale: string,
  agentName: string,
): Proposal {
  const id = `proposal-${nextId}`;
  nextId += 1;
  return {
    id,
    targetId,
    newValue,
    rationale,
    status: 'pending',
    agentId: agentName,
    agentColor: getAgentColor(agentName),
    rebuttals: [],
  };
}

export function withRebuttal(
  proposal: Proposal,
  agentName: string,
  rationale: string,
): Proposal {
  return {
    ...proposal,
    rebuttals: [
      ...(proposal.rebuttals ?? []),
      { agentId: agentName, agentColor: getAgentColor(agentName), rationale },
    ],
  };
}

export function withStatus(proposal: Proposal, status: ProposalStatus): Proposal {
  return { ...proposal, status };
}

export function observeProposalIds(proposals: Proposal[]): void {
  for (const proposal of proposals) {
    const match = /^proposal-(\d+)$/.exec(proposal.id);
    if (match) nextId = Math.max(nextId, Number(match[1]) + 1);
  }
}
