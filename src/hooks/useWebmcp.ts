import { useEffect, useRef, useState } from 'react';
import { registerModelTools, type ModelSnapshot } from '../webmcp';

/**
 * Some embedded browsers (ChatGPT's in-app browser) inject
 * `document.modelContext` well after the page mounts — sometimes only when the
 * user activates site tools — so a one-shot check reports a false negative.
 * Keep retrying for the life of the page; the check is a property read.
 */
const DETECT_RETRY_MS = 1000;

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

    const timer = window.setInterval(() => {
      if (registerModelTools(getSnapshot)) {
        setIsDetected(true);
        window.clearInterval(timer);
      }
    }, DETECT_RETRY_MS);

    return () => window.clearInterval(timer);
  }, []);

  return isDetected;
}
