import { ArrowRight, Lightbulb, Send } from 'lucide-react';
import type { Recommendation } from '../../recommendations';

interface RecommendationListProps {
  recommendations: Recommendation[];
  onPropose: (recommendation: Recommendation) => void;
}

export function RecommendationList({ recommendations, onPropose }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
          <Lightbulb aria-hidden="true" className="text-[#176f55]" size={16} strokeWidth={1.9} />
          Recommendations
        </h2>
        <p className="text-xs leading-5 text-[#526059]">
          No deterministic risks are active, so there's nothing to recommend right now.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
        <Lightbulb aria-hidden="true" className="text-[#176f55]" size={16} strokeWidth={1.9} />
        Recommendations
      </h2>
      <ul className="flex flex-col gap-3">
        {recommendations.map((recommendation) => (
          <li key={recommendation.id} className="rounded-lg border border-[#dedfd9] bg-white p-3 text-xs">
            <p className="text-sm font-semibold text-[#17211d]">{recommendation.action}</p>
            <p className="mt-1 leading-5 text-[#526059]">{recommendation.rationale}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[#176f55]">
              <ArrowRight aria-hidden="true" size={12} strokeWidth={2.2} />
              {recommendation.expectedEffect}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.08em] text-[#7a8880]">
              Try scenario: {recommendation.scenarioSuggestion}
            </p>
            {recommendation.proposal && (
              <button
                type="button"
                onClick={() => onPropose(recommendation)}
                className="mt-2.5 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#176f55] px-3 text-xs font-semibold text-white transition hover:bg-[#115e47] active:translate-y-px"
              >
                <Send aria-hidden="true" size={13} strokeWidth={2.2} />
                Propose this change
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
