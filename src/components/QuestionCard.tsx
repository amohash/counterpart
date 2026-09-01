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
      className="flex flex-col gap-4 rounded-none bg-[#0b0d0c] p-4 text-[#f7f6f2] shadow-[0_12px_30px_rgba(23,33,29,0.18)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-none bg-[#0b0d0c] text-[#e8ddc0]">
          <CircleHelp aria-hidden="true" size={18} strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b928c]">Agent question</p>
          <p className="mt-1 max-w-[70ch] text-sm font-medium leading-5">{question.question}</p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onAnswer(question.id, option)}
            className="min-h-11 rounded-none bg-[#f4ecd8] px-3.5 text-sm font-semibold text-[#0b0d0c] transition hover:bg-white active:translate-y-px"
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
