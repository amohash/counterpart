import { describe, expect, test } from "vitest";
import { computeModel, DEFAULT_ASSUMPTIONS } from "./model";

describe("computeModel", () => {
  test("produces one row per month for the requested horizon", () => {
    const result = computeModel(DEFAULT_ASSUMPTIONS);
    expect(result.rows).toHaveLength(24);
  });

  test("zero churn grows MRR every month", () => {
    const result = computeModel(DEFAULT_ASSUMPTIONS, { monthlyChurnPct: 0 });
    for (let i = 1; i < result.rows.length; i += 1) {
      expect(result.rows[i].mrr).toBeGreaterThan(result.rows[i - 1].mrr);
    }
  });

  test("100% churn collapses growth relative to zero churn", () => {
    const zeroChurn = computeModel(DEFAULT_ASSUMPTIONS, { monthlyChurnPct: 0 });
    const fullChurn = computeModel(DEFAULT_ASSUMPTIONS, { monthlyChurnPct: 100 });
    const lastRow = fullChurn.rows[fullChurn.rows.length - 1];

    // With 100% churn, customers reset to newCustomersPerMonth every month (steady state).
    expect(lastRow.customers).toBeCloseTo(DEFAULT_ASSUMPTIONS.newCustomersPerMonth, 5);
    expect(lastRow.mrr).toBeLessThan(zeroChurn.rows[zeroChurn.rows.length - 1].mrr);
  });

  test("runway is finite when burning cash", () => {
    const result = computeModel(DEFAULT_ASSUMPTIONS, { monthlyOpex: 10_000_000 });
    expect(result.runwayMonths).toBeLessThan(Infinity);
  });

  test("ltvOverCac matches manual calculation from assumptions", () => {
    const result = computeModel(DEFAULT_ASSUMPTIONS);
    const expectedLtv =
      (DEFAULT_ASSUMPTIONS.arpu * (DEFAULT_ASSUMPTIONS.grossMarginPct / 100)) /
      (DEFAULT_ASSUMPTIONS.monthlyChurnPct / 100);
    expect(result.ltv).toBeCloseTo(expectedLtv, 5);
    expect(result.ltvOverCac).toBeCloseTo(expectedLtv / DEFAULT_ASSUMPTIONS.cac, 5);
  });
});
