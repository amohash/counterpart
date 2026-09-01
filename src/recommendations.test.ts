import { describe, expect, test } from 'vitest';
import { DEFAULT_ASSUMPTIONS } from './model';
import { computeRecommendations } from './recommendations';
import type { Risk } from './risks';

function risk(id: Risk['id']): Risk {
  return { id, severity: 'warning', title: id, detail: id };
}

describe('computeRecommendations', () => {
  test('recommends protecting runway for a critical runway risk', () => {
    const recommendations = computeRecommendations([risk('runway-critical')], DEFAULT_ASSUMPTIONS);
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0].id).toBe('protect-runway');
    expect(recommendations[0].proposal?.targetId).toBe('monthlyOpex');
    expect(recommendations[0].proposal?.newValue).toBeLessThan(DEFAULT_ASSUMPTIONS.monthlyOpex);
  });

  test('runway-critical and runway-at-risk collapse into one protect-runway recommendation', () => {
    const recommendations = computeRecommendations(
      [risk('runway-critical'), risk('runway-at-risk')],
      DEFAULT_ASSUMPTIONS,
    );
    expect(recommendations).toHaveLength(1);
  });

  test('recommends reducing churn for a retention risk', () => {
    const recommendations = computeRecommendations([risk('retention-risk')], DEFAULT_ASSUMPTIONS);
    expect(recommendations[0].proposal?.targetId).toBe('monthlyChurnPct');
    expect(recommendations[0].proposal?.newValue).toBe(8);
  });

  test('recommends lowering CAC for weak unit economics', () => {
    const recommendations = computeRecommendations([risk('weak-unit-economics')], DEFAULT_ASSUMPTIONS);
    expect(recommendations[0].proposal?.targetId).toBe('cac');
  });

  test('margin risk produces a recommendation without a concrete proposal', () => {
    const recommendations = computeRecommendations([risk('margin-risk')], DEFAULT_ASSUMPTIONS);
    expect(recommendations[0].proposal).toBeUndefined();
  });

  test('no risks produce no recommendations', () => {
    expect(computeRecommendations([], DEFAULT_ASSUMPTIONS)).toHaveLength(0);
  });
});
