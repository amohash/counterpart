import { formatCurrency, formatRatio } from './health';
import type { Assumptions, ModelOutput } from './model';
import type { Proposal } from './proposal';
import type { Recommendation } from './recommendations';
import type { Risk } from './risks';

export interface BoardBriefSnapshot {
  arr: number;
  runwayMonths: number;
  monthlyBurn: number;
  ltvOverCac: number;
  activeScenarioName: string;
}

export interface BoardBriefDecision {
  targetId: keyof Assumptions;
  newValue: number;
  rationale: string;
  agentId: string;
}

export interface BoardBriefData {
  generatedAt: string;
  snapshot: BoardBriefSnapshot;
  keyRisks: Risk[];
  recommendedActions: Recommendation[];
  approvedDecisions: BoardBriefDecision[];
  pendingDecisions: BoardBriefDecision[];
  outlook: string;
}

function lastRow(output: ModelOutput) {
  return output.rows[output.rows.length - 1];
}

function toDecision(proposal: Proposal): BoardBriefDecision {
  return {
    targetId: proposal.targetId,
    newValue: proposal.newValue,
    rationale: proposal.rationale,
    agentId: proposal.agentId,
  };
}

function buildOutlook(risks: Risk[], activeScenarioName: string): string {
  if (risks.length === 0) {
    return `The model shows no active deterministic risks under ${activeScenarioName}. Focus stays on sustaining current performance.`;
  }
  const mostSevere = risks[0];
  return `Under ${activeScenarioName}, the most pressing risk is "${mostSevere.title}". Addressing it is the near-term priority before pursuing further growth investment.`;
}

/** Deterministic board-ready update. No external LLM call — every line
 * traces back to the live model, the risk rules in risks.ts, the
 * recommendation rules in recommendations.ts, and the current proposal
 * list, matching the "grounded, not generated" principle in CLAUDE.md. */
export function generateBoardBrief(
  output: ModelOutput,
  risks: Risk[],
  recommendations: Recommendation[],
  proposals: Proposal[],
  activeScenarioName: string,
  now: string = new Date().toISOString(),
): BoardBriefData {
  const row = lastRow(output);
  const approvedDecisions = proposals.filter((proposal) => proposal.status === 'accepted').map(toDecision);
  const pendingDecisions = proposals.filter((proposal) => proposal.status === 'pending').map(toDecision);

  return {
    generatedAt: now,
    snapshot: {
      arr: row?.arr ?? 0,
      runwayMonths: output.runwayMonths,
      monthlyBurn: row?.burn ?? 0,
      ltvOverCac: output.ltvOverCac,
      activeScenarioName,
    },
    keyRisks: risks,
    recommendedActions: recommendations,
    approvedDecisions,
    pendingDecisions,
    outlook: buildOutlook(risks, activeScenarioName),
  };
}

/** Markdown-specific wording ("24 months"/"unbounded") differs from the
 * Decision Room's compact "24 mo"/"Infinite" (formatMonths in health.ts), so
 * this stays a local helper while formatCurrency/formatRatio are shared. */
function formatMonthsForBrief(months: number): string {
  return Number.isFinite(months) ? `${months} months` : 'unbounded';
}

function formatDecisionLine(decision: BoardBriefDecision): string {
  return `- ${decision.targetId} → ${decision.newValue} (${decision.agentId}): ${decision.rationale}`;
}

/** Renders the brief as plain Markdown for copy/download. Kept separate from
 * generateBoardBrief so the structured data can also drive the on-screen UI
 * without re-parsing text. */
export function formatBoardBriefMarkdown(brief: BoardBriefData): string {
  const lines: string[] = [];
  lines.push('# Monthly Financial Update');
  lines.push('');
  lines.push(`_Generated ${brief.generatedAt}_`);
  lines.push('');
  lines.push('## Financial snapshot');
  lines.push(`- ARR: ${formatCurrency(brief.snapshot.arr)}`);
  lines.push(`- Runway: ${formatMonthsForBrief(brief.snapshot.runwayMonths)}`);
  lines.push(`- Monthly burn: ${formatCurrency(brief.snapshot.monthlyBurn)}`);
  lines.push(`- LTV/CAC: ${formatRatio(brief.snapshot.ltvOverCac)}`);
  lines.push(`- Active scenario: ${brief.snapshot.activeScenarioName}`);
  lines.push('');
  lines.push('## Key risks');
  lines.push(
    brief.keyRisks.length > 0
      ? brief.keyRisks.map((risk) => `- ${risk.title}: ${risk.detail}`).join('\n')
      : '- No active deterministic risks.',
  );
  lines.push('');
  lines.push('## Recommended actions');
  lines.push(
    brief.recommendedActions.length > 0
      ? brief.recommendedActions.map((rec) => `- ${rec.action}: ${rec.rationale}`).join('\n')
      : '- No open recommendations.',
  );
  lines.push('');
  lines.push('## Decision requests');
  lines.push(
    brief.pendingDecisions.length > 0
      ? brief.pendingDecisions.map(formatDecisionLine).join('\n')
      : '- No pending decisions awaiting approval.',
  );
  lines.push('');
  lines.push('## Approved this period');
  lines.push(
    brief.approvedDecisions.length > 0
      ? brief.approvedDecisions.map(formatDecisionLine).join('\n')
      : '- No decisions approved yet.',
  );
  lines.push('');
  lines.push('## Outlook');
  lines.push(brief.outlook);
  lines.push('');

  return lines.join('\n');
}
