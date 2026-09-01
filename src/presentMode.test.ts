import { describe, expect, it } from 'vitest';
import { PRESENT_MODE_STEPS, clampStepIndex } from './presentMode';

describe('PRESENT_MODE_STEPS', () => {
  it('defines a fixed, non-empty walkthrough script', () => {
    expect(PRESENT_MODE_STEPS.length).toBeGreaterThan(0);
  });

  it('has unique step ids', () => {
    const ids = PRESENT_MODE_STEPS.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers the decision room, scenarios, and reports views required for the demo path', () => {
    const views = new Set(PRESENT_MODE_STEPS.map((step) => step.view));
    expect(views.has('decision-room')).toBe(true);
    expect(views.has('scenarios')).toBe(true);
    expect(views.has('reports')).toBe(true);
  });
});

describe('clampStepIndex', () => {
  it('clamps an index below zero to zero', () => {
    expect(clampStepIndex(-1, 5)).toBe(0);
  });

  it('clamps an index at or beyond the length to the last valid index', () => {
    expect(clampStepIndex(5, 5)).toBe(4);
    expect(clampStepIndex(99, 5)).toBe(4);
  });

  it('leaves an in-range index unchanged', () => {
    expect(clampStepIndex(2, 5)).toBe(2);
  });

  it('returns 0 for a non-positive length instead of a negative or out-of-range index', () => {
    expect(clampStepIndex(3, 0)).toBe(0);
  });
});
