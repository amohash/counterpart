import { describe, expect, test } from 'vitest';
import { computeHealthMetrics } from './health';
import { computeModel, DEFAULT_ASSUMPTIONS } from './model';

describe('computeHealthMetrics', () => {
  test('flags critical runway under 3 months', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS, { monthlyOpex: 10_000_000 });
    const [runway] = computeHealthMetrics(output);
    expect(runway.severity).toBe('risk');
    expect(runway.statusText).toBe('Critical');
  });

  test('flags at-risk runway between 3 and 6 months', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS, { monthlyChurnPct: 50, monthlyOpex: 25_000 });
    const [runway] = computeHealthMetrics(output);
    expect(output.runwayMonths).toBeGreaterThanOrEqual(3);
    expect(output.runwayMonths).toBeLessThanOrEqual(6);
    expect(runway.severity).toBe('watch');
    expect(runway.statusText).toBe('At risk');
  });

  test('marks runway healthy when cash never depletes', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS, { monthlyOpex: 1 });
    const [runway] = computeHealthMetrics(output);
    expect(output.runwayMonths).toBe(Infinity);
    expect(runway.severity).toBe('good');
    expect(runway.value).toBe('Infinite');
  });

  test('flags weak LTV/CAC below 3x', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS, { cac: 100_000 });
    const metrics = computeHealthMetrics(output);
    const ltvOverCac = metrics.find((metric) => metric.id === 'ltvOverCac');
    expect(ltvOverCac?.severity).toBe('risk');
  });

  test('flags burn as cash flow positive when gross profit covers opex', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS, { monthlyOpex: 0 });
    const metrics = computeHealthMetrics(output);
    const burn = metrics.find((metric) => metric.id === 'burn');
    expect(burn?.severity).toBe('good');
    expect(burn?.statusText).toBe('Cash flow positive');
    expect(burn?.value.startsWith('-$')).toBe(true);
  });

  test('returns all four metrics in order runway, arr, ltvOverCac, burn', () => {
    const output = computeModel(DEFAULT_ASSUMPTIONS);
    const metrics = computeHealthMetrics(output);
    expect(metrics.map((metric) => metric.id)).toEqual(['runway', 'arr', 'ltvOverCac', 'burn']);
  });
});
