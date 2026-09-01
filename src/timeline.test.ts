import { describe, expect, test } from 'vitest';
import {
  createTimelineEvent,
  filterTimelineEvents,
  observeTimelineEventIds,
  searchTimelineEvents,
  type TimelineEvent,
} from './timeline';

describe('createTimelineEvent', () => {
  test('assigns an incrementing id and an ISO timestamp', () => {
    const first = createTimelineEvent('Amogh', 'approve', 'Approved a proposal.');
    const second = createTimelineEvent('Growth', 'proposal', 'Proposed a change.');
    expect(first.id).not.toBe(second.id);
    expect(() => new Date(first.timestamp).toISOString()).not.toThrow();
  });

  test('carries actor, icon, sentence, and optional detail', () => {
    const event = createTimelineEvent('Risk', 'rebuttal', 'Rebutted the proposal.', 'Runway would drop below 3 months.');
    expect(event.actor).toBe('Risk');
    expect(event.icon).toBe('rebuttal');
    expect(event.sentence).toBe('Rebutted the proposal.');
    expect(event.detail).toBe('Runway would drop below 3 months.');
  });
});

describe('filterTimelineEvents', () => {
  const events: TimelineEvent[] = [
    { id: 'event-1', timestamp: new Date().toISOString(), actor: 'Amogh', icon: 'approve', sentence: 'a' },
    { id: 'event-2', timestamp: new Date().toISOString(), actor: 'Growth', icon: 'proposal', sentence: 'b' },
    { id: 'event-3', timestamp: new Date().toISOString(), actor: 'Risk', icon: 'rebuttal', sentence: 'c' },
    { id: 'event-4', timestamp: new Date().toISOString(), actor: 'Growth', icon: 'proposal', sentence: 'd' },
  ];

  test('returns all events unfiltered when actor is "all"', () => {
    expect(filterTimelineEvents(events, 'all')).toEqual(events);
  });

  test('returns only events matching the given actor', () => {
    expect(filterTimelineEvents(events, 'Growth')).toEqual([events[1], events[3]]);
  });

  test('returns an empty array when no events match the actor', () => {
    expect(filterTimelineEvents(events, 'Counterpart')).toEqual([]);
  });
});

describe('searchTimelineEvents', () => {
  const events: TimelineEvent[] = [
    { id: 'event-1', timestamp: new Date().toISOString(), actor: 'Amogh', icon: 'approve', sentence: 'Approved a proposal.' },
    { id: 'event-2', timestamp: new Date().toISOString(), actor: 'Growth', icon: 'proposal', sentence: 'Proposed raising CAC.', detail: 'Expected to grow ARR faster.' },
    { id: 'event-3', timestamp: new Date().toISOString(), actor: 'Risk', icon: 'rebuttal', sentence: 'Rebutted the proposal.', detail: 'Runway would drop below 3 months.' },
  ];

  test('returns all events unfiltered for a blank query', () => {
    expect(searchTimelineEvents(events, '')).toEqual(events);
    expect(searchTimelineEvents(events, '   ')).toEqual(events);
  });

  test('matches case-insensitively against the sentence', () => {
    expect(searchTimelineEvents(events, 'proposed')).toEqual([events[1]]);
  });

  test('matches against the optional detail text', () => {
    expect(searchTimelineEvents(events, 'runway')).toEqual([events[2]]);
  });

  test('returns an empty array when nothing matches', () => {
    expect(searchTimelineEvents(events, 'nonexistent')).toEqual([]);
  });
});

describe('observeTimelineEventIds', () => {
  test('advances the id counter past the highest loaded id', () => {
    const loaded: TimelineEvent[] = [
      { id: 'event-1', timestamp: new Date().toISOString(), actor: 'Amogh', icon: 'approve', sentence: 'x' },
      { id: 'event-9', timestamp: new Date().toISOString(), actor: 'Amogh', icon: 'approve', sentence: 'y' },
    ];
    observeTimelineEventIds(loaded);
    const next = createTimelineEvent('Amogh', 'approve', 'z');
    expect(Number(next.id.split('-')[1])).toBeGreaterThan(9);
  });
});
