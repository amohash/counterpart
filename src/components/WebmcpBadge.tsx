import { Unplug } from 'lucide-react';

interface WebmcpBadgeProps {
  isDetected: boolean;
}

export function WebmcpBadge({ isDetected }: WebmcpBadgeProps) {
  if (isDetected) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0efe9] px-3 py-1.5 text-xs font-semibold text-[#55605a]">
      <Unplug aria-hidden="true" size={13} strokeWidth={2} />
      WebMCP not detected
    </span>
  );
}
