import { describe, expect, test } from 'vitest';
import { createQuestion, validateAskHumanInput, withoutQuestion } from './questions';

describe('question queue', () => {
  test('gives each question a distinct id', () => {
    // Arrange + Act
    const first = createQuestion('Monthly or annual?', ['monthly', 'annual']);
    const second = createQuestion('Which segment?', ['SMB', 'Enterprise']);

    // Assert
    expect(first.id).not.toBe(second.id);
  });

  test('removes only the answered question and keeps the rest in order', () => {
    // Arrange
    const a = createQuestion('A?', ['1', '2']);
    const b = createQuestion('B?', ['1', '2']);
    const c = createQuestion('C?', ['1', '2']);

    // Act
    const remaining = withoutQuestion([a, b, c], b.id);

    // Assert
    expect(remaining).toEqual([a, c]);
  });
});

describe('validateAskHumanInput', () => {
  test('accepts a valid question and trims whitespace', () => {
    // Arrange
    const input = { question: '  Monthly or annual churn?  ', options: [' monthly ', 'annual'] };

    // Act
    const result = validateAskHumanInput(input);

    // Assert
    expect(result).toEqual({
      question: 'Monthly or annual churn?',
      options: ['monthly', 'annual'],
    });
  });

  test('throws when the question is blank', () => {
    // Act + Assert
    expect(() => validateAskHumanInput({ question: '   ', options: ['a', 'b'] })).toThrow(
      /question is required/,
    );
  });

  test('throws when there are fewer than two usable options', () => {
    // Act + Assert
    expect(() => validateAskHumanInput({ question: 'Which?', options: ['only', ''] })).toThrow(
      /between 2 and 6/,
    );
  });

  test('throws when options are not an array', () => {
    // Act + Assert
    expect(() => validateAskHumanInput({ question: 'Which?', options: 'monthly' })).toThrow(
      /must be an array/,
    );
  });

  test('throws when two options are identical', () => {
    // Act + Assert
    expect(() =>
      validateAskHumanInput({ question: 'Which?', options: ['monthly', 'monthly'] }),
    ).toThrow(/unique/);
  });
});
