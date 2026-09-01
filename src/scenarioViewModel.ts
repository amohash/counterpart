import type { Assumptions } from './model';
import type {
  ScenarioAssumptionsView,
  ScenarioStatus as WorkspaceScenarioStatus,
  ScenarioViewModel,
} from './components/scenarios/ScenarioWorkspace';
import type { DerivedScenario, ScenarioStatus } from './scenarios';

/** `scenarios.ts` and `ScenarioWorkspace` were built with independent status
 * vocabularies. This is the single place that reconciles them. */
const STATUS_MAP: Record<ScenarioStatus, WorkspaceScenarioStatus> = {
  critical: 'risk',
  'at-risk': 'watch',
  healthy: 'healthy',
};

const STATUS_LABEL_MAP: Record<ScenarioStatus, string> = {
  critical: 'Critical',
  'at-risk': 'At risk',
  healthy: 'Healthy',
};

/** Converts derived scenario records (financial-model shape) into the
 * presentational view model `ScenarioWorkspace` renders. */
export function toScenarioViewModels(scenarios: DerivedScenario[]): ScenarioViewModel[] {
  return scenarios.map((scenario) => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    status: STATUS_MAP[scenario.status],
    statusLabel: STATUS_LABEL_MAP[scenario.status],
    isCustom: !scenario.isBuiltIn,
    metrics: {
      runwayMonths: scenario.runwayMonths,
      finalArr: scenario.arr,
      ltvOverCac: scenario.ltvOverCac,
      monthlyBurn: scenario.monthlyBurn,
    },
    deltas: {
      runwayMonths: scenario.deltas.runwayMonths,
      finalArr: scenario.deltas.arr,
      ltvOverCac: scenario.deltas.ltvOverCac,
      monthlyBurn: scenario.deltas.monthlyBurn,
    },
    assumptions: scenario.assumptions,
  }));
}

export interface RunwayComparisonPoint {
  name: string;
  runwayMonths: number;
}

/** Default runway cap (in months) used by `buildRunwayComparisonData` and
 * displayed in `ScenarioComparisonChart`'s caption — kept in one place so the
 * two never drift apart. */
export const DEFAULT_RUNWAY_CAP_MONTHS = 36;

/** Maps compared scenarios' runway metric to chart-friendly points, capping a
 * non-finite (infinite, i.e. never-runs-out) runway at `capMonths` so the
 * comparison chart's axis stays finite. Pure — used by
 * `ScenarioComparisonChart`. */
export function buildRunwayComparisonData(
  scenarios: ScenarioViewModel[],
  capMonths = DEFAULT_RUNWAY_CAP_MONTHS,
): RunwayComparisonPoint[] {
  return scenarios.map((scenario) => ({
    name: scenario.name,
    runwayMonths: Number.isFinite(scenario.metrics.runwayMonths)
      ? scenario.metrics.runwayMonths
      : capMonths,
  }));
}

/** Diffs a full assumptions draft (from the workspace's edit form) against the
 * live base assumptions, keeping only the keys that actually changed. This is
 * the inverse of applying `overrides` on top of `baseAssumptions`. */
export function draftToOverrides(
  draft: ScenarioAssumptionsView,
  baseAssumptions: Assumptions,
): Partial<Assumptions> {
  const overrides: Partial<Assumptions> = {};
  for (const key of Object.keys(draft) as (keyof Assumptions)[]) {
    if (draft[key] !== baseAssumptions[key]) {
      overrides[key] = draft[key];
    }
  }
  return overrides;
}
