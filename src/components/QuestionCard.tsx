import type { Question } from '../questions';

interface QuestionCardProps {
  question: Question;
  onAnswer: (id: string, option: string) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  return (
    <div className="animate-fade-in rounded-lg border-2 border-indigo-400 bg-indigo-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
        The agent is asking you
      </p>
      <p className="mt-1 text-lg font-medium text-indigo-900">{question.question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onAnswer(question.id, option)}
            className="rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
