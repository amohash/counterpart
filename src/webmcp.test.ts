import { describe, expect, test } from 'vitest';
import {
  formatAskHumanResult,
  formatProposeEditResult,
  formatRunScenarioResult,
  isProposalId,
  registerModelTools,
  validateAddChartInput,
  validateAnnotateInput,
  validateHighlightInput,
  validateProposeEditInput,
  validateRebutProposalInput,
  validateRunScenarioInput,
} from './webmcp';
import { computeModel, DEFAULT_ASSUMPTIONS } from './model';
import type { Proposal } from './proposal';

describe('validateProposeEditInput', () => {
  test('accepts a valid proposal and trims the rationale', () => {
    // Arrange
    const input = {
      targetId: 'monthlyChurnPct',
      newValue: 15,
      rationale: '  Churn looks low  ',
      agentName: 'Growth',
    };

    // Act
    const result = validateProposeEditInput(input);

    // Assert
    expect(result).toEqual({
      targetId: 'monthlyChurnPct',
      newValue: 15,
      rationale: 'Churn looks low',
      agentName: 'Growth',
    });
  });

  test('coerces a numeric string newValue', () => {
    // Arrange
    const input = {
      targetId: 'cac',
      newValue: '1500',
      rationale: 'Paid channels got pricier',
      agentName: 'Risk',
    };

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

describe('validateRebutProposalInput', () => {
  test('accepts a valid rebuttal and trims its strings', () => {
    expect(
      validateRebutProposalInput({
        proposalId: ' proposal-1 ',
        agentName: ' Risk ',
        rationale: ' Runway falls too quickly. ',
      }),
    ).toEqual({
      proposalId: 'proposal-1',
      agentName: 'Risk',
      rationale: 'Runway falls too quickly.',
    });
  });

  test('requires a proposal id, agent name, and rationale', () => {
    expect(() => validateRebutProposalInput({ agentName: 'Risk', rationale: 'Why' })).toThrow(
      /proposalId must be a valid id/,
    );
    expect(() => validateRebutProposalInput({ proposalId: 'proposal-1', rationale: 'Why' })).toThrow(
      /agentName is required/,
    );
    expect(() => validateRebutProposalInput({ proposalId: 'proposal-1', agentName: 'Risk' })).toThrow(
      /rationale is required/,
    );
  });

  test('rejects malformed proposal ids before looking up live state', () => {
    expect(isProposalId('proposal-1')).toBe(true);
    expect(isProposalId('proposal-0')).toBe(false);
    expect(isProposalId('proposal-one')).toBe(false);
    expect(() => validateRebutProposalInput({ proposalId: 'unknown', agentName: 'Risk', rationale: 'Why' })).toThrow(
      /proposalId must be a valid id/,
    );
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

describe('WebMCP registration audit', () => {
  test('discovers all tools and routes each tool through current page actions without silent model mutation', async () => {
    const registered = new Map<string, { execute: (input?: unknown) => Promise<{ content: Array<{ text: string }> }> }>();
    const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const proposals: Proposal[] = [];
    const annotations: Array<[string, string]> = [];
    const charts: Array<{ seriesIds: string[]; title: string }> = [];
    const highlights: string[][] = [];
    const assumptions = { ...DEFAULT_ASSUMPTIONS };
    const output = computeModel(assumptions);

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        modelContext: {
          registerTool: (tool: { name: string; execute: (input?: unknown) => Promise<{ content: Array<{ text: string }> }> }) => {
            registered.set(tool.name, tool);
          },
        },
      },
    });

    try {
      expect(
        registerModelTools({
          getSnapshot: () => ({ assumptions, output, proposals }),
          proposeEdit: (targetId, newValue, rationale, agentName) => {
            const proposal: Proposal = {
              id: `proposal-${proposals.length + 1}`,
              targetId,
              newValue,
              rationale,
              status: 'pending',
              agentId: agentName,
              agentColor: '#000000',
              rebuttals: [],
            };
            proposals.push(proposal);
            return proposal;
          },
          rebutProposal: (proposalId, agentName, rationale) => {
            const proposal = proposals.find((item) => item.id === proposalId);
            if (proposal) proposal.rebuttals.push({ agentId: agentName, agentColor: '#000000', rationale });
          },
          askHuman: async () => 'Monthly',
          annotate: (targetId, text) => annotations.push([targetId, text]),
          addChart: (seriesIds, title) => {
            charts.push({ seriesIds, title });
            return { id: 'chart-1', seriesIds, title };
          },
          highlight: (targetIds) => highlights.push(targetIds),
        }),
      ).toBe(true);

      expect([...registered.keys()]).toEqual([
        'get_model_state',
        'propose_edit',
        'rebut_proposal',
        'ask_human',
        'run_scenario',
        'annotate',
        'add_chart',
        'highlight',
      ]);

      const state = await registered.get('get_model_state')!.execute({});
      expect(JSON.parse(state.content[0].text).assumptions).toEqual(assumptions);

      const scenario = await registered.get('run_scenario')!.execute({ overrides: { monthlyChurnPct: 8 } });
      expect(JSON.parse(scenario.content[0].text)).toHaveProperty('arr');
      expect(assumptions.monthlyChurnPct).toBe(DEFAULT_ASSUMPTIONS.monthlyChurnPct);

      await registered.get('propose_edit')!.execute({
        targetId: 'monthlyOpex',
        newValue: 144000,
        rationale: 'Extend runway while retention work is underway.',
        agentName: 'Risk',
      });
      expect(proposals).toHaveLength(1);
      expect(assumptions.monthlyOpex).toBe(DEFAULT_ASSUMPTIONS.monthlyOpex);

      await registered.get('rebut_proposal')!.execute({
        proposalId: 'proposal-1',
        agentName: 'Growth',
        rationale: 'Protect the acquisition channels with the highest return.',
      });
      expect(proposals[0].rebuttals).toHaveLength(1);

      await registered.get('ask_human')!.execute({ question: 'Which churn metric?', options: ['Monthly', 'Annual'] });
      await registered.get('annotate')!.execute({ targetId: 'cac', text: 'Review paid acquisition efficiency.' });
      await registered.get('add_chart')!.execute({ seriesIds: ['mrr', 'cumulativeCash'], title: 'Growth and cash' });
      await registered.get('highlight')!.execute({ targetIds: ['monthlyChurnPct', 'monthlyOpex'] });

      expect(annotations).toEqual([['cac', 'Review paid acquisition efficiency.']]);
      expect(charts).toEqual([{ seriesIds: ['mrr', 'cumulativeCash'], title: 'Growth and cash' }]);
      expect(highlights).toEqual([['monthlyChurnPct', 'monthlyOpex']]);
    } finally {
      if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
      else Reflect.deleteProperty(globalThis, 'document');
    }
  });
});
