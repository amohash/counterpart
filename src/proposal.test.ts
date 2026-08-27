import { describe, expect, test } from 'vitest';
import { createProposal, withStatus } from './proposal';

describe('proposal', () => {
  test('createProposal starts pending with given fields', () => {
    const proposal = createProposal('monthlyChurnPct', 15, 'test rationale');

    expect(proposal.status).toBe('pending');
    expect(proposal.targetId).toBe('monthlyChurnPct');
    expect(proposal.newValue).toBe(15);
    expect(proposal.rationale).toBe('test rationale');
  });

  test('createProposal assigns unique ids', () => {
    const first = createProposal('cac', 1000, 'a');
    const second = createProposal('cac', 1000, 'a');

    expect(first.id).not.toBe(second.id);
  });

  test('withStatus returns a new object without mutating the original', () => {
    const proposal = createProposal('arpu', 300, 'test');
    const accepted = withStatus(proposal, 'accepted');

    expect(accepted.status).toBe('accepted');
    expect(proposal.status).toBe('pending');
  });
});
