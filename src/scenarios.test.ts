import { describe, expect, test } from 'vitest';
import { DEFAULT_ASSUMPTIONS } from './model';
import {
  BUILT_IN_SCENARIO_IDS,
  SCENARIO_STORAGE_VERSION,
  activateScenario,
  createInitialScenarioState,
  deleteScenario,
  deriveScenarios,
  duplicateScenario,
  hydrateScenarioState,
  resetScenarioState,
  saveScenario,
  setComparedScenarios,
  type ScenarioState,
} from './scenarios';

const NOW = '2026-08-31T12:00:00.000Z';
const LATER = '2026-08-31T13:00:00.000Z';

describe('scenario seeds', () => {
  test('creates four stable built-ins and a useful default comparison', () => {
    const state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);

    expect(state.version).toBe(SCENARIO_STORAGE_VERSION);
    expect(state.scenarios.map((scenario) => scenario.id)).toEqual(BUILT_IN_SCENARIO_IDS);
    expect(state.scenarios.every((scenario) => scenario.isBuiltIn)).toBe(true);
    expect(state.activeScenarioId).toBe('current-plan');
    expect(state.comparedScenarioIds.length).toBeGreaterThanOrEqual(3);
  });

  test('uses the approved adaptive seed formulas', () => {
    const state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    const byId = Object.fromEntries(state.scenarios.map((scenario) => [scenario.id, scenario]));

    expect(byId['current-plan'].overrides).toEqual({});
    expect(byId['cost-control'].overrides.monthlyOpex).toBe(DEFAULT_ASSUMPTIONS.monthlyOpex * 0.8);
    expect(byId['retention-recovery'].overrides.monthlyChurnPct).toBe(2.4);
    expect(byId['growth-bet'].overrides).toMatchObject({
      newCustomersPerMonth: DEFAULT_ASSUMPTIONS.newCustomersPerMonth * 1.25,
      cac: DEFAULT_ASSUMPTIONS.cac * 1.1,
    });
  });

  test('caps the retention seed at 8% and rounds to one decimal', () => {
    const assumptions = { ...DEFAULT_ASSUMPTIONS, monthlyChurnPct: 12.34 };
    const state = createInitialScenarioState(assumptions, NOW);
    const retention = state.scenarios.find((scenario) => scenario.id === 'retention-recovery');
    expect(retention?.overrides.monthlyChurnPct).toBe(8);
  });
});

describe('scenario derivation', () => {
  test('derives metrics, status, and deltas at runtime without changing the base assumptions', () => {
    const base = { ...DEFAULT_ASSUMPTIONS };
    const state = createInitialScenarioState(base, NOW);
    const derived = deriveScenarios(state.scenarios, base);
    const current = derived.find((scenario) => scenario.id === 'current-plan')!;
    const costControl = derived.find((scenario) => scenario.id === 'cost-control')!;

    expect(current.deltas).toEqual({ runwayMonths: 0, arr: 0, ltvOverCac: 0, monthlyBurn: 0 });
    expect(costControl.monthlyBurn).toBeLessThan(current.monthlyBurn);
    expect(costControl.deltas.monthlyBurn).toBeCloseTo(costControl.monthlyBurn - current.monthlyBurn);
    expect(costControl.status).toMatch(/critical|at-risk|healthy/);
    expect(base).toEqual(DEFAULT_ASSUMPTIONS);
  });

  test('recomputes Current Plan metrics when the live base changes', () => {
    const state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    const first = deriveScenarios(state.scenarios, DEFAULT_ASSUMPTIONS)[0];
    const second = deriveScenarios(state.scenarios, { ...DEFAULT_ASSUMPTIONS, startingMRR: 90000 })[0];
    expect(second.arr).not.toBe(first.arr);
  });
});

describe('scenario state transitions', () => {
  test('activation changes scenario context only', () => {
    const base = { ...DEFAULT_ASSUMPTIONS };
    const state = createInitialScenarioState(base, NOW);
    const next = activateScenario(state, 'cost-control');
    expect(next.activeScenarioId).toBe('cost-control');
    expect(base).toEqual(DEFAULT_ASSUMPTIONS);
  });

  test('duplicates to a safe custom id and allows saving and deleting only custom scenarios', () => {
    let state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    state = duplicateScenario(state, 'cost-control', LATER);
    const copy = state.scenarios.at(-1)!;

    expect(copy.id).toMatch(/^scenario-[1-9]\d*$/);
    expect(copy.isBuiltIn).toBe(false);
    expect(copy.name).toBe('Cost Control copy');

    state = saveScenario(state, {
      id: copy.id,
      name: 'Lean plan',
      description: 'A custom operating plan.',
      overrides: { monthlyOpex: 100000, monthlyChurnPct: 2 },
    }, LATER);
    expect(state.scenarios.at(-1)).toMatchObject({ name: 'Lean plan', updatedAt: LATER });

    const afterBuiltInDelete = deleteScenario(state, 'current-plan');
    expect(afterBuiltInDelete).toBe(state);
    expect(deleteScenario(state, copy.id).scenarios.some((scenario) => scenario.id === copy.id)).toBe(false);
  });

  test('creates a custom scenario with normalized text and rejects unsafe input', () => {
    let state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    state = saveScenario(state, {
      name: '  Growth with discipline  ',
      description: '  Test acquisition carefully.  ',
      overrides: { cac: 1500 },
    }, LATER);
    expect(state.scenarios.at(-1)).toMatchObject({
      id: 'scenario-1',
      name: 'Growth with discipline',
      description: 'Test acquisition carefully.',
    });

    expect(() => saveScenario(state, { name: '', description: 'x', overrides: {} }, LATER)).toThrow(/name/i);
    expect(() => saveScenario(state, { name: 'Bad', description: 'x', overrides: { monthlyOpex: -1 } }, LATER)).toThrow(/monthlyOpex/);
    expect(() => saveScenario(state, { name: 'Bad', description: 'x', overrides: { months: 1.5 } }, LATER)).toThrow(/months/);
  });

  test('maintains valid activation and comparison ids after delete and reset', () => {
    let state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    state = duplicateScenario(state, 'growth-bet', LATER);
    const customId = state.scenarios.at(-1)!.id;
    state = activateScenario(state, customId);
    state = setComparedScenarios(state, ['current-plan', customId, customId, 'missing']);
    expect(state.comparedScenarioIds).toEqual(['current-plan', customId]);

    state = deleteScenario(state, customId);
    expect(state.activeScenarioId).toBe('current-plan');
    expect(state.comparedScenarioIds).not.toContain(customId);

    const reset = resetScenarioState(DEFAULT_ASSUMPTIONS, LATER);
    expect(reset.scenarios).toHaveLength(4);
    expect(reset.comparedScenarioIds.length).toBeGreaterThanOrEqual(3);
  });
});

describe('scenario hydration', () => {
  test('hydrates a valid versioned payload', () => {
    const state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    const hydrated = hydrateScenarioState(JSON.stringify(state), DEFAULT_ASSUMPTIONS, LATER);
    expect(hydrated).toEqual(state);
  });

  test.each([
    null,
    '{not-json',
    JSON.stringify({ version: 99 }),
    JSON.stringify({ version: SCENARIO_STORAGE_VERSION, scenarios: [] }),
  ])('falls back to fresh seeds for missing or malformed storage: %s', (raw) => {
    const hydrated = hydrateScenarioState(raw, DEFAULT_ASSUMPTIONS, NOW);
    expect(hydrated.scenarios.map((scenario) => scenario.id)).toEqual(BUILT_IN_SCENARIO_IDS);
  });

  test('drops malformed custom records and repairs invalid selected ids', () => {
    const state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    const unsafe: ScenarioState = {
      ...state,
      activeScenarioId: '../escape',
      comparedScenarioIds: ['current-plan', '../escape'],
      scenarios: [
        ...state.scenarios,
        { id: '../escape', name: 'Bad', description: 'Bad', overrides: {}, isBuiltIn: false, createdAt: NOW, updatedAt: NOW },
      ],
    };
    const hydrated = hydrateScenarioState(JSON.stringify(unsafe), DEFAULT_ASSUMPTIONS, LATER);
    expect(hydrated.scenarios).toHaveLength(4);
    expect(hydrated.activeScenarioId).toBe('current-plan');
    expect(hydrated.comparedScenarioIds).toEqual(['current-plan']);
  });

  test('keeps only one record for each persisted scenario id', () => {
    let state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    state = duplicateScenario(state, 'cost-control', LATER);
    const custom = state.scenarios.at(-1)!;
    const duplicatedPayload: ScenarioState = {
      ...state,
      scenarios: [...state.scenarios, { ...custom, name: 'Injected duplicate' }],
    };

    const hydrated = hydrateScenarioState(JSON.stringify(duplicatedPayload), DEFAULT_ASSUMPTIONS, LATER);
    expect(hydrated.scenarios.filter((scenario) => scenario.id === custom.id)).toHaveLength(1);
    expect(new Set(hydrated.scenarios.map((scenario) => scenario.id)).size).toBe(hydrated.scenarios.length);
  });

  test('never hydrates Current Plan with assumption overrides', () => {
    const state = createInitialScenarioState(DEFAULT_ASSUMPTIONS, NOW);
    const tampered: ScenarioState = {
      ...state,
      scenarios: state.scenarios.map((scenario) => scenario.id === 'current-plan'
        ? { ...scenario, overrides: { monthlyOpex: 1 } }
        : scenario),
    };

    const hydrated = hydrateScenarioState(JSON.stringify(tampered), DEFAULT_ASSUMPTIONS, LATER);
    expect(hydrated.scenarios.find((scenario) => scenario.id === 'current-plan')?.overrides).toEqual({});
  });
});
