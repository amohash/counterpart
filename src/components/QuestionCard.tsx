import { motion } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import type { Question } from '../questions';

interface QuestionCardProps {
  question: Question;
  onAnswer: (id: string, option: string) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: -10, clipPath: 'inset(0 0 18% 0 round 12px)' }}
      animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0 round 12px)' }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col gap-4 rounded-xl bg-[#20352d] p-4 text-[#f4f7f5] shadow-[0_12px_30px_rgba(23,33,29,0.18)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#345347] text-[#a9d8c7]">
          <CircleHelp aria-hidden="true" size={18} strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a9b8b1]">Agent question</p>
          <p className="mt-1 max-w-[70ch] text-sm font-medium leading-5">{question.question}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onAnswer(question.id, option)}
            className="min-h-11 rounded-lg bg-[#d9eadf] px-3.5 text-sm font-semibold text-[#173329] transition hover:bg-white active:translate-y-px"
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
