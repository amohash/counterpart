import { useCallback, useState } from 'react';
import type { Assumptions } from '../model';

export interface UseAnnotationsResult {
  /** One note per assumption; a later call for the same targetId replaces it. */
  annotations: Partial<Record<keyof Assumptions, string>>;
  addAnnotation: (targetId: keyof Assumptions, text: string) => void;
}

export function useAnnotations(): UseAnnotationsResult {
  const [annotations, setAnnotations] = useState<Partial<Record<keyof Assumptions, string>>>({});

  const addAnnotation = useCallback((targetId: keyof Assumptions, text: string) => {
    setAnnotations((current) => ({ ...current, [targetId]: text }));
  }, []);

  return { annotations, addAnnotation };
}
