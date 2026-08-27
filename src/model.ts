export interface Assumptions {
  startingMRR: number;
  newCustomersPerMonth: number;
  arpu: number;
  monthlyChurnPct: number;
  cac: number;
  grossMarginPct: number;
  monthlyOpex: number;
  months: number;
}

export interface MonthlyRow {
  month: number;
  customers: number;
  mrr: number;
  arr: number;
  grossProfit: number;
  burn: number;
  cumulativeCash: number;
}

export interface ModelOutput {
  rows: MonthlyRow[];
  ltv: number;
  ltvOverCac: number;
  runwayMonths: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  startingMRR: 50000,
  newCustomersPerMonth: 40,
  arpu: 250,
  monthlyChurnPct: 3,
  cac: 1200,
  grossMarginPct: 80,
  monthlyOpex: 180000,
  months: 24,
};

function computeRows(assumptions: Assumptions): MonthlyRow[] {
  const churnRate = assumptions.monthlyChurnPct / 100;
  const marginRate = assumptions.grossMarginPct / 100;
  const startingCustomers = assumptions.arpu > 0 ? assumptions.startingMRR / assumptions.arpu : 0;

  const rows: MonthlyRow[] = [];
  let customers = startingCustomers;
  let cumulativeCash = 0;

  for (let month = 1; month <= assumptions.months; month += 1) {
    customers = customers * (1 - churnRate) + assumptions.newCustomersPerMonth;
    const mrr = customers * assumptions.arpu;
    const arr = mrr * 12;
    const grossProfit = mrr * marginRate;
    const burn = assumptions.monthlyOpex - grossProfit;
    cumulativeCash -= burn;

    rows.push({ month, customers, mrr, arr, grossProfit, burn, cumulativeCash });
  }

  return rows;
}

function computeLtv(assumptions: Assumptions): number {
  const churnRate = assumptions.monthlyChurnPct / 100;
  const marginRate = assumptions.grossMarginPct / 100;
  if (churnRate <= 0) return Infinity;
  return (assumptions.arpu * marginRate) / churnRate;
}

function computeRunwayMonths(rows: MonthlyRow[]): number {
  const depletedRow = rows.find((row) => row.cumulativeCash < 0);
  return depletedRow ? depletedRow.month : Infinity;
}

export function computeModel(
  assumptions: Assumptions,
  overrides?: Partial<Assumptions>,
): ModelOutput {
  const effectiveAssumptions: Assumptions = { ...assumptions, ...overrides };

  const rows = computeRows(effectiveAssumptions);
  const ltv = computeLtv(effectiveAssumptions);
  const ltvOverCac = effectiveAssumptions.cac > 0 ? ltv / effectiveAssumptions.cac : Infinity;
  const runwayMonths = computeRunwayMonths(rows);

  return { rows, ltv, ltvOverCac, runwayMonths };
}
