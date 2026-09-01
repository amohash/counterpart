import { useCallback, useMemo, useState } from 'react';
import type { Assumptions } from '../model';
import {
  SCENARIO_STORAGE_KEY,
  activateScenario as activateScenarioState,
  deleteScenario as deleteScenarioState,
  deriveScenarios,
  duplicateScenario as duplicateScenarioState,
  hydrateScenarioState,
  resetScenarioState,
  saveScenario as saveScenarioState,
  setComparedScenarios,
  type DerivedScenario,
  type SaveScenarioInput,
  type ScenarioRecord,
  type ScenarioState,
} from '../scenarios';

export interface UseScenariosResult {
  /** Source records persisted to localStorage. Financial metrics are derived separately. */
  scenarioRecords: ScenarioRecord[];
  scenarios: DerivedScenario[];
  activeScenarioId: string;
  activeScenario: DerivedScenario;
  comparedScenarioIds: string[];
  comparedScenarios: DerivedScenario[];
  activate: (id: string) => void;
  duplicate: (id: string) => void;
  save: (input: SaveScenarioInput) => void;
  remove: (id: string) => void;
  reset: () => void;
  setCompared: (ids: string[]) => void;
  toggleCompared: (id: string) => void;
}

function loadScenarioState(baseAssumptions: Assumptions): ScenarioState {
  const state = hydrateScenarioState(
    localStorage.getItem(SCENARIO_STORAGE_KEY),
    baseAssumptions,
  );
  // Persist seeds on first load and repair any malformed records immediately.
  localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function useScenarios(baseAssumptions: Assumptions): UseScenariosResult {
  const [state, setState] = useState<ScenarioState>(() => loadScenarioState(baseAssumptions));

  const update = useCallback((transition: (current: ScenarioState) => ScenarioState) => {
    setState((current) => {
      const next = transition(current);
      if (next !== current) localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const scenarios = useMemo(
    () => deriveScenarios(state.scenarios, baseAssumptions),
    [state.scenarios, baseAssumptions],
  );
  const activeScenario = scenarios.find((scenario) => scenario.id === state.activeScenarioId)
    ?? scenarios.find((scenario) => scenario.id === 'current-plan')
    ?? scenarios[0];
  const comparedScenarios = state.comparedScenarioIds
    .map((id) => scenarios.find((scenario) => scenario.id === id))
    .filter((scenario): scenario is DerivedScenario => scenario !== undefined);

  const activate = useCallback((id: string) => {
    update((current) => activateScenarioState(current, id));
  }, [update]);

  const duplicate = useCallback((id: string) => {
    update((current) => duplicateScenarioState(current, id));
  }, [update]);

  const save = useCallback((input: SaveScenarioInput) => {
    update((current) => saveScenarioState(current, input));
  }, [update]);

  const remove = useCallback((id: string) => {
    update((current) => deleteScenarioState(current, id));
  }, [update]);

  const reset = useCallback(() => {
    const next = resetScenarioState(baseAssumptions);
    setState(next);
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(next));
  }, [baseAssumptions]);

  const setCompared = useCallback((ids: string[]) => {
    update((current) => setComparedScenarios(current, ids));
  }, [update]);

  const toggleCompared = useCallback((id: string) => {
    update((current) => {
      const compared = current.comparedScenarioIds.includes(id)
        ? current.comparedScenarioIds.filter((scenarioId) => scenarioId !== id)
        : [...current.comparedScenarioIds, id];
      return setComparedScenarios(current, compared);
    });
  }, [update]);

  return {
    scenarioRecords: state.scenarios,
    scenarios,
    activeScenarioId: activeScenario.id,
    activeScenario,
    comparedScenarioIds: state.comparedScenarioIds,
    comparedScenarios,
    activate,
    duplicate,
    save,
    remove,
    reset,
    setCompared,
    toggleCompared,
  };
}
