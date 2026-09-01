import { useCallback, useState } from 'react';

const STORAGE_KEY = 'counterpart-action-plan-completion';

type CompletionMap = Record<string, boolean>;

function loadCompletion(): CompletionMap {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as CompletionMap;
  } catch {
    return {};
  }
}

interface UseActionPlanResult {
  completed: CompletionMap;
  toggle: (itemId: string) => void;
}

/** Persists only the completion map, keyed by the stable action-plan item id
 * (see actionPlan.ts). Items themselves are always recomputed live from the
 * current recommendations, never persisted. */
export function useActionPlan(): UseActionPlanResult {
  const [completed, setCompleted] = useState<CompletionMap>(loadCompletion);

  const toggle = useCallback((itemId: string) => {
    setCompleted((current) => {
      const next = { ...current, [itemId]: !current[itemId] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { completed, toggle };
}
