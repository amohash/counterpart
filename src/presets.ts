import { DEFAULT_ASSUMPTIONS, type Assumptions } from './model';

export const PRESET_IDS = ['saas-in-trouble', 'healthy-growth', 'efficiency-reset'] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export interface Preset {
  id: PresetId;
  name: string;
  description: string;
  assumptions: Assumptions;
  /** Scenario to activate on load so Scenarios opens on the plan that matches the story. */
  scenarioId: string;
  /** Sentence recorded in the decision timeline when this preset is loaded. */
  timelineSentence: string;
}

export function isPresetId(value: unknown): value is PresetId {
  return typeof value === 'string' && (PRESET_IDS as readonly string[]).includes(value);
}

/** Three demo presets from CLAUDE.md section 15. "SaaS in trouble" is the
 * default narrative and is deliberately just DEFAULT_ASSUMPTIONS — the model
 * already produces a critical runway out of the box (see AGENTS.md Phase 19
 * durable decisions), so this preset needs no separate assumption set. */
export const PRESETS: Preset[] = [
  {
    id: 'saas-in-trouble',
    name: 'SaaS in trouble',
    description: 'Aggressive growth spend has outrun revenue; runway is critical.',
    assumptions: DEFAULT_ASSUMPTIONS,
    scenarioId: 'current-plan',
    timelineSentence: 'loaded the "SaaS in trouble" demo preset.',
  },
  {
    id: 'healthy-growth',
    name: 'Healthy growth',
    description: 'Efficient acquisition and strong retention keep runway comfortable while growing.',
    assumptions: {
      startingMRR: 120000,
      newCustomersPerMonth: 50,
      arpu: 300,
      monthlyChurnPct: 2,
      cac: 700,
      grossMarginPct: 82,
      monthlyOpex: 90000,
      months: 24,
    },
    scenarioId: 'current-plan',
    timelineSentence: 'loaded the "Healthy growth" demo preset.',
  },
  {
    id: 'efficiency-reset',
    name: 'Efficiency reset',
    description: 'A leaner operating plan after a deliberate round of cost discipline.',
    assumptions: {
      startingMRR: 90000,
      newCustomersPerMonth: 30,
      arpu: 280,
      monthlyChurnPct: 4,
      cac: 950,
      grossMarginPct: 75,
      monthlyOpex: 95000,
      months: 24,
    },
    scenarioId: 'current-plan',
    timelineSentence: 'loaded the "Efficiency reset" demo preset.',
  },
];

export const DEFAULT_PRESET_ID: PresetId = 'saas-in-trouble';

export function getPreset(id: PresetId): Preset {
  const preset = PRESETS.find((candidate) => candidate.id === id);
  if (!preset) throw new Error(`Unknown preset id: ${id}`);
  return preset;
}

/** Derives the active preset from the live assumptions instead of tracking a
 * separate persisted flag, so it can never drift out of sync with a manual
 * edit — matches this codebase's "derive, don't duplicate state" pattern
 * (see scenarioViewModel.ts). Returns undefined once assumptions no longer
 * exactly match any preset ("Custom"). */
export function detectActivePreset(assumptions: Assumptions): Preset | undefined {
  return PRESETS.find((preset) =>
    (Object.keys(preset.assumptions) as Array<keyof Assumptions>).every(
      (key) => preset.assumptions[key] === assumptions[key],
    ));
}
