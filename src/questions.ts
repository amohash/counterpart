/** A question the agent has asked, waiting for Amogh to pick one of `options`. */
export interface Question {
  id: string;
  question: string;
  options: string[];
}

let nextId = 1;

export function createQuestion(question: string, options: string[]): Question {
  const id = `question-${nextId}`;
  nextId += 1;
  return { id, question, options };
}

/** Removes the answered question, keeping the rest of the queue in order. */
export function withoutQuestion(queue: Question[], id: string): Question[] {
  return queue.filter((item) => item.id !== id);
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export interface AskHumanInput {
  question: string;
  options: string[];
}

/**
 * Validates agent-supplied arguments at the boundary. Throws so a malformed
 * call surfaces to the agent as a readable, correctable error instead of
 * hanging forever on a card it can never be answered.
 */
export function validateAskHumanInput(input: unknown): AskHumanInput {
  const raw = (input ?? {}) as Record<string, unknown>;

  const question = typeof raw.question === 'string' ? raw.question.trim() : '';
  if (!question) {
    throw new Error('question is required — ask Amogh something specific.');
  }

  if (!Array.isArray(raw.options)) {
    throw new Error(`options must be an array of ${MIN_OPTIONS}-${MAX_OPTIONS} strings.`);
  }

  const options = raw.options
    .map((option) => (typeof option === 'string' ? option.trim() : ''))
    .filter((option) => option.length > 0);

  if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
    throw new Error(
      `options must contain between ${MIN_OPTIONS} and ${MAX_OPTIONS} non-empty strings, got ${options.length}.`,
    );
  }

  if (new Set(options).size !== options.length) {
    throw new Error('options must be unique — Amogh cannot tell two identical buttons apart.');
  }

  return { question, options };
}
