import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { CheckCheck, MessageSquareText, Network } from 'lucide-react';
import { useState } from 'react';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { DecisionTimeline } from './components/decision-room/DecisionTimeline';
import { HealthGrid } from './components/decision-room/HealthGrid';
import { RecommendationList } from './components/decision-room/RecommendationList';
import { RiskList } from './components/decision-room/RiskList';
import { ExtraChart } from './components/ExtraChart';
import { Headline } from './components/Headline';
import { MrrChart } from './components/MrrChart';
import { NavTabs, type ViewId } from './components/NavTabs';
import { ProjectionTable } from './components/ProjectionTable';
import { QuestionCard } from './components/QuestionCard';
import { WebmcpBadge } from './components/WebmcpBadge';
import { useAnnotations } from './hooks/useAnnotations';
import { useCharts } from './hooks/useCharts';
import { useCrossTabSync } from './hooks/useCrossTabSync';
import { useHighlight } from './hooks/useHighlight';
import { useModelState } from './hooks/useModelState';
import { useProposals } from './hooks/useProposals';
import { useQuestions } from './hooks/useQuestions';
import { useTimeline } from './hooks/useTimeline';
import { useWebmcp } from './hooks/useWebmcp';
import { computeHealthMetrics } from './health';
import type { Assumptions } from './model';
import { computeRecommendations, type Recommendation } from './recommendations';
import { computeRisks } from './risks';

const HUMAN_ACTOR = 'Amogh';

function App() {
  const [view, setView] = useState<ViewId>('decision-room');
  const { assumptions, output, setAssumption, replaceAssumptions, reset } = useModelState();
  const {
    proposals,
    pendingFor,
    addProposal,
    replaceProposals,
    addRebuttal,
    accept,
    reject,
    acceptAll,
  } = useProposals(setAssumption);
  useCrossTabSync({ assumptions, proposals, replaceAssumptions, replaceProposals });
  const { currentQuestion, askHuman, answer } = useQuestions();
  const { annotations, addAnnotation } = useAnnotations();
  const { charts, addChart } = useCharts();
  const { highlightedIds, highlight } = useHighlight();
  const { events, addEvent } = useTimeline();

  const proposeWithTimeline = (
    targetId: keyof Assumptions,
    newValue: number,
    rationale: string,
    agentName: string,
  ) => {
    const proposal = addProposal(targetId, newValue, rationale, agentName);
    addEvent(agentName, 'proposal', `proposed changing ${targetId} to ${newValue}.`, rationale);
    return proposal;
  };

  const rebutWithTimeline = (proposalId: string, agentName: string, rationale: string) => {
    addRebuttal(proposalId, agentName, rationale);
    addEvent(agentName, 'rebuttal', 'rebutted a proposal.', rationale);
  };

  const acceptWithTimeline = (id: string) => {
    const proposal = proposals.find((item) => item.id === id);
    accept(id);
    if (proposal) {
      addEvent(HUMAN_ACTOR, 'approve', `approved changing ${proposal.targetId} to ${proposal.newValue}.`);
    }
  };

  const rejectWithTimeline = (id: string) => {
    const proposal = proposals.find((item) => item.id === id);
    reject(id);
    if (proposal) {
      addEvent(HUMAN_ACTOR, 'reject', `rejected the proposed change to ${proposal.targetId}.`);
    }
  };

  const isWebmcpDetected = useWebmcp(
    { assumptions, output, proposals },
    {
      proposeEdit: proposeWithTimeline,
      rebutProposal: rebutWithTimeline,
      askHuman,
      annotate: addAnnotation,
      addChart,
      highlight,
    },
  );

  const handleRecommendationPropose = (recommendation: Recommendation) => {
    if (!recommendation.proposal) return;
    proposeWithTimeline(
      recommendation.proposal.targetId,
      recommendation.proposal.newValue,
      recommendation.proposal.rationale,
      HUMAN_ACTOR,
    );
  };

  const healthMetrics = computeHealthMetrics(output);
  const risks = computeRisks(assumptions, output);
  const recommendations = computeRecommendations(risks, assumptions);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}>
      <div className="min-h-screen bg-[#f3f1eb] text-[#17211d]">
        <header className="border-b border-[#d5d6d0] bg-[#f8f7f3]">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-[#17211d] text-[#f8f7f3] shadow-[0_6px_18px_rgba(23,33,29,0.18)]">
                  <Network aria-hidden="true" size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <h1 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">Counterpart</h1>
                  <p className="text-xs text-[#7a8880]">An AI financial decision partner. You make the call.</p>
                </div>
              </div>
              <WebmcpBadge isDetected={isWebmcpDetected} />
            </div>
            <NavTabs active={view} onChange={setView} />
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <AnimatePresence mode="popLayout">
            {currentQuestion && (
              <div className="mb-5">
                <QuestionCard question={currentQuestion} onAnswer={answer} />
              </div>
            )}
          </AnimatePresence>

          {view === 'decision-room' && (
            <div className="flex flex-col gap-5">
              <HealthGrid metrics={healthMetrics} />
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="flex flex-col gap-5">
                  <RiskList risks={risks} />
                  <RecommendationList recommendations={recommendations} onPropose={handleRecommendationPropose} />
                </div>
                <DecisionTimeline events={events} />
              </div>
            </div>
          )}

          {view === 'scenarios' && (
            <section className="rounded-xl border border-dashed border-[#aeb4ae] bg-[#f8f7f3] p-6 text-sm text-[#526059]">
              Saved scenarios are coming in a later phase.
            </section>
          )}

          {view === 'forecast' && (
            <>
              {proposals.length === 0 && charts.length === 0 && Object.keys(annotations).length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex gap-3 rounded-xl border border-dashed border-[#aeb4ae] bg-[#f8f7f3] p-4 text-sm text-[#4f5d56]"
                >
                  <MessageSquareText aria-hidden="true" className="mt-0.5 shrink-0 text-[#176f55]" size={18} />
                  <div>
                    <p className="font-semibold text-[#25312b]">Try asking the agent something:</p>
                    <ul className="mt-1.5 space-y-1 text-xs leading-5">
                      <li>“Raise churn to 15% and tell me what happens to runway”</li>
                      <li>“Compare 3%, 8%, and 15% churn, chart cumulative cash, and flag the risky one”</li>
                      <li>“Annotate CAC with a note about our last fundraise”</li>
                    </ul>
                  </div>
                </motion.div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="min-w-0 flex-1">
                  <Headline output={output} />
                </div>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#176f55] px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(23,111,85,0.18)] transition hover:bg-[#115e47] active:translate-y-px"
                >
                  <CheckCheck aria-hidden="true" size={17} strokeWidth={2} />
                  Accept all
                </button>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                <AssumptionsPanel
                  assumptions={assumptions}
                  onChange={setAssumption}
                  onReset={reset}
                  pendingFor={pendingFor}
                  onAcceptProposal={acceptWithTimeline}
                  onRejectProposal={rejectWithTimeline}
                  annotations={annotations}
                  highlightedIds={highlightedIds}
                />
                <div className="flex min-w-0 flex-col gap-5">
                  <MrrChart rows={output.rows} />
                  <ProjectionTable rows={output.rows} />
                  <AnimatePresence initial={false}>
                    {charts.map((chart) => (
                      <motion.div
                        key={chart.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                      >
                        <ExtraChart rows={output.rows} seriesIds={chart.seriesIds} title={chart.title} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}

          {view === 'reports' && (
            <section className="rounded-xl border border-dashed border-[#aeb4ae] bg-[#f8f7f3] p-6 text-sm text-[#526059]">
              The board brief is coming in a later phase.
            </section>
          )}
        </main>
      </div>
    </MotionConfig>
  );
}

export default App;
