import type { ModelOutput } from './model';

export type HealthSeverity = 'good' | 'watch' | 'risk';

export interface HealthMetric {
  id: 'runway' | 'arr' | 'ltvOverCac' | 'burn';
  label: string;
  value: string;
  severity: HealthSeverity;
  statusText: string;
  interpretation: string;
}

/** Shared number formatters for financial values across the Decision Room,
 * Pending Decisions, and Board Brief — keep these as the single source of
 * truth rather than re-deriving formatting rules per surface. */
export function formatMonths(months: number): string {
  return Number.isFinite(months) ? `${months} mo` : 'Infinite';
}

export function formatRatio(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)}x` : '∞';
}

export function formatCurrency(value: number): string {
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.abs(rounded));
  return rounded < 0 ? `-$${formatted}` : `$${formatted}`;
}

function runwayMetric(runwayMonths: number): HealthMetric {
  if (runwayMonths < 3) {
    return {
      id: 'runway',
      label: 'Runway',
      value: formatMonths(runwayMonths),
      severity: 'risk',
      statusText: 'Critical',
      interpretation: 'Cash runs out in under 3 months at the current burn rate.',
    };
  }
  if (runwayMonths <= 6) {
    return {
      id: 'runway',
      label: 'Runway',
      value: formatMonths(runwayMonths),
      severity: 'watch',
      statusText: 'At risk',
      interpretation: 'Runway is under 6 months; reduce burn or raise before it tightens further.',
    };
  }
  return {
    id: 'runway',
    label: 'Runway',
    value: formatMonths(runwayMonths),
    severity: 'good',
    statusText: 'Healthy',
    interpretation: 'Runway gives room to operate without an immediate cash decision.',
  };
}

function arrMetric(arr: number): HealthMetric {
  return {
    id: 'arr',
    label: 'ARR',
    value: formatCurrency(arr),
    severity: 'good',
    statusText: 'Tracked',
    interpretation: 'Annualized run rate from the final forecast month.',
  };
}

function ltvOverCacMetric(ltvOverCac: number): HealthMetric {
  if (ltvOverCac < 3) {
    return {
      id: 'ltvOverCac',
      label: 'LTV / CAC',
      value: formatRatio(ltvOverCac),
      severity: 'risk',
      statusText: 'Weak',
      interpretation: 'Unit economics are weak; customer value does not comfortably cover acquisition cost.',
    };
  }
  return {
    id: 'ltvOverCac',
    label: 'LTV / CAC',
    value: formatRatio(ltvOverCac),
    severity: 'good',
    statusText: 'Healthy',
    interpretation: 'Customer lifetime value comfortably exceeds acquisition cost.',
  };
}

function burnMetric(burn: number): HealthMetric {
  if (burn <= 0) {
    return {
      id: 'burn',
      label: 'Monthly burn',
      value: formatCurrency(burn),
      severity: 'good',
      statusText: 'Cash flow positive',
      interpretation: 'Gross profit currently covers monthly operating expenses.',
    };
  }
  return {
    id: 'burn',
    label: 'Monthly burn',
    value: formatCurrency(burn),
    severity: 'watch',
    statusText: 'Burning cash',
    interpretation: 'Operating expenses exceed gross profit this month.',
  };
}

/** Deterministic interpretation of the four Decision Room health metrics.
 * No LLM involvement — thresholds mirror the risk rules in risks.ts. */
export function computeHealthMetrics(output: ModelOutput): HealthMetric[] {
  const lastRow = output.rows[output.rows.length - 1];

  return [
    runwayMetric(output.runwayMonths),
    arrMetric(lastRow?.arr ?? 0),
    ltvOverCacMetric(output.ltvOverCac),
    burnMetric(lastRow?.burn ?? 0),
  ];
}
