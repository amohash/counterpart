import { ASSUMPTION_IDS, isAssumptionId, type Assumptions, type ModelOutput } from './model';
import type { Proposal } from './proposal';
import { validateAskHumanInput } from './questions';

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
  proposeEdit: (targetId: keyof Assumptions, newValue: number, rationale: string) => Proposal;
  /** Resolves only once Amogh clicks one of the options. Never rejects, never times out. */
  askHuman: (question: string, options: string[]) => Promise<string>;
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

  return { targetId: raw.targetId, newValue, rationale };
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
    },
    required: ['targetId', 'newValue', 'rationale'],
    additionalProperties: false,
  },
  execute: async (input) => {
    const actions = currentActions;
    if (!actions) {
      console.error(`${LOG_PREFIX} propose_edit called with no page actions available`);
      throw new Error('The page is not ready to accept proposals yet.');
    }

    const { targetId, newValue, rationale } = validateProposeEditInput(input);
    const oldValue = actions.getSnapshot().assumptions[targetId];
    const proposal = actions.proposeEdit(targetId, newValue, rationale);

    const text = formatProposeEditResult(targetId, oldValue, newValue);
    console.log(`${LOG_PREFIX} propose_edit -> ${proposal.id} ${text}`);
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

const TOOLS: ToolDefinition[] = [GET_MODEL_STATE, PROPOSE_EDIT, ASK_HUMAN];

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
