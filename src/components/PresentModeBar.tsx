import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PresentModeStep } from '../presentMode';

interface PresentModeBarProps {
  step: PresentModeStep;
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

/** Fixed walkthrough overlay. Drives App.tsx's existing view/scenario
 * selection state rather than owning its own routing. */
export function PresentModeBar({ step, stepIndex, totalSteps, onPrev, onNext, onExit }: PresentModeBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      role="region"
      aria-label="Present mode"
      className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-full border border-[#2b3630] bg-[#17211d] px-4 py-2.5 text-[#f8f7f3] shadow-[0_12px_30px_rgba(23,33,29,0.35)]"
    >
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit present mode"
        className="grid size-8 shrink-0 place-items-center rounded-full text-[#c7ccc5] transition hover:bg-white/10 hover:text-white"
      >
        <X aria-hidden="true" size={16} strokeWidth={2} />
      </button>
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.1em] text-[#c7ccc5]">
        Step {stepIndex + 1} of {totalSteps}
      </span>
      <span className="whitespace-nowrap text-sm font-semibold">{step.label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={stepIndex === 0}
          aria-label="Previous step"
          className="grid size-8 place-items-center rounded-full transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft aria-hidden="true" size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex === totalSteps - 1}
          aria-label="Next step"
          className="grid size-8 place-items-center rounded-full transition hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight aria-hidden="true" size={16} strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
