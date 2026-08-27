import { AssumptionsPanel } from './components/AssumptionsPanel';
import { Headline } from './components/Headline';
import { MrrChart } from './components/MrrChart';
import { ProjectionTable } from './components/ProjectionTable';
import { useModelState } from './hooks/useModelState';

function App() {
  const { assumptions, output, setAssumption, reset } = useModelState();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="mb-4 text-4xl font-bold">Counterpart</h1>
      <Headline output={output} />
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
        <AssumptionsPanel assumptions={assumptions} onChange={setAssumption} onReset={reset} />
        <div className="flex flex-col gap-6">
          <MrrChart rows={output.rows} />
          <ProjectionTable rows={output.rows} />
        </div>
      </div>
    </div>
  );
}

export default App;
