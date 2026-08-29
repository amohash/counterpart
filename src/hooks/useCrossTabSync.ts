import { useEffect, useRef } from 'react';
import type { Assumptions } from '../model';
import type { Proposal } from '../proposal';

const CHANNEL_NAME = 'counterpart';
const STORAGE_KEY = 'counterpart-sync';

interface Snapshot {
  assumptions: Assumptions;
  proposals: Proposal[];
}

interface StateMessage extends Snapshot {
  type: 'state';
  senderId: string;
  version: number;
}

interface RequestMessage {
  type: 'request-state';
  senderId: string;
  version: number;
}

type SyncMessage = StateMessage | RequestMessage;

interface UseCrossTabSyncOptions extends Snapshot {
  replaceAssumptions: (next: Assumptions) => void;
  replaceProposals: (next: Proposal[]) => void;
}

let lastVersion = 0;

function nextVersion(): number {
  lastVersion = Math.max(Date.now(), lastVersion + 1);
  return lastVersion;
}

function isSyncMessage(value: unknown): value is SyncMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SyncMessage>;
  return (
    (candidate.type === 'state' || candidate.type === 'request-state') &&
    typeof candidate.senderId === 'string' &&
    typeof candidate.version === 'number'
  );
}

export function useCrossTabSync({
  assumptions,
  proposals,
  replaceAssumptions,
  replaceProposals,
}: UseCrossTabSyncOptions): void {
  const senderId = useRef('');
  const snapshotRef = useRef<Snapshot>({ assumptions, proposals });
  const previousSnapshotRef = useRef<Snapshot>({ assumptions, proposals });
  const publishRef = useRef<(message: SyncMessage) => void>(() => undefined);
  const suppressNextPublish = useRef(false);
  const latestVersion = useRef(0);

  useEffect(() => {
    snapshotRef.current = { assumptions, proposals };
  }, [assumptions, proposals]);

  useEffect(() => {
    const currentSenderId = `${Date.now()}-${Math.random()}`;
    senderId.current = currentSenderId;
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);

    const publish = (message: SyncMessage) => {
      if (channel) {
        channel.postMessage(message);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
      }
    };

    const receive = (value: unknown) => {
      if (!isSyncMessage(value) || value.senderId === currentSenderId) return;

      if (value.type === 'request-state') {
        const version = nextVersion();
        latestVersion.current = version;
        publish({ type: 'state', senderId: currentSenderId, version, ...snapshotRef.current });
        return;
      }

      if (value.version <= latestVersion.current) return;
      latestVersion.current = value.version;
      lastVersion = Math.max(lastVersion, value.version);
      suppressNextPublish.current = true;
      replaceAssumptions(value.assumptions);
      replaceProposals(value.proposals);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        receive(JSON.parse(event.newValue));
      } catch {
        // Ignore malformed messages from unrelated or older localStorage data.
      }
    };

    publishRef.current = publish;
    if (channel) {
      channel.addEventListener('message', (event) => receive(event.data));
    } else {
      window.addEventListener('storage', onStorage);
    }

    publish({ type: 'request-state', senderId: currentSenderId, version: nextVersion() });

    return () => {
      publishRef.current = () => undefined;
      channel?.close();
      window.removeEventListener('storage', onStorage);
    };
  }, [replaceAssumptions, replaceProposals]);

  useEffect(() => {
    const previous = previousSnapshotRef.current;
    if (previous.assumptions === assumptions && previous.proposals === proposals) return;
    previousSnapshotRef.current = { assumptions, proposals };

    if (suppressNextPublish.current) {
      suppressNextPublish.current = false;
      return;
    }

    const version = nextVersion();
    latestVersion.current = version;
    publishRef.current({ type: 'state', senderId: senderId.current, version, assumptions, proposals });
  }, [assumptions, proposals]);
}
