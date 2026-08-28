import { useRef, useState } from 'react';
import { createQuestion, withoutQuestion, type Question } from '../questions';

interface UseQuestionsResult {
  /** Only the head of the queue is ever rendered — one card at a time. */
  currentQuestion: Question | undefined;
  askHuman: (question: string, options: string[]) => Promise<string>;
  answer: (id: string, option: string) => void;
}

export function useQuestions(): UseQuestionsResult {
  const [queue, setQueue] = useState<Question[]>([]);

  /**
   * Resolvers live in a ref, not state: they are not rendered, and a StrictMode
   * remount must not drop a promise the agent is still awaiting.
   */
  const resolversRef = useRef(new Map<string, (option: string) => void>());

  const askHuman = (question: string, options: string[]) => {
    const entry = createQuestion(question, options);
    setQueue((current) => [...current, entry]);

    return new Promise<string>((resolve) => {
      resolversRef.current.set(entry.id, resolve);
    });
  };

  const answer = (id: string, option: string) => {
    const resolve = resolversRef.current.get(id);
    if (!resolve) return;

    resolversRef.current.delete(id);
    setQueue((current) => withoutQuestion(current, id));
    resolve(option);
  };

  return { currentQuestion: queue[0], askHuman, answer };
}
