export type ViewId = 'decision-room' | 'scenarios' | 'forecast' | 'reports';

const TABS: { id: ViewId; label: string }[] = [
  { id: 'decision-room', label: 'Decision Room' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'reports', label: 'Reports' },
];

interface NavTabsProps {
  active: ViewId;
  onChange: (id: ViewId) => void;
}

export function NavTabs({ active, onChange }: NavTabsProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto" aria-label="Workspace">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
          className={`min-h-10 whitespace-nowrap rounded-none px-3.5 text-sm font-semibold transition ${
            active === tab.id
              ? 'bg-[#0b0d0c] text-[#ffffff]'
              : 'text-[#55605a] hover:bg-[#f0efe9] hover:text-[#0b0d0c]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
