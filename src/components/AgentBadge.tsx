import { Bot, ShieldAlert, TrendingUp } from 'lucide-react';

interface AgentBadgeProps {
  name: string;
  color: string;
}

export function AgentBadge({ name, color }: AgentBadgeProps) {
  const normalizedName = name.trim().toLowerCase();
  const Icon = normalizedName.includes('growth')
    ? TrendingUp
    : normalizedName.includes('risk')
      ? ShieldAlert
      : Bot;

  // `color` is accepted for backward compatibility with existing proposal/
  // rebuttal data (see proposal.ts's AGENT_COLOR_PALETTE), but the redesign's
  // One-Accent Rule means agent identity is carried by icon and name alone —
  // no per-agent hue competes with the single accent color.
  void color;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#0b0d0c] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0b0d0c]">
      <Icon aria-hidden="true" size={13} strokeWidth={2.2} />
      {name}
    </span>
  );
}
