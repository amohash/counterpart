import { ListChecks } from 'lucide-react';
import { computeActionPlanItems } from '../../actionPlan';
import type { Recommendation } from '../../recommendations';

interface ActionPlanProps {
  recommendations: Recommendation[];
  completed: Record<string, boolean>;
  onToggle: (itemId: string, title: string, nowComplete: boolean) => void;
}

export function ActionPlan({ recommendations, completed, onToggle }: ActionPlanProps) {
  const items = computeActionPlanItems(recommendations);

  if (items.length === 0) {
    return (
      <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
          <ListChecks aria-hidden="true" className="text-[#176f55]" size={16} strokeWidth={1.9} />
          30-day action plan
        </h2>
        <p className="text-xs leading-5 text-[#526059]">
          No active risks, so there's nothing to schedule right now.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
        <ListChecks aria-hidden="true" className="text-[#176f55]" size={16} strokeWidth={1.9} />
        30-day action plan
      </h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => {
          const isComplete = Boolean(completed[item.id]);
          return (
            <li key={item.id} className="flex items-start gap-2.5 rounded-lg border border-[#dedfd9] bg-white p-3 text-xs">
              <input
                type="checkbox"
                checked={isComplete}
                onChange={() => onToggle(item.id, item.title, !isComplete)}
                className="mt-0.5 size-4 shrink-0 accent-[#176f55]"
                aria-label={`Mark "${item.title}" ${isComplete ? 'incomplete' : 'complete'}`}
              />
              <div className={isComplete ? 'line-through opacity-60' : undefined}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7a8880]">
                  Week {item.week}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-[#17211d]">{item.title}</p>
                <p className="mt-0.5 leading-5 text-[#526059]">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
