import { useCallback, useState } from 'react';
import { createTimelineEvent, observeTimelineEventIds, type TimelineEvent, type TimelineIconKey } from '../timeline';

const STORAGE_KEY = 'counterpart-timeline';

function loadEvents(): TimelineEvent[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as TimelineEvent[];
    observeTimelineEventIds(parsed);
    return parsed;
  } catch {
    return [];
  }
}

interface UseTimelineResult {
  /** Most recent event first. */
  events: TimelineEvent[];
  addEvent: (actor: string, icon: TimelineIconKey, sentence: string, detail?: string) => void;
}

export function useTimeline(): UseTimelineResult {
  const [events, setEvents] = useState<TimelineEvent[]>(loadEvents);

  const addEvent = useCallback((actor: string, icon: TimelineIconKey, sentence: string, detail?: string) => {
    setEvents((current) => {
      const next = [createTimelineEvent(actor, icon, sentence, detail), ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { events, addEvent };
}
