import { describe, expect, test } from 'vitest';
import { formatAskHumanResult, formatProposeEditResult, validateProposeEditInput } from './webmcp';

describe('validateProposeEditInput', () => {
  test('accepts a valid proposal and trims the rationale', () => {
    // Arrange
    const input = { targetId: 'monthlyChurnPct', newValue: 15, rationale: '  Churn looks low  ' };

    // Act
    const result = validateProposeEditInput(input);

    // Assert
    expect(result).toEqual({
      targetId: 'monthlyChurnPct',
      newValue: 15,
      rationale: 'Churn looks low',
    });
  });

  test('coerces a numeric string newValue', () => {
    // Arrange
    const input = { targetId: 'cac', newValue: '1500', rationale: 'Paid channels got pricier' };

    // Act
    const result = validateProposeEditInput(input);

    // Assert
    expect(result.newValue).toBe(1500);
  });

  test('throws and lists valid ids when targetId is not an assumption', () => {
    // Arrange
    const input = { targetId: 'revenue', newValue: 10, rationale: 'why not' };

    // Act + Assert
    expect(() => validateProposeEditInput(input)).toThrow(/Unknown targetId "revenue"/);
    expect(() => validateProposeEditInput(input)).toThrow(/monthlyChurnPct/);
  });

  test('throws when newValue is not a finite number', () => {
    // Arrange
    const input = { targetId: 'arpu', newValue: 'a lot', rationale: 'vibes' };

    // Act + Assert
    expect(() => validateProposeEditInput(input)).toThrow(/newValue must be a finite number/);
  });

  test('throws when rationale is missing or blank', () => {
    // Arrange
    const input = { targetId: 'arpu', newValue: 300, rationale: '   ' };

    // Act + Assert
    expect(() => validateProposeEditInput(input)).toThrow(/rationale is required/);
  });
});

describe('formatProposeEditResult', () => {
  test('states the change and that approval is still pending', () => {
    // Arrange + Act
    const text = formatProposeEditResult('monthlyChurnPct', 3, 15);

    // Assert
    expect(text).toBe("Proposed monthlyChurnPct 3 -> 15. Awaiting Amogh's approval.");
  });
});

describe('formatAskHumanResult', () => {
  test('leads with the chosen option and tells the agent to keep going', () => {
    // Arrange
    const answer = 'monthly';

    // Act
    const result = formatAskHumanResult(answer);

    // Assert
    expect(result.startsWith('monthly')).toBe(true);
    expect(result).toMatch(/continue the task/);
  });
});
