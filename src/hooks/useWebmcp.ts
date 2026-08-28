import { useEffect, useRef, useState } from 'react';
import { registerModelTools, type ModelActions, type ModelSnapshot } from '../webmcp';

/**
 * Some embedded browsers (ChatGPT's in-app browser) inject
 * `document.modelContext` well after the page mounts — sometimes only when the
 * user activates site tools — so a one-shot check reports a false negative.
 * Keep retrying for the life of the page; the check is a property read.
 */
const DETECT_RETRY_MS = 1000;

export type WebmcpActions = Omit<ModelActions, 'getSnapshot'>;

export function useWebmcp(snapshot: ModelSnapshot, actions: WebmcpActions): boolean {
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    const modelActions: ModelActions = {
      getSnapshot: () => snapshotRef.current,
      proposeEdit: (targetId, newValue, rationale, agentName) =>
        actionsRef.current.proposeEdit(targetId, newValue, rationale, agentName),
      askHuman: (question, options) => actionsRef.current.askHuman(question, options),
      annotate: (targetId, text) => actionsRef.current.annotate(targetId, text),
      addChart: (seriesIds, title) => actionsRef.current.addChart(seriesIds, title),
      highlight: (targetIds) => actionsRef.current.highlight(targetIds),
    };

    if (registerModelTools(modelActions)) {
      setIsDetected(true);
      return;
    }

    const timer = window.setInterval(() => {
      if (registerModelTools(modelActions)) {
        setIsDetected(true);
        window.clearInterval(timer);
      }
    }, DETECT_RETRY_MS);

    return () => window.clearInterval(timer);
  }, []);

  return isDetected;
}
