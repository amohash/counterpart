import type { Recommendation } from './recommendations';

export interface ActionPlanItem {
  id: string;
  week: 1 | 2 | 3 | 4;
  title: string;
  detail: string;
  recommendationId: string;
}

const WEEKS: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];

/** Maps each active recommendation (already ordered most-severe-first by
 * computeRecommendations) to one 30-day action plan item, one per week,
 * capped at Week 4. Item ids derive from the stable recommendationId, not a
 * counter, so completion state survives a reload even as the active
 * recommendation set changes. */
export function computeActionPlanItems(recommendations: Recommendation[]): ActionPlanItem[] {
  return recommendations.slice(0, WEEKS.length).map((recommendation, index) => ({
    id: `plan-${recommendation.id}`,
    week: WEEKS[index],
    title: recommendation.action,
    detail: recommendation.rationale,
    recommendationId: recommendation.id,
  }));
}
