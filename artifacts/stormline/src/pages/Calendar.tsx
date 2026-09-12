import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  getGetEconomicCalendarQueryKey,
  useGetEconomicCalendar,
  type EconomicCalendarEvent,
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';
import { currentUtcWeek, addUtcDays, dateKey, formatSensitivity, getSensitivityColor } from '@/lib/intelligence';

type ImpactFilter = 'major' | 'high';
type CategoryFilter = 'All' | EconomicCalendarEvent['category'];

function formatValue(value: string | null, unit: string | null) {
  if (value === null) return '—';
  if (!unit || value.includes(unit)) return value;
  return `${value}${unit}`;
}

function impactLabel(importance: number) {
  if (importance >= 3) return 'High';
  if (importance === 2) return 'Medium';
  if (importance === 1) return 'Low';
  return 'None';
}

function EventBrief({ event }: { event: EconomicCalendarEvent }) {
  return (
    <div className="p-4 sm:p-5 md:p-6 border-t border-line bg-[#f8f8f8]">
      <div className="flex items-center justify-between mb-4 border-b border-line-strong pb-3">
        <h4 className="font-semibold text-sm">Intelligence Brief</h4>
        <Link href={`/events/${event.id}?date=${encodeURIComponent(new Date(event.date).toISOString())}`} className="text-xs font-mono uppercase tracking-wider flex items-center gap-1 text-black hover:text-[#0000FF] transition-colors">
          Open full brief <ArrowRight size={12} />
        </Link>
      </div>
      {event.needsTagging ? (
        <p className="text-sm text-muted">Editorial review is pending. Canonical exposure has not yet been mapped.</p>
      ) : event.affectedAssets?.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {event.affectedAssets.map(a => (
            <div key={a.address} className="border border-line-strong bg-white p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-lg">{a.symbol}</span>
                <span className={`text-[10px] font-mono uppercase tracking-wider border px-1.5 py-0.5 ${getSensitivityColor(a.sensitivity)}`}>
                  {formatSensitivity(a.sensitivity)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-black mb-3">{a.rationale}</p>
              <p className="text-[9px] font-mono text-muted break-all">Contract: {a.address}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No direct, sector, or broad canonical exposure mapped.</p>
      )}
    </div>
  );
}

function EventCard({ event, expanded, onToggle }: { event: EconomicCalendarEvent; expanded: boolean; onToggle: () => void; }) {
  const eventDate = new Date(event.date);

  return (
    <div className="border-b border-line last:border-b-0 hover:bg-gray-50 transition-colors flex flex-col">
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img
              src={`https://flagcdn.com/w80/${event.countryCode === 'EA' || event.countryCode === 'EU' ? 'eu' : event.countryCode === 'UK' ? 'gb' : event.countryCode.toLowerCase()}.png`}
              width="32"
              height="22"
              loading="lazy"
              alt=""
              className="h-[22px] w-8 border border-black/10 object-cover"
            />
            <span className="block font-mono text-xs">{event.countryCode}</span>
          </div>
          <span className="font-mono text-sm text-black">
            {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
          </span>
        </div>

        <div>
          <div className="font-medium text-black">
            {event.title}
            {event.period ? <span className="text-muted"> ({event.period})</span> : null}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted flex-wrap">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                event.importance >= 3 ? 'bg-red-600' : event.importance === 2 ? 'bg-amber-500' : event.importance === 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
            <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider">{event.category}</span>
            <span>{impactLabel(event.importance)} impact</span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-muted uppercase tracking-wider">Act / Fcst / Prev</span>
            <div className="flex items-baseline gap-2 font-mono text-xs">
              <span className="text-black font-semibold">{formatValue(event.actual, event.unit) || '—'}</span>
              <span className="text-muted">{formatValue(event.forecast, event.unit) || '—'} / {formatValue(event.previous, event.unit) || '—'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="inline-flex h-8 px-3 items-center justify-center gap-2 border border-line-strong bg-white hover:border-black transition-colors font-mono text-[10px] uppercase tracking-wider text-black"
          >
            {expanded ? 'Close' : 'Brief'} <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="pt-2 border-t border-line-strong border-dashed mt-2">
          {event.needsTagging ? (
             <span className="inline-block border border-dashed border-line-strong bg-white px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted tracking-wider">Needs Tagging</span>
          ) : event.affectedAssets?.length > 0 ? (
             <div className="flex flex-wrap gap-1">
               {event.affectedAssets.map(a => (
                 <span key={a.address} className={`text-[9px] font-mono border px-1 ${a.sensitivity >= 3 ? 'border-black text-black' : 'border-line text-muted'}`}>
                   {a.symbol}
                 </span>
               ))}
             </div>
          ) : (
             <span className="text-[10px] font-mono text-muted">—</span>
          )}
        </div>
      </div>
      {expanded && <EventBrief event={event} />}
    </div>
  );
}

function EventRow({ event, expanded, onToggle }: { event: EconomicCalendarEvent; expanded: boolean; onToggle: () => void; }) {
  const eventDate = new Date(event.date);

  return (
    <>
      <tr className="border-b border-line hover:bg-gray-50 transition-colors">
        <td className="whitespace-nowrap px-4 py-4 align-top sm:px-5">
          <div className="flex items-center gap-3">
            <img
              src={`https://flagcdn.com/w80/${event.countryCode === 'EA' || event.countryCode === 'EU' ? 'eu' : event.countryCode === 'UK' ? 'gb' : event.countryCode.toLowerCase()}.png`}
              width="32"
              height="22"
              loading="lazy"
              alt=""
              className="h-[22px] w-8 border border-black/10 object-cover"
            />
            <div>
              <span className="block font-mono text-xs">{event.countryCode}</span>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-sm sm:px-5">
          {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })}
        </td>
        <td className="min-w-72 px-4 py-4 align-top sm:px-5 whitespace-normal">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                event.importance >= 3 ? 'bg-red-600' : event.importance === 2 ? 'bg-amber-500' : event.importance === 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
            <div>
              <div className="font-medium text-black">
                {event.title}
                {event.period ? <span className="text-muted"> ({event.period})</span> : null}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted flex-wrap">
                <span className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider">{event.category}</span>
                <span>{impactLabel(event.importance)} impact</span>
              </div>
            </div>
          </div>
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-right font-mono text-xs sm:px-5 align-top">
          <div className="flex flex-col items-end gap-1">
             <span className="text-black">{formatValue(event.actual, event.unit) || '—'}</span>
             <span className="text-muted">{formatValue(event.forecast, event.unit) || '—'} / {formatValue(event.previous, event.unit) || '—'}</span>
          </div>
        </td>
        <td className="px-4 py-4 sm:px-5 align-top whitespace-normal min-w-40">
          {event.needsTagging ? (
             <span className="inline-block border border-dashed border-line-strong bg-white px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted tracking-wider">Needs Tagging</span>
          ) : event.affectedAssets?.length > 0 ? (
             <div className="flex flex-wrap gap-1">
               {event.affectedAssets.slice(0, 3).map(a => (
                 <span key={a.address} className={`text-[9px] font-mono border px-1 ${a.sensitivity >= 3 ? 'border-black text-black' : 'border-line text-muted'}`}>
                   {a.symbol}
                 </span>
               ))}
               {event.affectedAssets.length > 3 && <span className="text-[9px] text-muted font-mono self-center">+{event.affectedAssets.length - 3}</span>}
             </div>
          ) : (
             <span className="text-[10px] font-mono text-muted">—</span>
          )}
        </td>
        <td className="px-4 py-4 text-right sm:px-5 align-top">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="inline-flex h-8 w-8 items-center justify-center border border-line-strong bg-white hover:border-black transition-colors"
          >
            <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={6} className="p-0 border-b border-line">
            <EventBrief event={event} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => new Date(currentUtcWeek().from));
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('major');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const weekEnd = addUtcDays(weekStart, 6);

  const query = useGetEconomicCalendar(
    { from: dateKey(weekStart), to: dateKey(weekEnd) },
    {
      query: {
        queryKey: getGetEconomicCalendarQueryKey({ from: dateKey(weekStart), to: dateKey(weekEnd) }),
        staleTime: 5 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000,
        retry: 1,
      },
    },
  );

  const events = useMemo(() => {
    const available = query.data?.events ?? [];
    return available.filter(
      (event) =>
        event.importance >= (impactFilter === 'high' ? 3 : 2) &&
        (categoryFilter === 'All' || event.category === categoryFilter),
    );
  }, [categoryFilter, impactFilter, query.data?.events]);

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, EconomicCalendarEvent[]>();
    for (const event of events) {
      const key = event.date.slice(0, 10);
      const existing = groups.get(key) ?? [];
      existing.push(event);
      groups.set(key, existing);
    }
    return [...groups.entries()];
  }, [events]);

  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'long', day: '2-digit', timeZone: 'UTC' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric', timeZone: 'UTC' })}`;

  return (
    <>
      <PageHead
        eyebrow="Event Intelligence"
        title="Geopolitical & Macro Calendar"
        sub={`${weekLabel} · Verified policy, regulation, and market events mapped to token exposure · Time Zone UTC`}
        action={
          <div className="flex items-center gap-2 border border-line-strong bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-widest shrink-0 mt-4 sm:mt-0">
            <span className={`h-2 w-2 rounded-full ${query.isError ? 'bg-red-600' : query.isFetching ? 'bg-amber-500' : 'bg-green-600'}`} />
            {query.isError ? 'Feed unavailable' : query.isFetching ? 'Synchronizing' : `${query.data?.status ?? 'ready'} feed`}
          </div>
        }
      />

      <div className="mb-6 flex flex-col justify-between gap-4 border-y border-line-strong py-4 md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setWeekStart((current) => addUtcDays(current, -7))} className="btn btn-outline h-10 px-3 shrink-0">
            <ChevronLeft size={16} />
          </button>
          <button type="button" onClick={() => setWeekStart(new Date(currentUtcWeek().from))} className="btn btn-outline h-10 px-4 shrink-0">
            Current week
          </button>
          <button type="button" onClick={() => setWeekStart((current) => addUtcDays(current, 7))} className="btn btn-outline h-10 px-3 shrink-0">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Macro', 'Policy & Regulation', 'Sanctions'] as const).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={`h-10 border px-3 font-mono text-[10px] uppercase tracking-wider ${
                categoryFilter === category ? 'border-black bg-black text-white' : 'border-line-strong bg-white text-muted hover:border-black'
              }`}
            >
              {category}
            </button>
          ))}
          {(['major', 'high'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setImpactFilter(filter)}
              className={`h-10 border px-4 font-mono text-[10px] uppercase tracking-wider ${
                impactFilter === filter ? 'border-black bg-black text-white' : 'border-line-strong bg-white text-muted hover:border-black'
              }`}
            >
              {filter === 'major' ? 'Medium + High' : 'High only'}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex min-h-80 items-center justify-center border border-line-strong bg-white">
          <RefreshCw size={20} className="mr-3 animate-spin text-black" />
          <span className="text-sm text-muted">Loading verified events…</span>
        </div>
      ) : query.isError ? (
        <div className="flex min-h-80 flex-col items-center justify-center border border-line-strong bg-white p-8 text-center">
          <CalendarDays size={30} className="mb-5 text-red-600" />
          <h2 className="display text-2xl">Calendar feed unavailable</h2>
          <p className="mt-3 max-w-md text-sm text-muted">Stormline could not retrieve verified events.</p>
          <button type="button" onClick={() => query.refetch()} className="btn btn-primary mt-6">Retry synchronization</button>
        </div>
      ) : groupedEvents.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center border border-line-strong bg-white p-8 text-center">
          <CalendarDays size={30} className="mb-5 text-muted" />
          <h2 className="display text-2xl">No matching releases</h2>
          <p className="mt-3 text-sm text-muted">There are no matching events in this UTC week.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(([day, dayEvents]) => {
            const date = new Date(`${day}T00:00:00.000Z`);
            return (
              <section key={day} className="border border-line-strong bg-white">
                <header className="flex items-center justify-between border-b border-line-strong bg-gray-50 px-4 py-3 sm:px-5">
                  <h2 className="font-semibold text-sm sm:text-base">{date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })}</h2>
                  <time dateTime={day} className="font-mono text-xs text-muted">{date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}</time>
                </header>

                <div className="lg:hidden flex flex-col">
                  {dayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      expanded={expandedEventId === event.id}
                      onToggle={() => setExpandedEventId((current) => current === event.id ? null : event.id)}
                    />
                  ))}
                </div>

                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead className="border-b border-line bg-white">
                      <tr className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        <th className="px-4 py-3 text-left font-normal sm:px-5">Jurisdiction</th>
                        <th className="px-4 py-3 text-left font-normal sm:px-5">UTC</th>
                        <th className="px-4 py-3 text-left font-normal sm:px-5">Release</th>
                        <th className="px-4 py-3 text-right font-normal sm:px-5">Act / Fcst / Prev</th>
                        <th className="px-4 py-3 text-left font-normal sm:px-5 w-48">Exposure</th>
                        <th className="px-4 py-3 text-right font-normal sm:px-5 w-16">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayEvents.map((event) => (
                        <EventRow
                          key={event.id}
                          event={event}
                          expanded={expandedEventId === event.id}
                          onToggle={() => setExpandedEventId((current) => current === event.id ? null : event.id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}