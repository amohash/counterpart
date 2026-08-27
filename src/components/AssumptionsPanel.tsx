import type { Assumptions } from '../model';

const FIELDS: { key: keyof Assumptions; label: string }[] = [
  { key: 'startingMRR', label: 'Starting MRR' },
  { key: 'newCustomersPerMonth', label: 'New customers / month' },
  { key: 'arpu', label: 'ARPU' },
  { key: 'monthlyChurnPct', label: 'Monthly churn %' },
  { key: 'cac', label: 'CAC' },
  { key: 'grossMarginPct', label: 'Gross margin %' },
  { key: 'monthlyOpex', label: 'Monthly opex' },
  { key: 'months', label: 'Months' },
];

interface AssumptionsPanelProps {
  assumptions: Assumptions;
  onChange: (key: keyof Assumptions, value: number) => void;
  onReset: () => void;
}

export function AssumptionsPanel({ assumptions, onChange, onReset }: AssumptionsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {FIELDS.map(({ key, label }) => (
        <label key={key} className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{label}</span>
          <input
            type="number"
            className="rounded border border-gray-300 px-2 py-1"
            value={assumptions[key]}
            onChange={(event) => onChange(key, Number(event.target.value))}
          />
        </label>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="mt-2 rounded bg-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-300"
      >
        Reset model
      </button>
    </div>
  );
}
