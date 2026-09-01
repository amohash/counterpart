import { describe, expect, it } from 'vitest';
import { DEFAULT_ASSUMPTIONS, computeModel } from './model';
import { computeProposalImpact } from './proposalImpact';

describe('computeProposalImpact', () => {
  it('reports lower burn and longer runway for an opex cut', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS);
    const impact = computeProposalImpact(DEFAULT_ASSUMPTIONS, output, {
      targetId: 'monthlyOpex',
      newValue: DEFAULT_ASSUMPTIONS.monthlyOpex * 0.8,
    });

    expect(impact.monthlyBurn.before).toBe(output.rows.at(-1)?.burn);
    expect(impact.monthlyBurn.after).toBeLessThan(impact.monthlyBurn.before);
    expect(impact.monthlyBurn.delta).toBeLessThan(0);
    expect(impact.runwayMonths.after).toBeGreaterThanOrEqual(impact.runwayMonths.before);
  });

  it('leaves ARR unaffected by an opex-only change', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS);
    const impact = computeProposalImpact(DEFAULT_ASSUMPTIONS, output, {
      targetId: 'monthlyOpex',
      newValue: DEFAULT_ASSUMPTIONS.monthlyOpex * 0.8,
    });

    expect(impact.arr.delta).toBe(0);
  });

  it('reports a zero delta, not NaN, when runway is infinite before and after', () => {
    const healthy = { ...DEFAULT_ASSUMPTIONS, monthlyOpex: 1000, monthlyChurnPct: 0.5 };
    const output = computeModel(healthy);
    const impact = computeProposalImpact(healthy, output, {
      targetId: 'arpu',
      newValue: healthy.arpu + 1,
    });

    if (!Number.isFinite(impact.runwayMonths.before) && !Number.isFinite(impact.runwayMonths.after)) {
      expect(impact.runwayMonths.delta).toBe(0);
    }
  });

  it('improves LTV/CAC when CAC is reduced', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS);
    const impact = computeProposalImpact(DEFAULT_ASSUMPTIONS, output, {
      targetId: 'cac',
      newValue: DEFAULT_ASSUMPTIONS.cac * 0.8,
    });

    expect(impact.ltvOverCac.after).toBeGreaterThan(impact.ltvOverCac.before);
    expect(impact.ltvOverCac.delta).toBeGreaterThan(0);
  });
});
