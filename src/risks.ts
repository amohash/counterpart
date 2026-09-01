import type { Assumptions, ModelOutput } from './model';

export type RiskId =
  | 'runway-critical'
  | 'runway-at-risk'
  | 'weak-unit-economics'
  | 'retention-risk'
  | 'margin-risk'
  | 'operating-cost-risk';

export type RiskSeverity = 'critical' | 'at-risk' | 'warning';

export interface Risk {
  id: RiskId;
  severity: RiskSeverity;
  title: string;
  detail: string;
}

/** Opex counts as "materially exceeding" gross profit once it is more than
 * 20% above it — a fixed, documented threshold since CLAUDE.md doesn't give
 * a numeric one. */
const OPERATING_COST_RISK_MULTIPLIER = 1.2;

/** Deterministic financial risk rules from CLAUDE.md section 8. Do not
 * replace with an LLM call — these must stay reproducible. */
export function computeRisks(assumptions: Assumptions, output: ModelOutput): Risk[] {
  const risks: Risk[] = [];
  const lastRow = output.rows[output.rows.length - 1];

  if (output.runwayMonths < 3) {
    risks.push({
      id: 'runway-critical',
      severity: 'critical',
      title: 'Critical runway risk',
      detail: `Cash runs out in ${output.runwayMonths} month${output.runwayMonths === 1 ? '' : 's'} at the current burn rate.`,
    });
  } else if (output.runwayMonths <= 6) {
    risks.push({
      id: 'runway-at-risk',
      severity: 'at-risk',
      title: 'At-risk runway',
      detail: `Runway is ${output.runwayMonths} months, inside the 6-month planning window.`,
    });
  }

  if (output.ltvOverCac < 3) {
    risks.push({
      id: 'weak-unit-economics',
      severity: 'warning',
      title: 'Weak unit economics',
      detail: `LTV/CAC is ${output.ltvOverCac.toFixed(1)}x, below the 3x threshold for healthy acquisition spend.`,
    });
  }

  if (assumptions.monthlyChurnPct > 8) {
    risks.push({
      id: 'retention-risk',
      severity: 'warning',
      title: 'Retention risk',
      detail: `Monthly churn is ${assumptions.monthlyChurnPct}%, above the 8% sustainability threshold.`,
    });
  }

  if (assumptions.grossMarginPct < 65) {
    risks.push({
      id: 'margin-risk',
      severity: 'warning',
      title: 'Margin risk',
      detail: `Gross margin is ${assumptions.grossMarginPct}%, below the 65% threshold for durable unit economics.`,
    });
  }

  if (lastRow && assumptions.monthlyOpex > lastRow.grossProfit * OPERATING_COST_RISK_MULTIPLIER) {
    risks.push({
      id: 'operating-cost-risk',
      severity: 'warning',
      title: 'Operating-cost risk',
      detail: 'Monthly operating expenses materially exceed gross profit.',
    });
  }

  return risks;
}
