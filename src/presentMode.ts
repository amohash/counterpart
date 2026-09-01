import type { ViewId } from './components/NavTabs';

/** One step of the fixed founder/investor walkthrough script. `scenarioId`
 * (when present) is the Scenarios-tab card that step should have selected —
 * viewing it only, never activating it, so Present mode never mutates the
 * live model or scenario state. */
export interface PresentModeStep {
  id: string;
  label: string;
  view: ViewId;
  scenarioId?: string;
}

/** Fixed 5-step demo script from the approved Phase 23 Present mode plan
 * (CLAUDE.md section 19's judge-demo path, compressed to fit ~2 minutes). */
export const PRESENT_MODE_STEPS: readonly PresentModeStep[] = [
  { id: 'health', label: 'Financial health', view: 'decision-room' },
  { id: 'risks', label: 'Risks & recommendation', view: 'decision-room' },
  { id: 'scenario', label: 'Explore Cost Control', view: 'scenarios', scenarioId: 'cost-control' },
  { id: 'decisions', label: 'Pending decisions', view: 'decision-room' },
  { id: 'brief', label: 'Board brief', view: 'reports' },
];

/** Clamps a step index into the valid [0, length-1] range instead of
 * wrapping, so Prev/Next at either end of the script is a no-op. */
export function clampStepIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return length - 1;
  return index;
}
