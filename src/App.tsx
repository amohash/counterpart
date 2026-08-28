import { AssumptionsPanel } from './components/AssumptionsPanel';
import { ExtraChart } from './components/ExtraChart';
import { Headline } from './components/Headline';
import { MrrChart } from './components/MrrChart';
import { ProjectionTable } from './components/ProjectionTable';
import { QuestionCard } from './components/QuestionCard';
import { WebmcpBadge } from './components/WebmcpBadge';
import { useAnnotations } from './hooks/useAnnotations';
import { useCharts } from './hooks/useCharts';
import { useHighlight } from './hooks/useHighlight';
import { useModelState } from './hooks/useModelState';
import { useProposals } from './hooks/useProposals';
import { useQuestions } from './hooks/useQuestions';
import { useWebmcp } from './hooks/useWebmcp';

function App() {
  const { assumptions, output, setAssumption, reset } = useModelState();
  const { proposals, pendingFor, addProposal, accept, reject, acceptAll } =
    useProposals(setAssumption);
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
