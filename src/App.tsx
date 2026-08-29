import { AssumptionsPanel } from './components/AssumptionsPanel';
import { ExtraChart } from './components/ExtraChart';
import { Headline } from './components/Headline';
import { MrrChart } from './components/MrrChart';
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
import { useWebmcp } from './hooks/useWebmcp';

function App() {
  const { assumptions, output, setAssumption, replaceAssumptions, reset } = useModelState();
  const { proposals, pendingFor, addProposal, replaceProposals, accept, reject, acceptAll } =
    useProposals(setAssumption);
  useCrossTabSync({ assumptions, proposals, replaceAssumptions, replaceProposals });
  const { currentQuestion, askHuman, answer } = useQuestions();
  const { annotations, addAnnotation } = useAnnotations();
  const { charts, addChart } = useCharts();
  const { highlightedIds, highlight } = useHighlight();
  const isWebmcpDetected = useWebmcp(
    { assumptions, output, proposals },
    {
      proposeEdit: addProposal,
      askHuman,
      annotate: addAnnotation,
      addChart,
      highlight,
    },
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-4xl font-bold">Counterpart</h1>
        <WebmcpBadge isDetected={isWebmcpDetected} />
      </div>
      {currentQuestion && (
        <div className="mb-6">
          <QuestionCard question={currentQuestion} onAnswer={answer} />
        </div>
      )}
      {proposals.length === 0 && charts.length === 0 && Object.keys(annotations).length === 0 && (
        <div className="mb-6 rounded border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-800">Try asking the agent something, e.g.:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>"Raise churn to 15% and tell me what happens to runway"</li>
            <li>"Compare 3%, 8%, and 15% churn, chart cumulative cash, and flag the risky one"</li>
            <li>"Annotate CAC with a note about our last fundraise"</li>
          </ul>
        </div>
      )}
      <Headline output={output} />
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={acceptAll}
          className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Accept all
        </button>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        <AssumptionsPanel
          assumptions={assumptions}
          onChange={setAssumption}
          onReset={reset}
          pendingFor={pendingFor}
          onAcceptProposal={accept}
          onRejectProposal={reject}
          annotations={annotations}
          highlightedIds={highlightedIds}
        />
        <div className="flex flex-col gap-6">
          <MrrChart rows={output.rows} />
          <ProjectionTable rows={output.rows} />
          {charts.map((chart) => (
            <ExtraChart key={chart.id} rows={output.rows} seriesIds={chart.seriesIds} title={chart.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
