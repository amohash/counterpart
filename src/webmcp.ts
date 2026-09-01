import {
  ASSUMPTION_IDS,
  computeModel,
  isAssumptionId,
  isMonthlySeriesId,
  MONTHLY_SERIES_IDS,
  type Assumptions,
  type ModelOutput,
  type MonthlySeriesId,
} from './model';
import type { ExtraChartSpec } from './hooks/useCharts';
import type { Proposal } from './proposal';
import { validateAskHumanInput } from './questions';
import type { DerivedScenario } from './scenarios';

const LOG_PREFIX = '[webmcp]';

export interface ModelSnapshot {
  assumptions: Assumptions;
  output: ModelOutput;
  proposals: Proposal[];
}

/** Everything the page lets a tool do. Held in a module-level ref so the
 * already-registered tools always reach live React state. */
export interface ModelActions {
  getSnapshot: () => ModelSnapshot;
  proposeEdit: (
    targetId: keyof Assumptions,
    newValue: number,
    rationale: string,
    agentName: string,
  ) => Proposal;
  rebutProposal: (proposalId: string, agentName: string, rationale: string) => void;
  /** Resolves only once Amogh clicks one of the options. Never rejects, never times out. */
  askHuman: (question: string, options: string[]) => Promise<string>;
  annotate: (targetId: keyof Assumptions, text: string) => void;
  addChart: (seriesIds: MonthlySeriesId[], title: string) => ExtraChartSpec;
  /** Flashes the given rows on the page for 2 seconds. */
  highlight: (targetIds: Array<keyof Assumptions>) => void;
  /** The same scenario library the human sees on the Scenarios tab, read-only. */
  getScenarios: () => { scenarios: DerivedScenario[]; activeScenarioId: string };
}

interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input?: unknown) => Promise<ToolResult>;
}

interface ModelContext {
  registerTool: (tool: ToolDefinition) => unknown;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

/** `document.modelContext` is the WebMCP API; reading the deprecated
 * `navigator.modelContext` alias only produces a console warning, so we don't. */
function resolveModelContext(): ModelContext | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.modelContext;
}

/**
 * Module-level so React StrictMode's double effect invocation (and Vite HMR)
 * cannot register the same tool name twice. The getter is swapped on re-mount
 * so the already-registered tool keeps reading live state.
 */
let currentActions: ModelActions | undefined;
let isRegistered = false;
let hasWarnedMissing = false;

/**
 * Generated fresh on every page load, never rendered in the DOM, and absent
 * from the deployed bundle — so an agent can only quote it by calling the tool.
 * The value is logged once so a human can compare.
 */
const VERIFICATION_CODE = `CTRPRT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
console.log(`${LOG_PREFIX} verification code for this page load: ${VERIFICATION_CODE}`);

function round(value: number): number | null {
  return Number.isFinite(value) ? Math.round(value) : null;
}

/** Compact, whole-number JSON of the whole model. Kept small enough for an agent prompt. */
export function compactJson(snapshot: ModelSnapshot): string {
  const { assumptions, output, proposals } = snapshot;

  const payload = {
    verificationCode: VERIFICATION_CODE,
    assumptions,
    headline: {
      arr: round(output.rows[output.rows.length - 1]?.arr ?? 0),
      ltv: round(output.ltv),
      ltvOverCac: Number.isFinite(output.ltvOverCac)
        ? Math.round(output.ltvOverCac * 10) / 10
        : null,
      runwayMonths: round(output.runwayMonths),
    },
    monthlyLegend: ['month', 'mrr', 'cumulativeCash'],
    monthly: output.rows.map((row) => [row.month, round(row.mrr), round(row.cumulativeCash)]),
    pendingProposals: proposals
      .filter((proposal) => proposal.status === 'pending')
      .map((proposal) => ({
        id: proposal.id,
        targetId: proposal.targetId,
        oldValue: assumptions[proposal.targetId],
        newValue: proposal.newValue,
        rationale: proposal.rationale,
        agentName: proposal.agentId,
        rebuttals: (proposal.rebuttals ?? []).map((rebuttal) => ({
          agentName: rebuttal.agentId,
          rationale: rebuttal.rationale,
        })),
      })),
  };

  return JSON.stringify(payload);
}

const GET_MODEL_STATE: ToolDefinition = {
  name: 'get_model_state',
  description:
    'Returns the current financial model: assumptions, computed monthly projections, headline metrics, and any pending proposals. Call this first, before anything else.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  execute: async () => {
    const snapshot = currentActions?.getSnapshot();
    if (!snapshot) {
      console.error(`${LOG_PREFIX} get_model_state called with no snapshot available`);
      return { content: [{ type: 'text', text: '{"error":"model state unavailable"}' }] };
    }

    const text = compactJson(snapshot);
    console.log(`${LOG_PREFIX} get_model_state -> ${text.length} chars`);
    return { content: [{ type: 'text', text }] };
  },
};

export interface ProposeEditInput {
  targetId: keyof Assumptions;
  newValue: number;
  rationale: string;
  agentName: string;
}

/**
 * Validates agent-supplied arguments at the boundary. Throws so the failure
 * surfaces to the agent as a tool error it can read and correct, rather than a
 * silently ignored call.
 */
export function validateProposeEditInput(input: unknown): ProposeEditInput {
  const raw = (input ?? {}) as Record<string, unknown>;

  if (!isAssumptionId(raw.targetId)) {
    throw new Error(
      `Unknown targetId ${JSON.stringify(raw.targetId)}. Valid ids: ${ASSUMPTION_IDS.join(', ')}.`,
    );
  }

  const newValue = typeof raw.newValue === 'string' ? Number(raw.newValue) : raw.newValue;
  if (typeof newValue !== 'number' || !Number.isFinite(newValue)) {
    throw new Error(`newValue must be a finite number, got ${JSON.stringify(raw.newValue)}.`);
  }

  const rationale = typeof raw.rationale === 'string' ? raw.rationale.trim() : '';
  if (!rationale) {
    throw new Error('rationale is required — explain why this change is worth making.');
  }

  const agentName = typeof raw.agentName === 'string' ? raw.agentName.trim() : '';
  if (!agentName) {
    throw new Error('agentName is required — which agent is making this proposal.');
  }

  return { targetId: raw.targetId, newValue, rationale, agentName };
}

/** The exact sentence the agent reads back, so it knows the edit is not applied yet. */
export function formatProposeEditResult(
  targetId: keyof Assumptions,
  oldValue: number,
  newValue: number,
): string {
  return `Proposed ${targetId} ${oldValue} -> ${newValue}. Awaiting Amogh's approval.`;
}

const PROPOSE_EDIT: ToolDefinition = {
  name: 'propose_edit',
  description:
    "Proposes a change to one assumption. The change is NOT applied — it appears on the page as a pending proposal that Amogh must accept or reject, and the numbers do not move until he accepts. Call get_model_state first to see valid assumption ids and current values. If Amogh's request is ambiguous about which assumption, what unit, or what time period he means (for example \"15% churn\" could be monthly or annual), you MUST call ask_human to resolve it before calling this tool — do not guess and do not state your assumption instead of asking.",
  inputSchema: {
    type: 'object',
    properties: {
      targetId: {
        type: 'string',
        enum: ASSUMPTION_IDS,
        description: 'Which assumption to change.',
      },
      newValue: { type: 'number', description: 'The proposed new value.' },
      rationale: {
        type: 'string',
        description: 'One short sentence on why this change is worth making.',
      },
      agentName: {
        type: 'string',
        description: 'Which agent is proposing this, e.g. "Growth" or "Risk".',
      },
    },
    required: ['targetId', 'newValue', 'rationale', 'agentName'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} propose_edit called with no page actions available`);
      throw new Error('The page is not ready to accept proposals yet.');
    }

    const { targetId, newValue, rationale, agentName } = validateProposeEditInput(input);
    const oldValue = actions.getSnapshot().assumptions[targetId];
    const proposal = actions.proposeEdit(targetId, newValue, rationale, agentName);

    const text = formatProposeEditResult(targetId, oldValue, newValue);
    console.log(`${LOG_PREFIX} propose_edit -> ${proposal.id} ${text}`);
    return { content: [{ type: 'text', text }] };
  },
};

export interface RebutProposalInput {
  proposalId: string;
  agentName: string;
  rationale: string;
}

/** Proposal ids are generated locally as `proposal-<positive integer>`.
 * Validate the format before looking up live state so malformed agent input
 * fails clearly instead of behaving like an arbitrary missing identifier. */
export function isProposalId(value: string): boolean {
  return /^proposal-[1-9]\d*$/.test(value);
}

export function validateRebutProposalInput(input: unknown): RebutProposalInput {
  const raw = (input ?? {}) as Record<string, unknown>;
  const proposalId = typeof raw.proposalId === 'string' ? raw.proposalId.trim() : '';
  if (!isProposalId(proposalId)) {
    throw new Error('proposalId must be a valid id returned by get_model_state, e.g. proposal-1.');
  }

  const agentName = typeof raw.agentName === 'string' ? raw.agentName.trim() : '';
  if (!agentName) {
    throw new Error('agentName is required — which agent is making this rebuttal.');
  }

  const rationale = typeof raw.rationale === 'string' ? raw.rationale.trim() : '';
  if (!rationale) {
    throw new Error('rationale is required — explain the counterargument.');
  }

  return { proposalId, agentName, rationale };
}

const REBUT_PROPOSAL: ToolDefinition = {
  name: 'rebut_proposal',
  description:
    'Adds a counterargument beneath an existing proposal without accepting, rejecting, or changing it. Call get_model_state first to find the pending proposal id and read the proposal and any existing rebuttals.',
  inputSchema: {
    type: 'object',
    properties: {
      proposalId: {
        type: 'string',
        description: 'The id of the proposal to rebut, from get_model_state.',
      },
      agentName: {
        type: 'string',
        description: 'Which agent is rebutting, e.g. "Growth" or "Risk".',
      },
      rationale: {
        type: 'string',
        description: 'One short sentence stating the counterargument.',
      },
    },
    required: ['proposalId', 'agentName', 'rationale'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} rebut_proposal called with no page actions available`);
      throw new Error('The page is not ready to accept rebuttals yet.');
    }

    const { proposalId, agentName, rationale } = validateRebutProposalInput(input);
    const proposal = actions.getSnapshot().proposals.find((item) => item.id === proposalId);
    if (!proposal) {
      throw new Error(`Unknown proposalId ${JSON.stringify(proposalId)}. Call get_model_state again.`);
    }

    actions.rebutProposal(proposalId, agentName, rationale);
    const text = `Added ${agentName}'s rebuttal to ${proposalId}. Its status is still ${proposal.status}.`;
    console.log(`${LOG_PREFIX} rebut_proposal -> ${text}`);
    return { content: [{ type: 'text', text }] };
  },
};

/**
 * Chrome's agent treats a long-blocking tool call as the end of its turn and
 * stops. Returning the answer plus an explicit instruction to continue keeps it
 * working; the chosen option is still the first thing it reads.
 */
export function formatAskHumanResult(answer: string): string {
  return `${answer} — Amogh answered; continue the task now using this answer.`;
}

const ASK_HUMAN: ToolDefinition = {
  name: 'ask_human',
  description:
    "Asks Amogh a question and waits for his answer, returning the exact option he chose. A card appears on the page with the question and one button per option; this call does not return until he clicks one. Use this whenever his instruction is ambiguous rather than picking an interpretation yourself — units (monthly vs annual, percent vs absolute), which assumption he means, or which of several changes he wants. Asking is cheap and expected; guessing wrong wastes his time.",
  inputSchema: {
    type: 'object',
    properties: {
      question: {
        type: 'string',
        description: 'One short, specific question. Amogh reads this on the page.',
      },
      options: {
        type: 'array',
        items: { type: 'string' },
        minItems: 2,
        maxItems: 6,
        description: 'Between 2 and 6 distinct answers, each short enough to fit on a button.',
      },
    },
    required: ['question', 'options'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} ask_human called with no page actions available`);
      throw new Error('The page is not ready to ask questions yet.');
    }

    const { question, options } = validateAskHumanInput(input);
    console.log(`${LOG_PREFIX} ask_human -> waiting on "${question}" [${options.join(', ')}]`);

    const answer = await actions.askHuman(question, options);
    console.log(`${LOG_PREFIX} ask_human <- ${answer}`);
    return { content: [{ type: 'text', text: formatAskHumanResult(answer) }] };
  },
};

export interface RunScenarioInput {
  overrides: Partial<Assumptions>;
}

/** Validates that every override key is a real assumption id and every value
 * is a finite number, so a bad key or a NaN throws instead of silently no-op-ing. */
export function validateRunScenarioInput(input: unknown): RunScenarioInput {
  const raw = (input ?? {}) as Record<string, unknown>;
  const rawOverrides = (raw.overrides ?? {}) as Record<string, unknown>;
  const overrides: Partial<Assumptions> = {};

  for (const [key, value] of Object.entries(rawOverrides)) {
    if (!isAssumptionId(key)) {
      throw new Error(`Unknown override key ${JSON.stringify(key)}. Valid ids: ${ASSUMPTION_IDS.join(', ')}.`);
    }
    const numericValue = typeof value === 'string' ? Number(value) : value;
    if (typeof numericValue !== 'number' || !Number.isFinite(numericValue)) {
      throw new Error(`Override ${key} must be a finite number, got ${JSON.stringify(value)}.`);
    }
    overrides[key] = numericValue;
  }

  return { overrides };
}

/** Rounds and formats the same headline shape get_model_state returns, so an
 * agent can compare scenarios against the live model directly. */
export function formatRunScenarioResult(output: ModelOutput): string {
  const arr = output.rows[output.rows.length - 1]?.arr ?? 0;
  const payload = {
    arr: Math.round(arr),
    ltv: Number.isFinite(output.ltv) ? Math.round(output.ltv) : null,
    ltvOverCac: Number.isFinite(output.ltvOverCac) ? Math.round(output.ltvOverCac * 10) / 10 : null,
    runwayMonths: Number.isFinite(output.runwayMonths) ? Math.round(output.runwayMonths) : null,
  };
  return JSON.stringify(payload);
}

const RUN_SCENARIO: ToolDefinition = {
  name: 'run_scenario',
  description:
    'Computes headline metrics (arr, ltv, ltvOverCac, runwayMonths) with temporary overrides applied on top of the current assumptions. Nothing on the page changes — this is read-only, for comparing options before calling propose_edit. Call get_model_state first to see valid assumption ids.',
  inputSchema: {
    type: 'object',
    properties: {
      overrides: {
        type: 'object',
        description: 'Assumption id -> temporary value, applied only for this calculation.',
        additionalProperties: { type: 'number' },
      },
    },
    required: ['overrides'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} run_scenario called with no page actions available`);
      throw new Error('The page is not ready to run scenarios yet.');
    }

    const { overrides } = validateRunScenarioInput(input);
    const { assumptions } = actions.getSnapshot();
    const output = computeModel(assumptions, overrides);

    const text = formatRunScenarioResult(output);
    console.log(`${LOG_PREFIX} run_scenario -> ${text}`);
    return { content: [{ type: 'text', text }] };
  },
};

export interface AnnotateInput {
  targetId: keyof Assumptions;
  text: string;
}

export function validateAnnotateInput(input: unknown): AnnotateInput {
  const raw = (input ?? {}) as Record<string, unknown>;

  if (!isAssumptionId(raw.targetId)) {
    throw new Error(
      `Unknown targetId ${JSON.stringify(raw.targetId)}. Valid ids: ${ASSUMPTION_IDS.join(', ')}.`,
    );
  }

  const text = typeof raw.text === 'string' ? raw.text.trim() : '';
  if (!text) {
    throw new Error('text is required — the note shown next to the row.');
  }

  return { targetId: raw.targetId, text };
}

const ANNOTATE: ToolDefinition = {
  name: 'annotate',
  description:
    'Pins a short note next to one assumption row on the page, visible to Amogh. A later call for the same targetId replaces the note rather than adding another. Call get_model_state first to see valid assumption ids.',
  inputSchema: {
    type: 'object',
    properties: {
      targetId: {
        type: 'string',
        enum: ASSUMPTION_IDS,
        description: 'Which assumption row to pin the note next to.',
      },
      text: { type: 'string', description: 'A short note, one sentence.' },
    },
    required: ['targetId', 'text'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} annotate called with no page actions available`);
      throw new Error('The page is not ready to accept annotations yet.');
    }

    const { targetId, text } = validateAnnotateInput(input);
    actions.annotate(targetId, text);

    const result = `Noted on ${targetId}: ${text}`;
    console.log(`${LOG_PREFIX} annotate -> ${result}`);
    return { content: [{ type: 'text', text: result }] };
  },
};

export interface AddChartInput {
  seriesIds: MonthlySeriesId[];
  title: string;
}

export function validateAddChartInput(input: unknown): AddChartInput {
  const raw = (input ?? {}) as Record<string, unknown>;
  const rawSeriesIds = Array.isArray(raw.seriesIds) ? raw.seriesIds : [];

  if (rawSeriesIds.length === 0) {
    throw new Error(`seriesIds is required — at least one of ${MONTHLY_SERIES_IDS.join(', ')}.`);
  }

  const seriesIds = rawSeriesIds.map((seriesId) => {
    if (!isMonthlySeriesId(seriesId)) {
      throw new Error(
        `Unknown seriesId ${JSON.stringify(seriesId)}. Valid ids: ${MONTHLY_SERIES_IDS.join(', ')}.`,
      );
    }
    return seriesId;
  });

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) {
    throw new Error('title is required — shown above the chart.');
  }

  return { seriesIds, title };
}

const ADD_CHART: ToolDefinition = {
  name: 'add_chart',
  description:
    'Adds a new line chart below the existing charts, plotting one or more monthly series. Does not replace or change the existing MRR chart. Call get_model_state first if unsure which series are available.',
  inputSchema: {
    type: 'object',
    properties: {
      seriesIds: {
        type: 'array',
        items: { type: 'string', enum: MONTHLY_SERIES_IDS },
        minItems: 1,
        description: 'Which monthly series to plot together on this chart.',
      },
      title: { type: 'string', description: 'Title shown above the chart.' },
    },
    required: ['seriesIds', 'title'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} add_chart called with no page actions available`);
      throw new Error('The page is not ready to add charts yet.');
    }

    const { seriesIds, title } = validateAddChartInput(input);
    const chart = actions.addChart(seriesIds, title);

    const result = `Added chart "${title}" (${seriesIds.join(', ')}).`;
    console.log(`${LOG_PREFIX} add_chart -> ${chart.id} ${result}`);
    return { content: [{ type: 'text', text: result }] };
  },
};

export interface HighlightInput {
  targetIds: Array<keyof Assumptions>;
}

export function validateHighlightInput(input: unknown): HighlightInput {
  const raw = (input ?? {}) as Record<string, unknown>;
  const rawTargetIds = Array.isArray(raw.targetIds) ? raw.targetIds : [];

  if (rawTargetIds.length === 0) {
    throw new Error('targetIds is required — at least one assumption id to flash.');
  }

  const targetIds = rawTargetIds.map((targetId) => {
    if (!isAssumptionId(targetId)) {
      throw new Error(
        `Unknown targetId ${JSON.stringify(targetId)}. Valid ids: ${ASSUMPTION_IDS.join(', ')}.`,
      );
    }
    return targetId;
  });

  return { targetIds };
}

const HIGHLIGHT: ToolDefinition = {
  name: 'highlight',
  description:
    'Flashes one or more assumption rows on the page for 2 seconds, to draw Amogh\'s attention to them — for example the row most responsible for a risky scenario. Call get_model_state first to see valid assumption ids.',
  inputSchema: {
    type: 'object',
    properties: {
      targetIds: {
        type: 'array',
        items: { type: 'string', enum: ASSUMPTION_IDS },
        minItems: 1,
        description: 'Which assumption rows to flash.',
      },
    },
    required: ['targetIds'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} highlight called with no page actions available`);
      throw new Error('The page is not ready to highlight rows yet.');
    }

    const { targetIds } = validateHighlightInput(input);
    actions.highlight(targetIds);

    const result = `Highlighted ${targetIds.join(', ')} for 2 seconds.`;
    console.log(`${LOG_PREFIX} highlight -> ${result}`);
    return { content: [{ type: 'text', text: result }] };
  },
};

/** Compact list of the human-curated scenario library (built-in + saved),
 * with the same metrics shown on the Scenarios tab, so an agent can reference
 * scenarios by name instead of guessing overrides. Read-only. */
export function formatListScenariosResult(scenarios: DerivedScenario[], activeScenarioId: string): string {
  const payload = {
    scenarios: scenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      isBuiltIn: scenario.isBuiltIn,
      isActive: scenario.id === activeScenarioId,
      status: scenario.status,
      runwayMonths: round(scenario.runwayMonths),
      arr: round(scenario.arr),
      ltvOverCac: Number.isFinite(scenario.ltvOverCac) ? Math.round(scenario.ltvOverCac * 10) / 10 : null,
      monthlyBurn: round(scenario.monthlyBurn),
    })),
  };
  return JSON.stringify(payload);
}

const LIST_SCENARIOS: ToolDefinition = {
  name: 'list_scenarios',
  description:
    'Lists the saved scenario library (Current Plan and any built-in or human-saved scenarios) with their runway, ARR, LTV/CAC, and burn, and which one is currently active. Read-only — activating a scenario is a human action on the Scenarios tab. Use this to reference a scenario by name before calling run_scenario or propose_edit.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  execute: async () => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} list_scenarios called with no page actions available`);
      return { content: [{ type: 'text', text: '{"error":"scenario list unavailable"}' }] };
    }

    const { scenarios, activeScenarioId } = actions.getScenarios();
    const text = formatListScenariosResult(scenarios, activeScenarioId);
    console.log(`${LOG_PREFIX} list_scenarios -> ${text.length} chars`);
    return { content: [{ type: 'text', text }] };
  },
};

const TOOLS: ToolDefinition[] = [
  GET_MODEL_STATE,
  PROPOSE_EDIT,
  REBUT_PROPOSAL,
  ASK_HUMAN,
  RUN_SCENARIO,
  ANNOTATE,
  ADD_CHART,
  HIGHLIGHT,
  LIST_SCENARIOS,
];

/**
 * Registers the WebMCP tools once. Returns false when the browser exposes no
 * model context (or registration throws) so the UI can show a badge instead of
 * crashing.
 */
export function registerModelTools(actions: ModelActions): boolean {
  currentActions = actions;

  const context = resolveModelContext();
  if (!context || typeof context.registerTool !== 'function') {
    if (!hasWarnedMissing) {
      hasWarnedMissing = true;
      console.warn(`${LOG_PREFIX} document.modelContext not available yet — will keep retrying`);
    }
    return false;
  }

  if (isRegistered) return true;

  try {
    TOOLS.forEach((tool) => context.registerTool(tool));
    isRegistered = true;
    const names = TOOLS.map((tool) => tool.name).join(', ');
    console.log(`${LOG_PREFIX} registered ${names} via document.modelContext`);
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} registerTool failed`, error);
    return false;
  }
}
