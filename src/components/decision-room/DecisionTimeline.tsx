import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  CornerDownRight,
  FileText,
  FlaskConical,
  History,
  ListChecks,
  Search,
  Send,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  filterTimelineEvents,
  searchTimelineEvents,
  type TimelineEvent,
  type TimelineIconKey,
} from '../../timeline';

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
  const [query, setQuery] = useState('');
  const actors = useMemo(() => Array.from(new Set(events.map((event) => event.actor))), [events]);
  const filteredEvents = useMemo(
    () => searchTimelineEvents(filterTimelineEvents(events, actorFilter), query),
    [events, actorFilter, query],
  );

  return (
    <section className="rounded-none bg-[#ffffff] p-4 shadow-[0_10px_26px_rgba(23,33,29,0.09)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[-0.01em]">
          <History aria-hidden="true" className="text-[#8a6a26]" size={16} strokeWidth={1.9} />
          Decision timeline
        </h2>
        <div className="flex items-center gap-2">
          <label className="flex min-h-8 items-center gap-1.5 rounded-none border border-[#d8d4c8] bg-white px-1.5 text-[10px] text-[#8b928c]">
            <span className="sr-only">Search timeline</span>
            <Search aria-hidden="true" size={12} strokeWidth={2} />
            <input
              aria-label="Search timeline"
              className="w-28 bg-transparent text-[10px] font-medium text-[#0b0d0c] focus:shadow-none sm:w-36"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              type="search"
              value={query}
            />
          </label>
          {actors.length > 1 && (
            <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em] text-[#8b928c]">
              <span className="sr-only">Filter timeline by actor</span>
              <select
                aria-label="Filter timeline by actor"
                className="rounded-none border border-[#d8d4c8] bg-white px-1.5 py-1 text-[10px] font-medium normal-case tracking-normal text-[#0b0d0c]"
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
      </div>
      <p aria-live="polite" className="sr-only">
        {events.length === 0
          ? 'No timeline events yet.'
          : `Showing ${filteredEvents.length} of ${events.length} timeline events.`}
      </p>
      {events.length === 0 ? (
        <p className="text-xs leading-5 text-[#55605a]">
          Human and agent decisions will appear here as they happen.
        </p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-xs leading-5 text-[#55605a]">No events match this filter.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {filteredEvents.map((event) => {
              const Icon = ICONS[event.icon];
              return (
                <motion.li
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="grid grid-cols-[16px_1fr] gap-2.5 text-xs"
                >
                  <Icon aria-hidden="true" className="mt-0.5 text-[#8b928c]" size={14} strokeWidth={2} />
                  <div>
                    <p className="leading-5 text-[#0b0d0c]">
                      <span className="font-semibold">{event.actor}</span> {event.sentence}
                    </p>
                    {event.detail && <p className="mt-0.5 leading-5 text-[#8b928c]">{event.detail}</p>}
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.06em] text-[#8b928c]">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
