import { describe, expect, it } from 'vitest';
import { formatBoardBriefMarkdown, generateBoardBrief } from './boardBrief';
import { createProposal, withStatus } from './proposal';
import { computeRecommendations } from './recommendations';
import { computeRisks } from './risks';
import { DEFAULT_ASSUMPTIONS, computeModel } from './model';

describe('generateBoardBrief', () => {
  const output = computeModel(DEFAULT_ASSUMPTIONS);
  const risks = computeRisks(DEFAULT_ASSUMPTIONS, output);
  const recommendations = computeRecommendations(risks, DEFAULT_ASSUMPTIONS);

  it('splits proposals into approved and pending decisions', () => {
    const pending = createProposal('monthlyOpex', 100000, 'Cut opex', 'Risk');
    const accepted = withStatus(createProposal('cac', 900, 'Lower CAC', 'Growth'), 'accepted');
    const rejected = withStatus(createProposal('arpu', 300, 'Raise ARPU', 'Growth'), 'rejected');

    const brief = generateBoardBrief(
      output,
      risks,
      recommendations,
      [pending, accepted, rejected],
      'Current Plan',
      '2026-08-31T00:00:00.000Z',
    );

    expect(brief.pendingDecisions).toHaveLength(1);
    expect(brief.pendingDecisions[0].targetId).toBe('monthlyOpex');
    expect(brief.approvedDecisions).toHaveLength(1);
    expect(brief.approvedDecisions[0].targetId).toBe('cac');
  });

  it('reflects the live snapshot and active scenario name', () => {
    const brief = generateBoardBrief(output, risks, recommendations, [], 'Cost Control', '2026-08-31T00:00:00.000Z');
    expect(brief.snapshot.runwayMonths).toBe(output.runwayMonths);
    expect(brief.snapshot.activeScenarioName).toBe('Cost Control');
  });

  it('names the most severe risk in the outlook when risks exist', () => {
    const brief = generateBoardBrief(output, risks, recommendations, [], 'Current Plan', '2026-08-31T00:00:00.000Z');
    if (risks.length > 0) {
      expect(brief.outlook).toContain(risks[0].title);
    }
  });

  it('states there are no active risks in the outlook when risks is empty', () => {
    const brief = generateBoardBrief(output, [], [], [], 'Current Plan', '2026-08-31T00:00:00.000Z');
    expect(brief.outlook).toContain('no active deterministic risks');
  });
});

describe('formatBoardBriefMarkdown', () => {
  it('renders all required board brief sections', () => {
    const brief = generateBoardBrief(
      computeModel(DEFAULT_ASSUMPTIONS),
      [],
      [],
      [],
      'Current Plan',
      '2026-08-31T00:00:00.000Z',
    );
    const markdown = formatBoardBriefMarkdown(brief);

    expect(markdown).toContain('# Monthly Financial Update');
    expect(markdown).toContain('## Financial snapshot');
    expect(markdown).toContain('## Key risks');
    expect(markdown).toContain('## Recommended actions');
    expect(markdown).toContain('## Decision requests');
    expect(markdown).toContain('## Approved this period');
    expect(markdown).toContain('## Outlook');
  });

  it('includes a decision line for each pending decision', () => {
    const proposal = createProposal('monthlyChurnPct', 8, 'Reduce churn', 'Risk');
    const brief = generateBoardBrief(
      computeModel(DEFAULT_ASSUMPTIONS),
      [],
      [],
      [proposal],
      'Current Plan',
      '2026-08-31T00:00:00.000Z',
    );
    const markdown = formatBoardBriefMarkdown(brief);

    expect(markdown).toContain('monthlyChurnPct');
    expect(markdown).toContain('Reduce churn');
  });
});
