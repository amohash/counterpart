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
      <Sparkles aria-hidden="true" className="text-[#7a8880]" size={14} strokeWidth={1.9} />
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
            className={`min-h-8 whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? 'bg-[#17211d] text-[#f8f7f3]'
                : 'bg-[#e9ebe6] text-[#526059] hover:bg-[#dde0d9] hover:text-[#25312b]'
            }`}
          >
            {preset.name}
          </button>
        );
      })}
    </div>
  );
}
