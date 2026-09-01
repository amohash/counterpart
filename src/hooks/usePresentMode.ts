import { useState } from 'react';
import { PRESENT_MODE_STEPS, clampStepIndex, type PresentModeStep } from '../presentMode';

export interface UsePresentModeResult {
  isPresentMode: boolean;
  stepIndex: number;
  currentStep: PresentModeStep;
  totalSteps: number;
  enter: () => void;
  exit: () => void;
  next: () => void;
  prev: () => void;
}

/** In-memory-only presentation state (no localStorage): a founder/investor
 * walkthrough is ephemeral and isn't a CLAUDE.md-listed persistence
 * requirement. Thin wrapper over the pure step/clamp logic in
 * `presentMode.ts`, which carries this feature's test coverage. */
export function usePresentMode(): UsePresentModeResult {
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const enter = () => {
    setStepIndex(0);
    setIsPresentMode(true);
  };

  const exit = () => setIsPresentMode(false);

  const next = () => setStepIndex((index) => clampStepIndex(index + 1, PRESENT_MODE_STEPS.length));
  const prev = () => setStepIndex((index) => clampStepIndex(index - 1, PRESENT_MODE_STEPS.length));

  return {
    isPresentMode,
    stepIndex,
    currentStep: PRESENT_MODE_STEPS[stepIndex],
    totalSteps: PRESENT_MODE_STEPS.length,
    enter,
    exit,
    next,
    prev,
  };
}
