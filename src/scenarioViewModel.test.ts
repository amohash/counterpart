import { describe, expect, it } from 'vitest';
import type { ScenarioViewModel } from './components/scenarios/ScenarioWorkspace';
import type { DerivedScenario } from './scenarios';
import { buildRunwayComparisonData, draftToOverrides, toScenarioViewModels } from './scenarioViewModel';

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

describe('buildRunwayComparisonData', () => {
  function makeViewModel(overrides: Partial<ScenarioViewModel> = {}): ScenarioViewModel {
    return {
      id: 'current-plan',
      name: 'Current Plan',
      description: '',
      status: 'healthy',
      statusLabel: 'Healthy',
      isCustom: false,
      metrics: { runwayMonths: 8, finalArr: 150000, ltvOverCac: 3.5, monthlyBurn: 8000 },
      deltas: { runwayMonths: 0, finalArr: 0, ltvOverCac: 0, monthlyBurn: 0 },
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
      ...overrides,
    };
  }

  it('maps each scenario to a chart-friendly name/runway pair', () => {
    const data = buildRunwayComparisonData([
      makeViewModel({ id: 'a', name: 'Current Plan', metrics: { runwayMonths: 8, finalArr: 0, ltvOverCac: 0, monthlyBurn: 0 } }),
      makeViewModel({ id: 'b', name: 'Cost Control', metrics: { runwayMonths: 14, finalArr: 0, ltvOverCac: 0, monthlyBurn: 0 } }),
    ]);

    expect(data).toEqual([
      { name: 'Current Plan', runwayMonths: 8 },
      { name: 'Cost Control', runwayMonths: 14 },
    ]);
  });

  it('caps a non-finite (infinite) runway at the given cap so the chart stays finite', () => {
    const data = buildRunwayComparisonData(
      [makeViewModel({ name: 'Growth Bet', metrics: { runwayMonths: Number.POSITIVE_INFINITY, finalArr: 0, ltvOverCac: 0, monthlyBurn: 0 } })],
      36,
    );

    expect(data).toEqual([{ name: 'Growth Bet', runwayMonths: 36 }]);
  });

  it('returns an empty array for an empty scenario list', () => {
    expect(buildRunwayComparisonData([])).toEqual([]);
  });
});
