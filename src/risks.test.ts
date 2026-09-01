import { describe, expect, test } from 'vitest';
import { computeModel, DEFAULT_ASSUMPTIONS, type Assumptions } from './model';
import { computeRisks } from './risks';

function run(overrides: Partial<Assumptions>) {
  const assumptions = { ...DEFAULT_ASSUMPTIONS, ...overrides };
  const output = computeModel(assumptions);
  return computeRisks(assumptions, output);
}

describe('computeRisks', () => {
  test('flags critical runway under 3 months', () => {
    const risks = run({ monthlyOpex: 10_000_000 });
    expect(risks.map((risk) => risk.id)).toContain('runway-critical');
  });

  test('flags at-risk runway between 3 and 6 months, not critical', () => {
    const risks = run({ monthlyChurnPct: 50, monthlyOpex: 25_000 });
    expect(risks.map((risk) => risk.id)).toContain('runway-at-risk');
    expect(risks.map((risk) => risk.id)).not.toContain('runway-critical');
  });

  test('flags weak unit economics below 3x LTV/CAC', () => {
    const risks = run({ cac: 100_000 });
    expect(risks.map((risk) => risk.id)).toContain('weak-unit-economics');
  });

  test('flags retention risk above 8% monthly churn', () => {
    const risks = run({ monthlyChurnPct: 9 });
    expect(risks.map((risk) => risk.id)).toContain('retention-risk');
  });

  test('flags margin risk below 65% gross margin', () => {
    const risks = run({ grossMarginPct: 50 });
    expect(risks.map((risk) => risk.id)).toContain('margin-risk');
  });

  test('flags operating-cost risk when opex materially exceeds gross profit', () => {
    const risks = run({ monthlyOpex: 500_000 });
    expect(risks.map((risk) => risk.id)).toContain('operating-cost-risk');
  });

  test('healthy defaults produce no risks below the operating-cost threshold', () => {
    const risks = run({ monthlyOpex: 100 });
    expect(risks.map((risk) => risk.id)).not.toContain('operating-cost-risk');
    expect(risks.map((risk) => risk.id)).not.toContain('runway-critical');
    expect(risks.map((risk) => risk.id)).not.toContain('runway-at-risk');
  });
});
