import { describe, expect, it } from 'vitest';
import { computeModel } from './model';
import { DEFAULT_PRESET_ID, PRESETS, detectActivePreset, getPreset, isPresetId } from './presets';

describe('PRESETS', () => {
  it('defines exactly the three demo presets from CLAUDE.md section 15', () => {
    expect(PRESETS.map((preset) => preset.id)).toEqual(['saas-in-trouble', 'healthy-growth', 'efficiency-reset']);
  });

  it('defaults to "SaaS in trouble" as the primary narrative', () => {
    expect(DEFAULT_PRESET_ID).toBe('saas-in-trouble');
  });

  it('"SaaS in trouble" produces a critical runway', () => {
    const preset = getPreset('saas-in-trouble');
    const output = computeModel(preset.assumptions);
    expect(output.runwayMonths).toBeLessThan(3);
  });

  it('"Healthy growth" produces a non-critical runway', () => {
    const preset = getPreset('healthy-growth');
    const output = computeModel(preset.assumptions);
    expect(output.runwayMonths).toBeGreaterThan(6);
  });

  it('"Efficiency reset" burns less than "SaaS in trouble" in the final month', () => {
    const trouble = computeModel(getPreset('saas-in-trouble').assumptions);
    const reset = computeModel(getPreset('efficiency-reset').assumptions);
    expect(reset.rows.at(-1)?.burn).toBeLessThan(trouble.rows.at(-1)?.burn ?? Infinity);
  });
});

describe('isPresetId', () => {
  it('accepts known preset ids and rejects unknown values', () => {
    expect(isPresetId('healthy-growth')).toBe(true);
    expect(isPresetId('made-up')).toBe(false);
    expect(isPresetId(42)).toBe(false);
  });
});

describe('detectActivePreset', () => {
  it('matches assumptions that exactly equal a preset', () => {
    const preset = getPreset('healthy-growth');
    expect(detectActivePreset(preset.assumptions)?.id).toBe('healthy-growth');
  });

  it('returns undefined once an assumption has been edited away from every preset', () => {
    const preset = getPreset('healthy-growth');
    const edited = { ...preset.assumptions, monthlyChurnPct: preset.assumptions.monthlyChurnPct + 1 };
    expect(detectActivePreset(edited)).toBeUndefined();
  });
});
