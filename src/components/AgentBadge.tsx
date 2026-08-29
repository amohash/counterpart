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

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{ borderColor: `${color}55`, color }}
    >
      <Icon aria-hidden="true" size={13} strokeWidth={2.2} />
      {name}
    </span>
  );
}
