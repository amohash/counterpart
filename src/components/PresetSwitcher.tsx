import { Sparkles } from 'lucide-react';
import { PRESETS, type Preset } from '../presets';

interface PresetSwitcherProps {
  activePresetId: string | undefined;
  onSelect: (preset: Preset) => void;
  disabled?: boolean;
}

/** Demo presets from CLAUDE.md section 15. A human action, not an agent
 * mutation — this replaces assumptions directly the same way the existing
 * "Reset model" button does, so it does not go through propose/approve.
 * `disabled` is set while Present mode is active, so an investor walkthrough
 * can't be knocked off-script by an accidental click. */
export function PresetSwitcher({ activePresetId, onSelect, disabled = false }: PresetSwitcherProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Demo presets">
      <Sparkles aria-hidden="true" className="text-[#8b928c]" size={14} strokeWidth={1.9} />
      {PRESETS.map((preset) => {
        const isActive = preset.id === activePresetId;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset)}
            disabled={disabled}
            aria-pressed={isActive}
            title={preset.description}
            className={`min-h-8 whitespace-nowrap rounded-none px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? 'bg-[#0b0d0c] text-[#ffffff]'
                : 'bg-[#f0efe9] text-[#55605a] hover:bg-[#e4e3dc] hover:text-[#0b0d0c]'
            }`}
          >
            {preset.name}
          </button>
        );
      })}
    </div>
  );
}
