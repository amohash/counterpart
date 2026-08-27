import type { Assumptions, ModelOutput } from './model';
import type { Proposal } from './proposal';

const LOG_PREFIX = '[webmcp]';

export interface ModelSnapshot {
  assumptions: Assumptions;
  output: ModelOutput;
  proposals: Proposal[];
}

interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: () => Promise<ToolResult>;
}

interface ModelContext {
  registerTool: (tool: ToolDefinition) => unknown;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

/**
 * Module-level so React StrictMode's double effect invocation (and Vite HMR)
 * cannot register the same tool name twice. The getter is swapped on re-mount
 * so the already-registered tool keeps reading live state.
 */
let currentGetSnapshot: (() => ModelSnapshot) | undefined;
let isRegistered = false;
let hasWarnedMissing = false;

function round(value: number): number | null {
  return Number.isFinite(value) ? Math.round(value) : null;
}

/** Compact, whole-number JSON of the whole model. Kept small enough for an agent prompt. */
export function compactJson(snapshot: ModelSnapshot): string {
  const { assumptions, output, proposals } = snapshot;

  const payload = {
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

/**
 * Registers the WebMCP tools once. Returns false when the browser has no
 * `document.modelContext` (or registration throws) so the UI can show a badge
 * instead of crashing.
 */
export function registerModelTools(getSnapshot: () => ModelSnapshot): boolean {
  const modelContext = typeof document === 'undefined' ? undefined : document.modelContext;
  currentGetSnapshot = getSnapshot;

  if (!modelContext || typeof modelContext.registerTool !== 'function') {
    if (!hasWarnedMissing) {
      hasWarnedMissing = true;
      console.warn(`${LOG_PREFIX} document.modelContext not available yet — will keep retrying`);
    }
    return false;
  }

  if (isRegistered) {
    console.log(`${LOG_PREFIX} get_model_state already registered — reusing`);
    return true;
  }

  try {
    modelContext.registerTool({
      name: 'get_model_state',
      description:
        'Returns the current financial model: assumptions, computed monthly projections, headline metrics, and any pending proposals. Call this first, before anything else.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      execute: async () => {
        const snapshot = currentGetSnapshot?.();
        if (!snapshot) {
          console.error(`${LOG_PREFIX} get_model_state called with no snapshot available`);
          return { content: [{ type: 'text', text: '{"error":"model state unavailable"}' }] };
        }

        const text = compactJson(snapshot);
        console.log(`${LOG_PREFIX} get_model_state -> ${text.length} chars`);
        return { content: [{ type: 'text', text }] };
      },
    });

    isRegistered = true;
    console.log(`${LOG_PREFIX} registered get_model_state`);
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} registerTool failed`, error);
    return false;
  }
}
