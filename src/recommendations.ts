import type { Assumptions } from './model';
import type { Risk, RiskId } from './risks';

export interface RecommendationProposal {
  targetId: keyof Assumptions;
  newValue: number;
  rationale: string;
}

export interface Recommendation {
  id: string;
  action: string;
  rationale: string;
  expectedEffect: string;
  relevantAssumptions: Array<keyof Assumptions>;
  scenarioSuggestion: string;
  proposal?: RecommendationProposal;
}

const OPEX_CUT_FRACTION = 0.2;
const CAC_CUT_FRACTION = 0.2;
const RETENTION_TARGET_CHURN_PCT = 8;

function reduceRunwayRisk(assumptions: Assumptions): Recommendation {
  const newValue = Math.round(assumptions.monthlyOpex * (1 - OPEX_CUT_FRACTION));
  return {
    id: 'protect-runway',
    action: 'Protect runway before investing in growth',
    rationale: 'Runway is inside or approaching the danger zone; cutting burn buys time before a raise or a growth bet.',
    expectedEffect: 'Extends runway by reducing monthly burn.',
    relevantAssumptions: ['monthlyOpex'],
    scenarioSuggestion: 'Cost Control',
    proposal: {
      targetId: 'monthlyOpex',
      newValue,
      rationale: `Cut monthly opex ${Math.round(OPEX_CUT_FRACTION * 100)}% to protect runway.`,
    },
  };
}

function improveUnitEconomics(assumptions: Assumptions): Recommendation {
  const newValue = Math.round(assumptions.cac * (1 - CAC_CUT_FRACTION));
  return {
    id: 'improve-unit-economics',
    action: 'Lower customer acquisition cost',
    rationale: 'LTV/CAC is below the 3x threshold investors expect for healthy acquisition spend.',
    expectedEffect: 'Improves LTV/CAC by reducing acquisition cost per customer.',
    relevantAssumptions: ['cac', 'arpu', 'monthlyChurnPct'],
    scenarioSuggestion: 'Growth Bet',
    proposal: {
      targetId: 'cac',
      newValue,
      rationale: `Cut CAC ${Math.round(CAC_CUT_FRACTION * 100)}% to bring LTV/CAC back above 3x.`,
    },
  };
}

function improveRetention(): Recommendation {
  return {
    id: 'improve-retention',
    action: 'Reduce monthly churn',
    rationale: 'Monthly churn is above the 8% sustainability threshold and is compounding against growth.',
    expectedEffect: 'Improves LTV and runway by keeping more customers month over month.',
    relevantAssumptions: ['monthlyChurnPct'],
    scenarioSuggestion: 'Retention Recovery',
    proposal: {
      targetId: 'monthlyChurnPct',
      newValue: RETENTION_TARGET_CHURN_PCT,
      rationale: `Bring monthly churn down to ${RETENTION_TARGET_CHURN_PCT}%, a more sustainable level.`,
    },
  };
}

function improveMargin(): Recommendation {
  return {
    id: 'improve-margin',
    action: 'Investigate gross margin',
    rationale: 'Gross margin is below the 65% threshold expected for durable SaaS unit economics.',
    expectedEffect: 'Higher gross margin strengthens every downstream metric: LTV, runway, and burn.',
    relevantAssumptions: ['grossMarginPct'],
    scenarioSuggestion: 'Cost Control',
  };
}

function reduceOperatingCost(assumptions: Assumptions): Recommendation {
  const newValue = Math.round(assumptions.monthlyOpex * (1 - OPEX_CUT_FRACTION));
  return {
    id: 'reduce-operating-cost',
    action: 'Bring operating expenses in line with gross profit',
    rationale: 'Monthly operating expenses materially exceed gross profit, driving burn.',
    expectedEffect: 'Reduces monthly burn toward what gross profit can sustain.',
    relevantAssumptions: ['monthlyOpex', 'grossMarginPct'],
    scenarioSuggestion: 'Efficiency reset',
    proposal: {
      targetId: 'monthlyOpex',
      newValue,
      rationale: `Cut monthly opex ${Math.round(OPEX_CUT_FRACTION * 100)}% to align spend with gross profit.`,
    },
  };
}

const BUILDERS: Partial<Record<RiskId, (assumptions: Assumptions) => Recommendation>> = {
  'runway-critical': reduceRunwayRisk,
  'runway-at-risk': reduceRunwayRisk,
  'weak-unit-economics': improveUnitEconomics,
  'retention-risk': improveRetention,
  'margin-risk': improveMargin,
  'operating-cost-risk': reduceOperatingCost,
};

/** One grounded recommendation per active risk, in the same order risks are
 * reported (most severe first, since computeRisks checks runway first). Never
 * calls an external LLM — every recommendation traces back to a deterministic
 * risk and a concrete assumption change. */
export function computeRecommendations(risks: Risk[], assumptions: Assumptions): Recommendation[] {
  const seen = new Set<string>();
  const recommendations: Recommendation[] = [];

  for (const risk of risks) {
    const build = BUILDERS[risk.id];
    if (!build) continue;
    const recommendation = build(assumptions);
    if (seen.has(recommendation.id)) continue;
    seen.add(recommendation.id);
    recommendations.push(recommendation);
  }

  return recommendations;
}
