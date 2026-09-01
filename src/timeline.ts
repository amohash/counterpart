export type TimelineIconKey =
  | 'read'
  | 'risk'
  | 'scenario'
  | 'proposal'
  | 'rebuttal'
  | 'approve'
  | 'reject'
  | 'report'
  | 'preset'
  | 'plan';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  icon: TimelineIconKey;
  sentence: string;
  detail?: string;
}

let nextId = 1;

/** Creates one decision-timeline event. `actor` is a display name — a human
 * name, "Growth", "Risk", or "Counterpart" for system events. */
export function createTimelineEvent(
  actor: string,
  icon: TimelineIconKey,
  sentence: string,
  detail?: string,
): TimelineEvent {
  const id = `event-${nextId}`;
  nextId += 1;
  return {
    id,
    timestamp: new Date().toISOString(),
    actor,
    icon,
    sentence,
    detail,
  };
}

/** Filters a timeline to events from one actor, or returns it unchanged when
 * `actor` is `'all'`. Pure — used by the Decision timeline's actor filter. */
export function filterTimelineEvents(events: TimelineEvent[], actor: string): TimelineEvent[] {
  if (actor === 'all') return events;
  return events.filter((event) => event.actor === actor);
}

/** Keeps the in-process id counter ahead of any events loaded from
 * localStorage, mirroring proposal.ts's observeProposalIds. */
export function observeTimelineEventIds(events: TimelineEvent[]): void {
  for (const event of events) {
    const match = /^event-(\d+)$/.exec(event.id);
    if (match) nextId = Math.max(nextId, Number(match[1]) + 1);
  }
}
