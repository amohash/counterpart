import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ClipboardCopy, Download, FileText, RefreshCcw } from 'lucide-react';
import { formatBoardBriefMarkdown, generateBoardBrief } from '../../boardBrief';
import { computeModel } from '../../model';
import type { Proposal } from '../../proposal';
import { computeRecommendations } from '../../recommendations';
import { computeRisks } from '../../risks';
import type { DerivedScenario } from '../../scenarios';

interface BoardBriefProps {
  scenarios: DerivedScenario[];
  activeScenarioId: string;
  proposals: Proposal[];
  /** Called whenever a brief is (re)generated, so the caller can log a
   * decision-timeline "board brief generated" event. */
  onGenerated: (scenarioName: string) => void;
}

const COPY_FEEDBACK_MS = 2000;

/** Deterministic board-ready update (CLAUDE.md section 14). Recomputes risks
 * and recommendations against the selected scenario's assumptions the same
 * way the Scenarios tab and run_scenario do — a throwaway computeModel call,
 * never touching the live assumptions. */
export function BoardBrief({ scenarios, activeScenarioId, proposals, onGenerated }: BoardBriefProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState(activeScenarioId);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [regenerateNonce, setRegenerateNonce] = useState(0);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const scenario = scenarios.find((candidate) => candidate.id === selectedScenarioId) ?? scenarios[0];

  const brief = useMemo(() => {
    const output = computeModel(scenario.assumptions);
    const risks = computeRisks(scenario.assumptions, output);
    const recommendations = computeRecommendations(risks, scenario.assumptions);
    return generateBoardBrief(output, risks, recommendations, proposals, scenario.name);
    // regenerateNonce intentionally forces a fresh generatedAt timestamp on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, proposals, regenerateNonce]);

  const markdown = useMemo(() => formatBoardBriefMarkdown(brief), [brief]);

  // Log one "generated" event when the Reports tab is first opened, matching
  // the timeline's "board brief generated" event kind from CLAUDE.md section 12.
  const hasLoggedInitialGeneration = useRef(false);
  useEffect(() => {
    if (hasLoggedInitialGeneration.current) return;
    hasLoggedInitialGeneration.current = true;
    onGenerated(scenario.name);
    // Only ever fires once per mount, regardless of later scenario/regenerate calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    const next = scenarios.find((candidate) => candidate.id === id);
    if (next) onGenerated(next.name);
  };

  const handleRegenerate = () => {
    setRegenerateNonce((current) => current + 1);
    onGenerated(scenario.name);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopyState('copied');
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState('idle'), COPY_FEEDBACK_MS);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `counterpart-board-brief-${scenario.id}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
        <div className="flex items-center gap-2">
          <FileText aria-hidden="true" className="text-[#176f55]" size={16} strokeWidth={1.9} />
          <label htmlFor="board-brief-scenario" className="text-xs font-semibold text-[#25312b]">
            Reporting on:
          </label>
          <select
            id="board-brief-scenario"
            value={scenario.id}
            onChange={(event) => handleSelectScenario(event.target.value)}
            className="min-h-9 rounded-lg border border-[#dedfd9] bg-white px-2 text-xs font-medium text-[#25312b]"
          >
            {scenarios.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
                {candidate.id === activeScenarioId ? ' (active)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRegenerate}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#e6e8e3] px-3 text-xs font-semibold text-[#3e4a44] transition hover:bg-[#daddd6] active:translate-y-px"
          >
            <RefreshCcw aria-hidden="true" size={13} strokeWidth={2.2} />
            Regenerate
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#e6e8e3] px-3 text-xs font-semibold text-[#3e4a44] transition hover:bg-[#daddd6] active:translate-y-px"
          >
            {copyState === 'copied' ? (
              <Check aria-hidden="true" size={13} strokeWidth={2.2} />
            ) : (
              <ClipboardCopy aria-hidden="true" size={13} strokeWidth={2.2} />
            )}
            {copyState === 'copied' ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#176f55] px-3 text-xs font-semibold text-white transition hover:bg-[#115e47] active:translate-y-px"
          >
            <Download aria-hidden="true" size={13} strokeWidth={2.2} />
            Download .md
          </button>
        </div>
      </div>

      <article className="rounded-xl bg-[#f8f7f3] p-5 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
        <pre className="max-w-none whitespace-pre-wrap font-sans text-xs leading-6 text-[#25312b]">{markdown}</pre>
      </article>
    </section>
  );
}
