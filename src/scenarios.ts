import {
  ASSUMPTION_IDS,
  computeModel,
  isAssumptionId,
  type Assumptions,
} from './model';

export const SCENARIO_STORAGE_VERSION = 1 as const;
export const SCENARIO_STORAGE_KEY = 'counterpart-scenarios';

export const BUILT_IN_SCENARIO_IDS = [
  'current-plan',
  'cost-control',
  'retention-recovery',
  'growth-bet',
] as const;

export type BuiltInScenarioId = (typeof BUILT_IN_SCENARIO_IDS)[number];
export type ScenarioStatus = 'critical' | 'at-risk' | 'healthy';

export interface ScenarioRecord {
  id: string;
  name: string;
  description: string;
  overrides: Partial<Assumptions>;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioState {
  version: typeof SCENARIO_STORAGE_VERSION;
  scenarios: ScenarioRecord[];
  activeScenarioId: string;
  comparedScenarioIds: string[];
}

export interface ScenarioDeltas {
  runwayMonths: number;
  arr: number;
  ltvOverCac: number;
  monthlyBurn: number;
}

export interface DerivedScenario extends ScenarioRecord {
  assumptions: Assumptions;
  runwayMonths: number;
  arr: number;
  ltvOverCac: number;
  monthlyBurn: number;
  status: ScenarioStatus;
  deltas: ScenarioDeltas;
}

export interface SaveScenarioInput {
  id?: string;
  name: string;
  description: string;
  overrides: Partial<Assumptions>;
}

const BUILT_IN_ID_SET = new Set<string>(BUILT_IN_SCENARIO_IDS);
const CUSTOM_ID_PATTERN = /^scenario-[1-9]\d*$/;
const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function createSeedScenarios(assumptions: Assumptions, timestamp: string): ScenarioRecord[] {
  return [
    {
      id: 'current-plan',
      name: 'Current Plan',
      description: 'The live financial model with no temporary overrides.',
      overrides: {},
      isBuiltIn: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'cost-control',
      name: 'Cost Control',
      description: 'Reduce monthly operating expenses by 20% to protect runway.',
      overrides: { monthlyOpex: assumptions.monthlyOpex * 0.8 },
      isBuiltIn: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'retention-recovery',
      name: 'Retention Recovery',
      description: 'Improve monthly retention without assuming an unrealistic instant recovery.',
      overrides: { monthlyChurnPct: roundToOneDecimal(Math.min(8, assumptions.monthlyChurnPct * 0.8)) },
      isBuiltIn: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'growth-bet',
      name: 'Growth Bet',
      description: 'Acquire 25% more customers while allowing for a 10% increase in CAC.',
      overrides: {
        newCustomersPerMonth: assumptions.newCustomersPerMonth * 1.25,
        cac: assumptions.cac * 1.1,
      },
      isBuiltIn: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

export function createInitialScenarioState(
  assumptions: Assumptions,
  timestamp = new Date().toISOString(),
): ScenarioState {
  return {
    version: SCENARIO_STORAGE_VERSION,
    scenarios: createSeedScenarios(assumptions, timestamp),
    activeScenarioId: 'current-plan',
    comparedScenarioIds: ['current-plan', 'cost-control', 'retention-recovery', 'growth-bet'],
  };
}

function statusForRunway(runwayMonths: number): ScenarioStatus {
  if (runwayMonths < 3) return 'critical';
  if (runwayMonths <= 6) return 'at-risk';
  return 'healthy';
}

function safeDelta(value: number, baseline: number): number {
  if (Object.is(value, baseline) || value === baseline) return 0;
  return value - baseline;
}

interface ScenarioMetrics {
  assumptions: Assumptions;
  runwayMonths: number;
  arr: number;
  ltvOverCac: number;
  monthlyBurn: number;
  status: ScenarioStatus;
}

function deriveMetrics(record: ScenarioRecord, baseAssumptions: Assumptions): ScenarioMetrics {
  const assumptions = { ...baseAssumptions, ...record.overrides };
  const output = computeModel(assumptions);
  const finalRow = output.rows.at(-1);
  return {
    assumptions,
    runwayMonths: output.runwayMonths,
    arr: finalRow?.arr ?? 0,
    ltvOverCac: output.ltvOverCac,
    monthlyBurn: finalRow?.burn ?? 0,
    status: statusForRunway(output.runwayMonths),
  };
}

/** Derives all financial values from the live base model. Scenario metrics are
 * deliberately not persisted, so they cannot become stale. */
export function deriveScenarios(
  scenarios: ScenarioRecord[],
  baseAssumptions: Assumptions,
): DerivedScenario[] {
  const currentRecord = scenarios.find((scenario) => scenario.id === 'current-plan')
    ?? createSeedScenarios(baseAssumptions, new Date().toISOString())[0];
  const baseline = deriveMetrics(currentRecord, baseAssumptions);

  return scenarios.map((scenario) => {
    const metrics = deriveMetrics(scenario, baseAssumptions);
    return {
      ...scenario,
      ...metrics,
      deltas: {
        runwayMonths: safeDelta(metrics.runwayMonths, baseline.runwayMonths),
        arr: safeDelta(metrics.arr, baseline.arr),
        ltvOverCac: safeDelta(metrics.ltvOverCac, baseline.ltvOverCac),
        monthlyBurn: safeDelta(metrics.monthlyBurn, baseline.monthlyBurn),
      },
    };
  });
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function isValidScenarioId(value: unknown): value is string {
  return typeof value === 'string' && (BUILT_IN_ID_SET.has(value) || CUSTOM_ID_PATTERN.test(value));
}

function validateAssumptionValue(key: keyof Assumptions, value: unknown): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return false;
  if ((key === 'monthlyChurnPct' || key === 'grossMarginPct') && value > 100) return false;
  if (key === 'months' && (!Number.isInteger(value) || value < 1)) return false;
  return true;
}

function sanitizeOverrides(value: unknown): Partial<Assumptions> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const result: Partial<Assumptions> = {};
  for (const [key, assumptionValue] of Object.entries(value)) {
    if (!isAssumptionId(key) || !validateAssumptionValue(key, assumptionValue)) return undefined;
    result[key] = assumptionValue;
  }
  return result;
}

function normalizeText(value: string, field: 'name' | 'description'): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  const maxLength = field === 'name' ? MAX_NAME_LENGTH : MAX_DESCRIPTION_LENGTH;
  if (!normalized) throw new Error(`Scenario ${field} must not be blank.`);
  if (normalized.length > maxLength) throw new Error(`Scenario ${field} must be ${maxLength} characters or fewer.`);
  return normalized;
}

function validateOverrides(overrides: Partial<Assumptions>): Partial<Assumptions> {
  const sanitized = sanitizeOverrides(overrides);
  if (!sanitized) {
    for (const key of ASSUMPTION_IDS) {
      if (key in overrides && !validateAssumptionValue(key, overrides[key])) {
        throw new Error(`Scenario override ${key} must be a valid non-negative value.`);
      }
    }
    throw new Error('Scenario overrides contain an unknown or invalid assumption.');
  }
  return sanitized;
}

function sanitizeRecord(value: unknown): ScenarioRecord | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const candidate = value as Partial<ScenarioRecord>;
  if (!isValidScenarioId(candidate.id)) return undefined;
  const isBuiltInId = BUILT_IN_ID_SET.has(candidate.id);
  if (candidate.isBuiltIn !== isBuiltInId) return undefined;
  if (typeof candidate.name !== 'string' || typeof candidate.description !== 'string') return undefined;
  if (!isValidTimestamp(candidate.createdAt) || !isValidTimestamp(candidate.updatedAt)) return undefined;
  const overrides = sanitizeOverrides(candidate.overrides);
  if (!overrides) return undefined;
  try {
    return {
      id: candidate.id,
      name: normalizeText(candidate.name, 'name'),
      description: normalizeText(candidate.description, 'description'),
      // Current Plan is always the unmodified live model. Treat a persisted
      // override as untrusted storage data and repair it during hydration.
      overrides: candidate.id === 'current-plan' ? {} : overrides,
      isBuiltIn: candidate.isBuiltIn,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    };
  } catch {
    return undefined;
  }
}

/** Parses versioned localStorage data. A bad top-level payload resets safely;
 * isolated malformed custom records are discarded while valid records remain. */
export function hydrateScenarioState(
  raw: string | null,
  assumptions: Assumptions,
  timestamp = new Date().toISOString(),
): ScenarioState {
  if (!raw) return createInitialScenarioState(assumptions, timestamp);
  try {
    const candidate = JSON.parse(raw) as Partial<ScenarioState>;
    if (candidate.version !== SCENARIO_STORAGE_VERSION || !Array.isArray(candidate.scenarios)) {
      return createInitialScenarioState(assumptions, timestamp);
    }
    const seenIds = new Set<string>();
    const scenarios = candidate.scenarios
      .map(sanitizeRecord)
      .filter((scenario): scenario is ScenarioRecord => {
        if (!scenario || seenIds.has(scenario.id)) return false;
        seenIds.add(scenario.id);
        return true;
      });
    const builtInsAreComplete = BUILT_IN_SCENARIO_IDS.every(
      (id) => scenarios.filter((scenario) => scenario.id === id).length === 1,
    );
    if (!builtInsAreComplete) return createInitialScenarioState(assumptions, timestamp);

    const validIds = new Set(scenarios.map((scenario) => scenario.id));
    const activeScenarioId = isValidScenarioId(candidate.activeScenarioId)
      && validIds.has(candidate.activeScenarioId)
      ? candidate.activeScenarioId
      : 'current-plan';
    const comparedScenarioIds = Array.isArray(candidate.comparedScenarioIds)
      ? [...new Set(candidate.comparedScenarioIds.filter(
        (id): id is string => isValidScenarioId(id) && validIds.has(id),
      ))]
      : ['current-plan'];

    return {
      version: SCENARIO_STORAGE_VERSION,
      scenarios,
      activeScenarioId,
      comparedScenarioIds,
    };
  } catch {
    return createInitialScenarioState(assumptions, timestamp);
  }
}

function nextCustomId(scenarios: ScenarioRecord[]): string {
  let maximum = 0;
  for (const scenario of scenarios) {
    const match = CUSTOM_ID_PATTERN.exec(scenario.id);
    if (match) maximum = Math.max(maximum, Number(match[0].slice('scenario-'.length)));
  }
  return `scenario-${maximum + 1}`;
}

export function activateScenario(state: ScenarioState, id: string): ScenarioState {
  if (!state.scenarios.some((scenario) => scenario.id === id)) return state;
  return { ...state, activeScenarioId: id };
}

export function setComparedScenarios(state: ScenarioState, ids: string[]): ScenarioState {
  const validIds = new Set(state.scenarios.map((scenario) => scenario.id));
  return {
    ...state,
    comparedScenarioIds: [...new Set(ids.filter((id) => validIds.has(id)))],
  };
}

export function duplicateScenario(
  state: ScenarioState,
  sourceId: string,
  timestamp = new Date().toISOString(),
): ScenarioState {
  const source = state.scenarios.find((scenario) => scenario.id === sourceId);
  if (!source) return state;
  const copy: ScenarioRecord = {
    ...source,
    id: nextCustomId(state.scenarios),
    name: `${source.name} copy`.slice(0, MAX_NAME_LENGTH),
    overrides: { ...source.overrides },
    isBuiltIn: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return { ...state, scenarios: [...state.scenarios, copy], activeScenarioId: copy.id };
}

export function saveScenario(
  state: ScenarioState,
  input: SaveScenarioInput,
  timestamp = new Date().toISOString(),
): ScenarioState {
  const name = normalizeText(input.name, 'name');
  const description = normalizeText(input.description, 'description');
  const overrides = validateOverrides(input.overrides);

  if (input.id) {
    if (!CUSTOM_ID_PATTERN.test(input.id)) throw new Error('Only a user-created scenario can be saved.');
    const index = state.scenarios.findIndex((scenario) => scenario.id === input.id && !scenario.isBuiltIn);
    if (index < 0) throw new Error(`Custom scenario ${input.id} was not found.`);
    const scenarios = [...state.scenarios];
    scenarios[index] = { ...scenarios[index], name, description, overrides, updatedAt: timestamp };
    return { ...state, scenarios };
  }

  const id = nextCustomId(state.scenarios);
  const record: ScenarioRecord = {
    id,
    name,
    description,
    overrides,
    isBuiltIn: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return { ...state, scenarios: [...state.scenarios, record], activeScenarioId: id };
}

export function deleteScenario(state: ScenarioState, id: string): ScenarioState {
  const record = state.scenarios.find((scenario) => scenario.id === id);
  if (!record || record.isBuiltIn) return state;
  return {
    ...state,
    scenarios: state.scenarios.filter((scenario) => scenario.id !== id),
    activeScenarioId: state.activeScenarioId === id ? 'current-plan' : state.activeScenarioId,
    comparedScenarioIds: state.comparedScenarioIds.filter((scenarioId) => scenarioId !== id),
  };
}

export function resetScenarioState(
  assumptions: Assumptions,
  timestamp = new Date().toISOString(),
): ScenarioState {
  return createInitialScenarioState(assumptions, timestamp);
}
