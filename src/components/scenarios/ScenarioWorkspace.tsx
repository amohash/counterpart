import {
  Check,
  Copy,
  FlaskConical,
  PencilLine,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { buildRunwayComparisonData } from '../../scenarioViewModel';
import { ScenarioComparisonChart } from './ScenarioComparisonChart';

export type ScenarioStatus = 'healthy' | 'watch' | 'risk';

export interface ScenarioMetricsView {
  runwayMonths: number;
  finalArr: number;
  ltvOverCac: number;
  monthlyBurn: number;
}

export interface ScenarioMetricDeltasView {
  runwayMonths: number;
  finalArr: number;
  ltvOverCac: number;
  monthlyBurn: number;
}

export interface ScenarioAssumptionsView {
  startingMRR: number;
  newCustomersPerMonth: number;
  arpu: number;
  monthlyChurnPct: number;
  cac: number;
  grossMarginPct: number;
  monthlyOpex: number;
  months: number;
}

export interface ScenarioViewModel {
  id: string;
  name: string;
  description: string;
  status: ScenarioStatus;
  statusLabel: string;
  isCustom: boolean;
  metrics: ScenarioMetricsView;
  deltas: ScenarioMetricDeltasView;
  assumptions: ScenarioAssumptionsView;
}

export interface ScenarioDraft {
  name: string;
  description: string;
  assumptions: ScenarioAssumptionsView;
}

export interface ScenarioWorkspaceProps {
  scenarios: ScenarioViewModel[];
  selectedScenarioId: string;
  activeScenarioId: string;
  comparisonIds: string[];
  onSelect: (scenarioId: string) => void;
  onActivate: (scenarioId: string) => void;
  onDuplicate: (scenarioId: string) => void;
  onSaveCustom: (scenarioId: string, draft: ScenarioDraft) => void;
  onDeleteCustom: (scenarioId: string) => void;
  onReset: () => void;
  onToggleComparison: (scenarioId: string) => void;
}

const STATUS_STYLES: Record<ScenarioStatus, string> = {
  healthy: 'border-[#e8ddc0] bg-[#f4ecd8] text-[#8a6a26]',
  watch: 'border-[#8a6a26] bg-[#f4ecd8] text-[#6f5620]',
  risk: 'border-[#0b0d0c] bg-[#0b0d0c] text-white',
};

const ASSUMPTION_FIELDS: Array<{
  id: keyof ScenarioAssumptionsView;
  label: string;
  prefix?: string;
  suffix?: string;
  step?: number;
}> = [
  { id: 'startingMRR', label: 'Starting MRR', prefix: '$' },
  { id: 'newCustomersPerMonth', label: 'New customers / month' },
  { id: 'arpu', label: 'ARPU', prefix: '$' },
  { id: 'monthlyChurnPct', label: 'Monthly churn', suffix: '%', step: 0.1 },
  { id: 'cac', label: 'CAC', prefix: '$' },
  { id: 'grossMarginPct', label: 'Gross margin', suffix: '%', step: 0.1 },
  { id: 'monthlyOpex', label: 'Monthly opex', prefix: '$' },
  { id: 'months', label: 'Forecast horizon', suffix: 'mo' },
];

const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatRunway(value: number): string {
  return Number.isFinite(value) ? `${formatter.format(value)} mo` : '∞';
}

function formatRatio(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)}x` : '∞';
}

function formatSigned(value: number, format: (absolute: number) => string): string {
  if (Math.abs(value) < 0.005) return '—';
  return `${value > 0 ? '+' : '−'}${format(Math.abs(value))}`;
}

function deltaTone(value: number, inverse = false): string {
  if (Math.abs(value) < 0.005) return 'text-[#8b928c]';
  const favorable = inverse ? value < 0 : value > 0;
  return favorable ? 'text-[#8a6a26]' : 'text-[#0b0d0c]';
}

function StatusBadge({ scenario }: { scenario: ScenarioViewModel }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] ${STATUS_STYLES[scenario.status]}`}
    >
      {scenario.statusLabel}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b928c]">{label}</dt>
      <dd className="mt-1 tabular-nums text-sm font-semibold text-[#0b0d0c]">{value}</dd>
    </div>
  );
}

function ScenarioCards({
  scenarios,
  selectedScenarioId,
  activeScenarioId,
  comparisonIds,
  onSelect,
  onToggleComparison,
}: Pick<
  ScenarioWorkspaceProps,
  | 'scenarios'
  | 'selectedScenarioId'
  | 'activeScenarioId'
  | 'comparisonIds'
  | 'onSelect'
  | 'onToggleComparison'
>) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {scenarios.map((scenario) => {
        const selected = scenario.id === selectedScenarioId;
        const active = scenario.id === activeScenarioId;
        const compared = comparisonIds.includes(scenario.id);
        return (
          <article
            key={scenario.id}
            className={`card-lift rounded-none border p-4 shadow-[0_10px_26px_rgba(23,33,29,0.07)] transition ${
              selected ? 'border-[#8a6a26] bg-[#ffffff]' : 'border-transparent bg-[#ffffff]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onSelect(scenario.id)} className="min-w-0 text-left">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-[#0b0d0c]">{scenario.name}</span>
                  {active && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8a6a26]">
                      <Check aria-hidden="true" size={11} strokeWidth={2.5} /> Active
                    </span>
                  )}
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#55605a]">
                  {scenario.description}
                </span>
              </button>
              <StatusBadge scenario={scenario} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
              <Metric label="Runway" value={formatRunway(scenario.metrics.runwayMonths)} />
              <Metric label="Final ARR" value={compactCurrency.format(scenario.metrics.finalArr)} />
              <Metric label="LTV / CAC" value={formatRatio(scenario.metrics.ltvOverCac)} />
              <Metric label="Monthly burn" value={compactCurrency.format(scenario.metrics.monthlyBurn)} />
            </dl>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#e4e3dc] pt-3">
              <button
                type="button"
                onClick={() => onSelect(scenario.id)}
                aria-pressed={selected}
                className="min-h-9 rounded-none px-2 text-xs font-semibold text-[#8a6a26] hover:bg-[#f4ecd8]"
              >
                View details
              </button>
              <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-medium text-[#55605a]">
                <input
                  type="checkbox"
                  checked={compared}
                  onChange={() => onToggleComparison(scenario.id)}
                  className="h-4 w-4 accent-[#8a6a26]"
                />
                Compare
              </label>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ScenarioDetail({
  scenario,
  isActive,
  onActivate,
  onDuplicate,
  onSaveCustom,
  onDeleteCustom,
}: {
  scenario: ScenarioViewModel;
  isActive: boolean;
  onActivate: () => void;
  onDuplicate: () => void;
  onSaveCustom: (draft: ScenarioDraft) => void;
  onDeleteCustom: () => void;
}) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const assumptions = Object.fromEntries(
      ASSUMPTION_FIELDS.map(({ id }) => [id, Number(data.get(id))]),
    ) as unknown as ScenarioAssumptionsView;
    onSaveCustom({
      name: String(data.get('name') ?? '').trim(),
      description: String(data.get('description') ?? '').trim(),
      assumptions,
    });
  }

  return (
    <section className="rounded-none bg-[#ffffff] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b928c]">
            {scenario.isCustom ? 'Custom scenario' : 'Saved scenario'}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#0b0d0c]">{scenario.name}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#55605a]">{scenario.description}</p>
        </div>
        <StatusBadge scenario={scenario} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onActivate}
          disabled={isActive}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-none bg-[#8a6a26] px-3 text-xs font-semibold text-white transition hover:bg-[#6f5620] disabled:cursor-default disabled:bg-[#e4e3dc]"
        >
          <FlaskConical aria-hidden="true" size={13} strokeWidth={2.2} />
          {isActive ? 'Active exploration' : 'Explore this scenario'}
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-none border border-[#e4e3dc] bg-white px-3 text-xs font-semibold text-[#0b0d0c] hover:bg-[#f0efe9]"
        >
          <Copy aria-hidden="true" size={13} strokeWidth={2.2} /> Duplicate
        </button>
        {scenario.isCustom && (
          <button
            type="button"
            onClick={onDeleteCustom}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-none px-3 text-xs font-semibold text-[#0b0d0c] hover:bg-[#f0efe9]"
          >
            <Trash2 aria-hidden="true" size={13} strokeWidth={2.2} /> Delete
          </button>
        )}
      </div>

      {scenario.isCustom ? (
        <form key={scenario.id} onSubmit={submit} className="mt-5 border-t border-[#e4e3dc] pt-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0b0d0c]">
            <PencilLine aria-hidden="true" className="text-[#8a6a26]" size={15} /> Edit assumptions
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#55605a]">
              Scenario name
              <input
                name="name"
                required
                defaultValue={scenario.name}
                className="mt-1 min-h-10 w-full rounded-none border border-[#e4e3dc] bg-white px-3 text-sm font-medium text-[#0b0d0c]"
              />
            </label>
            <label className="text-xs font-semibold text-[#55605a]">
              Description
              <input
                name="description"
                required
                defaultValue={scenario.description}
                className="mt-1 min-h-10 w-full rounded-none border border-[#e4e3dc] bg-white px-3 text-sm text-[#0b0d0c]"
              />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ASSUMPTION_FIELDS.map((field) => (
              <label key={field.id} className="text-xs font-semibold text-[#55605a]">
                {field.label}
                <span className="mt-1 flex min-h-10 items-center rounded-none border border-[#e4e3dc] bg-white px-3 focus-within:ring-2 focus-within:ring-[#8a6a26]">
                  {field.prefix && <span className="mr-1 text-[#8b928c]">{field.prefix}</span>}
                  <input
                    name={field.id}
                    type="number"
                    min="0"
                    step={field.step ?? 1}
                    required
                    defaultValue={scenario.assumptions[field.id]}
                    className="min-w-0 flex-1 bg-transparent text-sm tabular-nums text-[#0b0d0c] focus:shadow-none"
                  />
                  {field.suffix && <span className="ml-1 text-[#8b928c]">{field.suffix}</span>}
                </span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-none bg-[#0b0d0c] px-3 text-xs font-semibold text-white hover:bg-[#0b0d0c]"
          >
            <Save aria-hidden="true" size={13} /> Save custom scenario
          </button>
        </form>
      ) : (
        <div className="mt-5 border-t border-[#e4e3dc] pt-4">
          <p className="text-xs leading-5 text-[#55605a]">
            Built-in scenarios stay unchanged. Duplicate this scenario to edit its assumptions.
          </p>
        </div>
      )}
    </section>
  );
}

function ComparisonTable({ scenarios }: { scenarios: ScenarioViewModel[] }) {
  if (scenarios.length === 0) {
    return (
      <p className="rounded-none border border-dashed border-[#e4e3dc] p-4 text-xs leading-5 text-[#55605a]">
        Select scenarios above to compare their outcomes against Current Plan.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-none border border-[#e4e3dc]">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        <caption className="sr-only">
          Comparison of {scenarios.length} scenario{scenarios.length === 1 ? '' : 's'} against
          Current Plan
        </caption>
        <thead className="bg-[#e4e3dc] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#55605a]">
          <tr>
            <th scope="col" className="px-3 py-3">Scenario</th>
            <th scope="col" className="px-3 py-3">Status</th>
            <th scope="col" className="px-3 py-3">Runway</th>
            <th scope="col" className="px-3 py-3">Final ARR</th>
            <th scope="col" className="px-3 py-3">LTV / CAC</th>
            <th scope="col" className="px-3 py-3">Monthly burn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4e3dc] bg-white">
          {scenarios.map((scenario) => (
            <tr key={scenario.id}>
              <th scope="row" className="px-3 py-3.5 text-sm font-semibold text-[#0b0d0c]">{scenario.name}</th>
              <td className="px-3 py-3.5"><StatusBadge scenario={scenario} /></td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#0b0d0c]">{formatRunway(scenario.metrics.runwayMonths)}</p>
                <p className={`mt-0.5 text-[10px] ${deltaTone(scenario.deltas.runwayMonths)}`}>
                  {formatSigned(scenario.deltas.runwayMonths, (value) => `${formatter.format(value)} mo`)}
                </p>
              </td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#0b0d0c]">{compactCurrency.format(scenario.metrics.finalArr)}</p>
                <p className={`mt-0.5 text-[10px] ${deltaTone(scenario.deltas.finalArr)}`}>
                  {formatSigned(scenario.deltas.finalArr, (value) => compactCurrency.format(value))}
                </p>
              </td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#0b0d0c]">{formatRatio(scenario.metrics.ltvOverCac)}</p>
                <p className={`mt-0.5 text-[10px] ${deltaTone(scenario.deltas.ltvOverCac)}`}>
                  {formatSigned(scenario.deltas.ltvOverCac, (value) => `${value.toFixed(1)}x`)}
                </p>
              </td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#0b0d0c]">{compactCurrency.format(scenario.metrics.monthlyBurn)}</p>
                <p className={`mt-0.5 text-[10px] ${deltaTone(scenario.deltas.monthlyBurn, true)}`}>
                  {formatSigned(scenario.deltas.monthlyBurn, (value) => compactCurrency.format(value))}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ScenarioWorkspace(props: ScenarioWorkspaceProps) {
  const selected = props.scenarios.find((scenario) => scenario.id === props.selectedScenarioId)
    ?? props.scenarios[0];
  const compared = props.comparisonIds
    .map((id) => props.scenarios.find((scenario) => scenario.id === id))
    .filter((scenario): scenario is ScenarioViewModel => scenario !== undefined);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a6a26]">
            <ShieldCheck aria-hidden="true" size={13} /> Exploration workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#0b0d0c]">Saved scenarios</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#55605a]">
            Compare operating choices without changing the financial model agents and humans use as the live plan.
          </p>
        </div>
        <button
          type="button"
          onClick={props.onReset}
          className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-none px-3 text-xs font-semibold text-[#55605a] hover:bg-[#f0efe9] hover:text-[#0b0d0c]"
        >
          <RotateCcw aria-hidden="true" size={13} /> Reset scenarios
        </button>
      </header>

      <div className="rounded-none border border-[#8a6a26] bg-[#f4ecd8] px-3.5 py-3 text-xs leading-5 text-[#6f5620]">
        <strong className="font-semibold">Exploration only.</strong> Activating or editing a scenario does not alter Current Plan. Financial changes still require a proposal and human approval.
      </div>

      <ScenarioCards {...props} />

      {selected && (
        <ScenarioDetail
          scenario={selected}
          isActive={selected.id === props.activeScenarioId}
          onActivate={() => props.onActivate(selected.id)}
          onDuplicate={() => props.onDuplicate(selected.id)}
          onSaveCustom={(draft) => props.onSaveCustom(selected.id, draft)}
          onDeleteCustom={() => props.onDeleteCustom(selected.id)}
        />
      )}

      <section className="rounded-none bg-[#ffffff] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)] sm:p-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-[#0b0d0c]">Scenario comparison</h2>
          <p className="mt-1 text-xs leading-5 text-[#55605a]">
            Deltas are measured against Current Plan. Lower burn is favorable.
          </p>
        </div>
        <p aria-live="polite" className="sr-only">
          {compared.length === 0
            ? 'No scenarios selected for comparison.'
            : `Comparing ${compared.length} scenario${compared.length === 1 ? '' : 's'}.`}
        </p>
        <ComparisonTable scenarios={compared} />
        {compared.length > 0 && <ScenarioComparisonChart data={buildRunwayComparisonData(compared)} />}
      </section>
    </div>
  );
}
