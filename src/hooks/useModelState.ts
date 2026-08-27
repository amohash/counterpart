import { useMemo, useState } from 'react';
import { computeModel, DEFAULT_ASSUMPTIONS, type Assumptions, type ModelOutput } from '../model';

const STORAGE_KEY = 'counterpart-assumptions';

function loadAssumptions(): Assumptions {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_ASSUMPTIONS;

  try {
    const parsed = JSON.parse(raw) as Partial<Assumptions>;
    return { ...DEFAULT_ASSUMPTIONS, ...parsed };
  } catch {
    return DEFAULT_ASSUMPTIONS;
  }
}

interface UseModelStateResult {
  assumptions: Assumptions;
  output: ModelOutput;
  setAssumption: (key: keyof Assumptions, value: number) => void;
  reset: () => void;
}

export function useModelState(): UseModelStateResult {
  const [assumptions, setAssumptions] = useState<Assumptions>(loadAssumptions);
  const output = useMemo(() => computeModel(assumptions), [assumptions]);

  const setAssumption = (key: keyof Assumptions, value: number) => {
    const next = { ...assumptions, [key]: value };
    setAssumptions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const reset = () => {
    setAssumptions(DEFAULT_ASSUMPTIONS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { assumptions, output, setAssumption, reset };
}
