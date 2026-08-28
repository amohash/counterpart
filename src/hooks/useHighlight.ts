import { useCallback, useRef, useState } from 'react';
import type { Assumptions } from '../model';

const HIGHLIGHT_DURATION_MS = 2000;

export interface UseHighlightResult {
  highlightedIds: ReadonlySet<keyof Assumptions>;
  /** Flashes the given rows for 2 seconds. A later call replaces the set and
   * restarts the timer, rather than stacking. */
  highlight: (targetIds: Array<keyof Assumptions>) => void;
}

export function useHighlight(): UseHighlightResult {
  const [highlightedIds, setHighlightedIds] = useState<ReadonlySet<keyof Assumptions>>(new Set());
  const timerRef = useRef<number | undefined>(undefined);

  const highlight = useCallback((targetIds: Array<keyof Assumptions>) => {
    window.clearTimeout(timerRef.current);
    setHighlightedIds(new Set(targetIds));
    timerRef.current = window.setTimeout(() => {
      setHighlightedIds(new Set());
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  return { highlightedIds, highlight };
}
