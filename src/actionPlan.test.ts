import { describe, expect, test } from 'vitest';
import { computeActionPlanItems } from './actionPlan';
import type { Recommendation } from './recommendations';

function recommendation(id: string, action = id): Recommendation {
  return {
    id,
    action,
    rationale: `${id} rationale`,
    expectedEffect: `${id} effect`,
    relevantAssumptions: [],
    scenarioSuggestion: 'Current Plan',
  };
}

describe('computeActionPlanItems', () => {
  test('maps recommendations to weeks in order, 1-indexed', () => {
    const items = computeActionPlanItems([recommendation('a'), recommendation('b')]);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ week: 1, recommendationId: 'a', title: 'a' });
    expect(items[1]).toMatchObject({ week: 2, recommendationId: 'b' });
  });

  test('derives item id from the stable recommendationId, not a counter', () => {
    const items = computeActionPlanItems([recommendation('protect-runway')]);
    expect(items[0].id).toBe('plan-protect-runway');
  });

  test('caps at Week 4 even with more than four active recommendations', () => {
    const items = computeActionPlanItems([
      recommendation('a'),
      recommendation('b'),
      recommendation('c'),
      recommendation('d'),
      recommendation('e'),
    ]);
    expect(items).toHaveLength(4);
    expect(items[3].week).toBe(4);
  });

  test('no recommendations produce no items', () => {
    expect(computeActionPlanItems([])).toHaveLength(0);
  });
});
