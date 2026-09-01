import { computeModel, type Assumptions, type ModelOutput } from './model';

export interface ImpactMetric {
  before: number;
  after: number;
  delta: number;
}

export interface ProposalImpact {
  runwayMonths: ImpactMetric;
  arr: ImpactMetric;
  ltvOverCac: ImpactMetric;
  monthlyBurn: ImpactMetric;
}

export interface ProposalImpactInput {
  targetId: keyof Assumptions;
  newValue: number;
}

function lastRow(output: ModelOutput) {
  return output.rows[output.rows.length - 1];
}

/** Mirrors scenarios.ts's safeDelta: treats equal (including equal-Infinity)
 * values as a zero delta instead of producing NaN. */
function safeDelta(after: number, before: number): number {
  if (Object.is(after, before) || after === before) return 0;
  return after - before;
}

interface ModelSnapshot {
  runwayMonths: number;
  arr: number;
  ltvOverCac: number;
  monthlyBurn: number;
}

function snapshot(output: ModelOutput): ModelSnapshot {
  const row = lastRow(output);
  return {
    runwayMonths: output.runwayMonths,
    arr: row?.arr ?? 0,
    ltvOverCac: output.ltvOverCac,
    monthlyBurn: row?.burn ?? 0,
  };
}

function metric(before: number, after: number): ImpactMetric {
  return { before, after, delta: safeDelta(after, before) };
}

/** Computes a pending proposal's impact on the four Decision Room health
 * metrics without applying it: `baseOutput` stays the live model, and the
 * "after" model is a throwaway computeModel call with the proposal's single
 * override, matching the pure/no-side-effect pattern of run_scenario. */
export function computeProposalImpact(
  assumptions: Assumptions,
  baseOutput: ModelOutput,
  proposal: ProposalImpactInput,
): ProposalImpact {
  const afterOutput = computeModel(assumptions, { [proposal.targetId]: proposal.newValue } as Partial<Assumptions>);
  const before = snapshot(baseOutput);
  const after = snapshot(afterOutput);

  return {
    runwayMonths: metric(before.runwayMonths, after.runwayMonths),
    arr: metric(before.arr, after.arr),
    ltvOverCac: metric(before.ltvOverCac, after.ltvOverCac),
    monthlyBurn: metric(before.monthlyBurn, after.monthlyBurn),
  };
}
