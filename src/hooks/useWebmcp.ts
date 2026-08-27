import { useEffect, useRef, useState } from 'react';
import { registerModelTools, type ModelSnapshot } from '../webmcp';

/**
 * Some embedded browsers (ChatGPT's in-app browser) inject
 * `document.modelContext` after the page mounts, so a one-shot check reports a
 * false negative. Retry on an interval until detected or the window closes.
 */
const DETECT_RETRY_MS = 300;
const DETECT_TIMEOUT_MS = 15000;

export function useWebmcp(snapshot: ModelSnapshot): boolean {
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    const getSnapshot = () => snapshotRef.current;

    if (registerModelTools(getSnapshot)) {
      setIsDetected(true);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (registerModelTools(getSnapshot)) {
        setIsDetected(true);
        window.clearInterval(timer);
        return;
      }

      if (Date.now() - startedAt >= DETECT_TIMEOUT_MS) {
        window.clearInterval(timer);
      }
    }, DETECT_RETRY_MS);

    return () => window.clearInterval(timer);
  }, []);

  return isDetected;
}
