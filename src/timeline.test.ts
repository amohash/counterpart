import { describe, expect, test } from 'vitest';
import { createTimelineEvent, observeTimelineEventIds, type TimelineEvent } from './timeline';

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
