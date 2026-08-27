import { describeSurfaces } from '../webmcp';

interface WebmcpBadgeProps {
  isDetected: boolean;
}

export function WebmcpBadge({ isDetected }: WebmcpBadgeProps) {
  if (isDetected) return null;

  return (
    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
      WebMCP not detected ({describeSurfaces()})
    </span>
  );
}
