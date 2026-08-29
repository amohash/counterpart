import { describe, expect, test } from 'vitest';
import { createProposal, observeProposalIds, withRebuttal, withStatus } from './proposal';

describe('proposal', () => {
  test('createProposal starts pending with given fields', () => {
    const proposal = createProposal('monthlyChurnPct', 15, 'test rationale', 'Growth');

    expect(proposal.status).toBe('pending');
    expect(proposal.targetId).toBe('monthlyChurnPct');
    expect(proposal.newValue).toBe(15);
    expect(proposal.rationale).toBe('test rationale');
    expect(proposal.agentId).toBe('Growth');
    expect(proposal.agentColor).toBeTruthy();
    expect(proposal.rebuttals).toEqual([]);
  });

  test('withRebuttal appends an attributed counter-note without changing status', () => {
    const proposal = createProposal('monthlyOpex', 100000, 'Invest for growth', 'Growth');
    const rebutted = withRebuttal(proposal, 'Risk', 'This shortens runway.');

    expect(rebutted.status).toBe('pending');
    expect(rebutted.rebuttals).toEqual([
      expect.objectContaining({ agentId: 'Risk', rationale: 'This shortens runway.' }),
    ]);
    expect(proposal.rebuttals).toEqual([]);
  });

  test('createProposal assigns unique ids', () => {
    const first = createProposal('cac', 1000, 'a', 'Growth');
    const second = createProposal('cac', 1000, 'a', 'Growth');

    expect(first.id).not.toBe(second.id);
  });

  test('withStatus returns a new object without mutating the original', () => {
    const proposal = createProposal('arpu', 300, 'test', 'Risk');
    const accepted = withStatus(proposal, 'accepted');

    expect(accepted.status).toBe('accepted');
    expect(proposal.status).toBe('pending');
  });

  test('received proposal ids advance the local id counter', () => {
    const received = { ...createProposal('cac', 900, 'received', 'Growth'), id: 'proposal-100' };
    observeProposalIds([received]);

    const local = createProposal('cac', 800, 'local', 'Risk');

    expect(local.id).toBe('proposal-101');
  });
});
