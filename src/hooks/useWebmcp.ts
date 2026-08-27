import { useEffect, useRef, useState } from 'react';
import { registerModelTools, type ModelSnapshot } from '../webmcp';

/**
 * Registers WebMCP tools once on mount. The snapshot is held in a ref so the
 * tool always reads current state without re-registering.
 */
export function useWebmcp(snapshot: ModelSnapshot): boolean {
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    setIsDetected(registerModelTools(() => snapshotRef.current));
  }, []);

  return isDetected;
}
