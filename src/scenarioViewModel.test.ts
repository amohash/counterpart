import { describe, expect, it } from 'vitest';
import type { DerivedScenario } from './scenarios';
import { draftToOverrides, toScenarioViewModels } from './scenarioViewModel';

function makeScenario(overrides: Partial<DerivedScenario> = {}): DerivedScenario {
  return {
    id: 'current-plan',
    name: 'Current Plan',
    description: 'The live financial model with no temporary overrides.',
    overrides: {},
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    assumptions: {
      startingMRR: 10000,
      newCustomersPerMonth: 10,
      arpu: 100,
      monthlyChurnPct: 5,
      cac: 500,
      grossMarginPct: 70,
      monthlyOpex: 20000,
      months: 12,
    },
    runwayMonths: 8,
    arr: 150000,
    ltvOverCac: 3.5,
    monthlyBurn: 8000,
    status: 'healthy',
    deltas: { runwayMonths: 0, arr: 0, ltvOverCac: 0, monthlyBurn: 0 },
    ...overrides,
  };
}

describe('toScenarioViewModels', () => {
  it('maps derived scenario status onto the workspace status vocabulary', () => {
    const scenarios = [
      makeScenario({ id: 'a', status: 'critical' }),
      makeScenario({ id: 'b', status: 'at-risk' }),
      makeScenario({ id: 'c', status: 'healthy' }),
    ];

    const viewModels = toScenarioViewModels(scenarios);

    expect(viewModels.map((vm) => vm.status)).toEqual(['risk', 'watch', 'healthy']);
  });

  it('maps metrics and deltas field names to the workspace view model', () => {
    const scenario = makeScenario({ arr: 200000, deltas: { runwayMonths: 1, arr: 5000, ltvOverCac: 0.2, monthlyBurn: -100 } });

    const [viewModel] = toScenarioViewModels([scenario]);

    expect(viewModel.metrics.finalArr).toBe(200000);
    expect(viewModel.deltas.finalArr).toBe(5000);
    expect(viewModel.metrics.runwayMonths).toBe(scenario.runwayMonths);
    expect(viewModel.metrics.ltvOverCac).toBe(scenario.ltvOverCac);
    expect(viewModel.metrics.monthlyBurn).toBe(scenario.monthlyBurn);
  });

  it('marks built-in scenarios as non-custom and custom scenarios as custom', () => {
    const scenarios = [
      makeScenario({ id: 'current-plan', isBuiltIn: true }),
      makeScenario({ id: 'scenario-1', isBuiltIn: false }),
    ];

    const viewModels = toScenarioViewModels(scenarios);

    expect(viewModels[0].isCustom).toBe(false);
    expect(viewModels[1].isCustom).toBe(true);
  });

  it('produces a human-readable status label for each status', () => {
    const scenarios = [
      makeScenario({ id: 'a', status: 'critical' }),
      makeScenario({ id: 'b', status: 'at-risk' }),
      makeScenario({ id: 'c', status: 'healthy' }),
    ];

    const viewModels = toScenarioViewModels(scenarios);

    expect(viewModels.map((vm) => vm.statusLabel)).toEqual(['Critical', 'At risk', 'Healthy']);
  });
});

describe('draftToOverrides', () => {
  it('only includes assumption keys whose draft value differs from the base assumptions', () => {
    const base = {
      startingMRR: 10000,
      newCustomersPerMonth: 10,
      arpu: 100,
      monthlyChurnPct: 5,
      cac: 500,
      grossMarginPct: 70,
      monthlyOpex: 20000,
      months: 12,
    };
    const draft = { ...base, monthlyOpex: 16000, cac: 500 };

    const overrides = draftToOverrides(draft, base);

    expect(overrides).toEqual({ monthlyOpex: 16000 });
  });

  it('returns an empty object when the draft matches the base assumptions exactly', () => {
    const base = {
      startingMRR: 10000,
      newCustomersPerMonth: 10,
      arpu: 100,
      monthlyChurnPct: 5,
      cac: 500,
      grossMarginPct: 70,
      monthlyOpex: 20000,
      months: 12,
    };

    const overrides = draftToOverrides({ ...base }, base);

    expect(overrides).toEqual({});
  });
});
