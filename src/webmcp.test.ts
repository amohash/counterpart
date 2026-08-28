import { describe, expect, test } from 'vitest';
import {
  formatAskHumanResult,
  formatProposeEditResult,
  formatRunScenarioResult,
  validateAddChartInput,
  validateAnnotateInput,
  validateHighlightInput,
  validateProposeEditInput,
  validateRunScenarioInput,
} from './webmcp';

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

describe('validateRunScenarioInput', () => {
  test('accepts a valid overrides object', () => {
    // Arrange
    const input = { overrides: { monthlyChurnPct: 15, cac: '1500' } };

    // Act
    const result = validateRunScenarioInput(input);

    // Assert
    expect(result).toEqual({ overrides: { monthlyChurnPct: 15, cac: 1500 } });
  });

  test('defaults to an empty overrides object when omitted', () => {
    // Arrange + Act
    const result = validateRunScenarioInput({});

    // Assert
    expect(result).toEqual({ overrides: {} });
  });

  test('throws and lists valid ids on an unknown override key', () => {
    // Arrange
    const input = { overrides: { revenue: 10 } };

    // Act + Assert
    expect(() => validateRunScenarioInput(input)).toThrow(/Unknown override key "revenue"/);
    expect(() => validateRunScenarioInput(input)).toThrow(/monthlyChurnPct/);
  });

  test('throws when an override value is not a finite number', () => {
    // Arrange
    const input = { overrides: { arpu: 'a lot' } };

    // Act + Assert
    expect(() => validateRunScenarioInput(input)).toThrow(/must be a finite number/);
  });
});

describe('formatRunScenarioResult', () => {
  test('rounds headline metrics into a compact payload', () => {
    // Arrange
    const output = {
      rows: [{ month: 1, customers: 1, mrr: 100, arr: 1200.4, grossProfit: 80, burn: 10, cumulativeCash: 70 }],
      ltv: 999.6,
      ltvOverCac: 2.34,
      runwayMonths: 11.9,
    };

    // Act
    const text = formatRunScenarioResult(output);

    // Assert
    expect(JSON.parse(text)).toEqual({ arr: 1200, ltv: 1000, ltvOverCac: 2.3, runwayMonths: 12 });
  });
});

describe('validateAnnotateInput', () => {
  test('accepts a valid annotation and trims the text', () => {
    // Arrange
    const input = { targetId: 'cac', text: '  worth revisiting  ' };

    // Act
    const result = validateAnnotateInput(input);

    // Assert
    expect(result).toEqual({ targetId: 'cac', text: 'worth revisiting' });
  });

  test('throws on an unknown targetId', () => {
    // Arrange
    const input = { targetId: 'revenue', text: 'note' };

    // Act + Assert
    expect(() => validateAnnotateInput(input)).toThrow(/Unknown targetId "revenue"/);
  });

  test('throws when text is missing or blank', () => {
    // Arrange
    const input = { targetId: 'cac', text: '   ' };

    // Act + Assert
    expect(() => validateAnnotateInput(input)).toThrow(/text is required/);
  });
});

describe('validateAddChartInput', () => {
  test('accepts valid seriesIds and title', () => {
    // Arrange
    const input = { seriesIds: ['mrr', 'cumulativeCash'], title: 'Cash vs MRR' };

    // Act
    const result = validateAddChartInput(input);

    // Assert
    expect(result).toEqual({ seriesIds: ['mrr', 'cumulativeCash'], title: 'Cash vs MRR' });
  });

  test('throws when seriesIds is empty', () => {
    // Arrange + Act + Assert
    expect(() => validateAddChartInput({ seriesIds: [], title: 'Empty' })).toThrow(/seriesIds is required/);
  });

  test('throws on an unknown seriesId', () => {
    // Arrange
    const input = { seriesIds: ['revenue'], title: 'Bad' };

    // Act + Assert
    expect(() => validateAddChartInput(input)).toThrow(/Unknown seriesId "revenue"/);
  });

  test('throws when title is missing or blank', () => {
    // Arrange
    const input = { seriesIds: ['mrr'], title: '  ' };

    // Act + Assert
    expect(() => validateAddChartInput(input)).toThrow(/title is required/);
  });
});

describe('validateHighlightInput', () => {
  test('accepts a valid list of targetIds', () => {
    // Arrange
    const input = { targetIds: ['cac', 'monthlyChurnPct'] };

    // Act
    const result = validateHighlightInput(input);

    // Assert
    expect(result).toEqual({ targetIds: ['cac', 'monthlyChurnPct'] });
  });

  test('throws when targetIds is empty', () => {
    // Arrange + Act + Assert
    expect(() => validateHighlightInput({ targetIds: [] })).toThrow(/targetIds is required/);
  });

  test('throws on an unknown targetId', () => {
    // Arrange
    const input = { targetIds: ['revenue'] };

    // Act + Assert
    expect(() => validateHighlightInput(input)).toThrow(/Unknown targetId "revenue"/);
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
