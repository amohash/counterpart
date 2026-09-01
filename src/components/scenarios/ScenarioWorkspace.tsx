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
  healthy: 'border-[#bcd9cb] bg-[#eef6f1] text-[#176f55]',
  watch: 'border-[#e7cf9c] bg-[#fbf3e2] text-[#8a5c14]',
  risk: 'border-[#e2b3ab] bg-[#faece9] text-[#9c3b32]',
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
  if (Math.abs(value) < 0.005) return 'text-[#7a8880]';
  const favorable = inverse ? value < 0 : value > 0;
  return favorable ? 'text-[#176f55]' : 'text-[#9c3b32]';
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
      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#7a8880]">{label}</dt>
      <dd className="mt-1 tabular-nums text-sm font-semibold text-[#17211d]">{value}</dd>
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
            className={`rounded-xl border p-4 shadow-[0_10px_26px_rgba(23,33,29,0.07)] transition ${
              selected ? 'border-[#176f55] bg-[#f8f7f3]' : 'border-transparent bg-[#f8f7f3]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onSelect(scenario.id)} className="min-w-0 text-left">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-[#17211d]">{scenario.name}</span>
                  {active && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#176f55]">
                      <Check aria-hidden="true" size={11} strokeWidth={2.5} /> Active
                    </span>
                  )}
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#526059]">
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
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#dedfd9] pt-3">
              <button
                type="button"
                onClick={() => onSelect(scenario.id)}
                aria-pressed={selected}
                className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#176f55] hover:bg-[#eef6f1]"
              >
                View details
              </button>
              <label className="flex min-h-9 cursor-pointer items-center gap-2 text-xs font-medium text-[#526059]">
                <input
                  type="checkbox"
                  checked={compared}
                  onChange={() => onToggleComparison(scenario.id)}
                  className="h-4 w-4 accent-[#176f55]"
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
    <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8880]">
            {scenario.isCustom ? 'Custom scenario' : 'Saved scenario'}
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-[#17211d]">{scenario.name}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#526059]">{scenario.description}</p>
        </div>
        <StatusBadge scenario={scenario} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onActivate}
          disabled={isActive}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#176f55] px-3 text-xs font-semibold text-white transition hover:bg-[#115e47] disabled:cursor-default disabled:bg-[#cad8d1]"
        >
          <FlaskConical aria-hidden="true" size={13} strokeWidth={2.2} />
          {isActive ? 'Active exploration' : 'Explore this scenario'}
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#cfd4ce] bg-white px-3 text-xs font-semibold text-[#25312b] hover:bg-[#f1f2ee]"
        >
          <Copy aria-hidden="true" size={13} strokeWidth={2.2} /> Duplicate
        </button>
        {scenario.isCustom && (
          <button
            type="button"
            onClick={onDeleteCustom}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[#9c3b32] hover:bg-[#faece9]"
          >
            <Trash2 aria-hidden="true" size={13} strokeWidth={2.2} /> Delete
          </button>
        )}
      </div>

      {scenario.isCustom ? (
        <form key={scenario.id} onSubmit={submit} className="mt-5 border-t border-[#dedfd9] pt-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#17211d]">
            <PencilLine aria-hidden="true" className="text-[#176f55]" size={15} /> Edit assumptions
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#526059]">
              Scenario name
              <input
                name="name"
                required
                defaultValue={scenario.name}
                className="mt-1 min-h-10 w-full rounded-lg border border-[#cfd4ce] bg-white px-3 text-sm font-medium text-[#17211d]"
              />
            </label>
            <label className="text-xs font-semibold text-[#526059]">
              Description
              <input
                name="description"
                required
                defaultValue={scenario.description}
                className="mt-1 min-h-10 w-full rounded-lg border border-[#cfd4ce] bg-white px-3 text-sm text-[#17211d]"
              />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ASSUMPTION_FIELDS.map((field) => (
              <label key={field.id} className="text-xs font-semibold text-[#526059]">
                {field.label}
                <span className="mt-1 flex min-h-10 items-center rounded-lg border border-[#cfd4ce] bg-white px-3 focus-within:ring-2 focus-within:ring-[#176f55]">
                  {field.prefix && <span className="mr-1 text-[#7a8880]">{field.prefix}</span>}
                  <input
                    name={field.id}
                    type="number"
                    min="0"
                    step={field.step ?? 1}
                    required
                    defaultValue={scenario.assumptions[field.id]}
                    className="min-w-0 flex-1 bg-transparent text-sm tabular-nums text-[#17211d] focus:shadow-none"
                  />
                  {field.suffix && <span className="ml-1 text-[#7a8880]">{field.suffix}</span>}
                </span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#17211d] px-3 text-xs font-semibold text-white hover:bg-[#25312b]"
          >
            <Save aria-hidden="true" size={13} /> Save custom scenario
          </button>
        </form>
      ) : (
        <div className="mt-5 border-t border-[#dedfd9] pt-4">
          <p className="text-xs leading-5 text-[#526059]">
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
      <p className="rounded-lg border border-dashed border-[#cfd4ce] p-4 text-xs leading-5 text-[#526059]">
        Select scenarios above to compare their outcomes against Current Plan.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#dedfd9]">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        <caption className="sr-only">
          Comparison of {scenarios.length} scenario{scenarios.length === 1 ? '' : 's'} against
          Current Plan
        </caption>
        <thead className="bg-[#ecece6] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#526059]">
          <tr>
            <th scope="col" className="px-3 py-3">Scenario</th>
            <th scope="col" className="px-3 py-3">Status</th>
            <th scope="col" className="px-3 py-3">Runway</th>
            <th scope="col" className="px-3 py-3">Final ARR</th>
            <th scope="col" className="px-3 py-3">LTV / CAC</th>
            <th scope="col" className="px-3 py-3">Monthly burn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#dedfd9] bg-white">
          {scenarios.map((scenario) => (
            <tr key={scenario.id}>
              <th scope="row" className="px-3 py-3.5 text-sm font-semibold text-[#17211d]">{scenario.name}</th>
              <td className="px-3 py-3.5"><StatusBadge scenario={scenario} /></td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#25312b]">{formatRunway(scenario.metrics.runwayMonths)}</p>
                <p className={`mt-0.5 text-[10px] ${deltaTone(scenario.deltas.runwayMonths)}`}>
                  {formatSigned(scenario.deltas.runwayMonths, (value) => `${formatter.format(value)} mo`)}
                </p>
              </td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#25312b]">{compactCurrency.format(scenario.metrics.finalArr)}</p>
                <p className={`mt-0.5 text-[10px] ${deltaTone(scenario.deltas.finalArr)}`}>
                  {formatSigned(scenario.deltas.finalArr, (value) => compactCurrency.format(value))}
                </p>
              </td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#25312b]">{formatRatio(scenario.metrics.ltvOverCac)}</p>
                <p className={`mt-0.5 text-[10px] ${deltaTone(scenario.deltas.ltvOverCac)}`}>
                  {formatSigned(scenario.deltas.ltvOverCac, (value) => `${value.toFixed(1)}x`)}
                </p>
              </td>
              <td className="px-3 py-3.5 tabular-nums">
                <p className="font-semibold text-[#25312b]">{compactCurrency.format(scenario.metrics.monthlyBurn)}</p>
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
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#176f55]">
            <ShieldCheck aria-hidden="true" size={13} /> Exploration workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#17211d]">Saved scenarios</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#526059]">
            Compare operating choices without changing the financial model agents and humans use as the live plan.
          </p>
        </div>
        <button
          type="button"
          onClick={props.onReset}
          className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-lg px-3 text-xs font-semibold text-[#526059] hover:bg-[#e9ebe6] hover:text-[#25312b]"
        >
          <RotateCcw aria-hidden="true" size={13} /> Reset scenarios
        </button>
      </header>

      <div className="rounded-lg border border-[#e7cf9c] bg-[#fbf3e2] px-3.5 py-3 text-xs leading-5 text-[#72501b]">
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

      <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)] sm:p-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-[#17211d]">Scenario comparison</h2>
          <p className="mt-1 text-xs leading-5 text-[#526059]">
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
