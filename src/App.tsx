import { AssumptionsPanel } from './components/AssumptionsPanel';
import { Headline } from './components/Headline';
import { MrrChart } from './components/MrrChart';
import { ProjectionTable } from './components/ProjectionTable';
import { useModelState } from './hooks/useModelState';
import { useProposals } from './hooks/useProposals';

function App() {
  const { assumptions, output, setAssumption, reset } = useModelState();
  const { pendingFor, addProposal, accept, reject, acceptAll } = useProposals(setAssumption);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-4 text-4xl font-bold">Counterpart</h1>
      <Headline output={output} />
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={acceptAll}
          className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={() => addProposal('monthlyChurnPct', 15, 'Fake proposal for testing')}
          className="rounded bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300"
        >
          Fake a proposal
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
        />
        <div className="flex flex-col gap-6">
          <MrrChart rows={output.rows} />
          <ProjectionTable rows={output.rows} />
        </div>
      </div>
    </div>
  );
}

export default App;
