import {
  AlertTriangle,
  Check,
  CornerDownRight,
  FileText,
  FlaskConical,
  History,
  ListChecks,
  Send,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { filterTimelineEvents, type TimelineEvent, type TimelineIconKey } from '../../timeline';

const ICONS: Record<TimelineIconKey, LucideIcon> = {
  read: FileText,
  risk: AlertTriangle,
  scenario: FlaskConical,
  proposal: Send,
  rebuttal: CornerDownRight,
  approve: Check,
  reject: X,
  report: FileText,
  preset: Sparkles,
  plan: ListChecks,
};

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface DecisionTimelineProps {
  events: TimelineEvent[];
}

export function DecisionTimeline({ events }: DecisionTimelineProps) {
  const [actorFilter, setActorFilter] = useState('all');
  const actors = useMemo(() => Array.from(new Set(events.map((event) => event.actor))), [events]);
  const filteredEvents = useMemo(
    () => filterTimelineEvents(events, actorFilter),
    [events, actorFilter],
  );

  return (
    <section className="rounded-xl bg-[#f8f7f3] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
          <History aria-hidden="true" className="text-[#176f55]" size={16} strokeWidth={1.9} />
          Decision timeline
        </h2>
        {actors.length > 1 && (
          <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em] text-[#7a8880]">
            <span className="sr-only">Filter timeline by actor</span>
            <select
              aria-label="Filter timeline by actor"
              className="rounded-md border border-[#d8d4c8] bg-white px-1.5 py-1 text-[10px] font-medium normal-case tracking-normal text-[#25312b]"
              onChange={(event) => setActorFilter(event.target.value)}
              value={actorFilter}
            >
              <option value="all">All actors</option>
              {actors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {events.length === 0 ? (
        <p className="text-xs leading-5 text-[#526059]">
          Human and agent decisions will appear here as they happen.
        </p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-xs leading-5 text-[#526059]">No events from this actor yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filteredEvents.map((event) => {
            const Icon = ICONS[event.icon];
            return (
              <li key={event.id} className="grid grid-cols-[16px_1fr] gap-2.5 text-xs">
                <Icon aria-hidden="true" className="mt-0.5 text-[#7a8880]" size={14} strokeWidth={2} />
                <div>
                  <p className="leading-5 text-[#25312b]">
                    <span className="font-semibold">{event.actor}</span> {event.sentence}
                  </p>
                  {event.detail && <p className="mt-0.5 leading-5 text-[#7a8880]">{event.detail}</p>}
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.06em] text-[#a2aca4]">
                    {formatTime(event.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
