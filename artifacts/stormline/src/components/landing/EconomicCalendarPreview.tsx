import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, CalendarDays, ShieldCheck } from 'lucide-react';
import {
  getGetEconomicCalendarQueryKey,
  useGetEconomicCalendar,
  type EconomicCalendarEvent,
} from '@usestormline/api-client-react';
import { currentUtcWeek, formatStormRating, getStormColor } from '@/lib/intelligence';

function formatValue(value: string | null, unit: string | null) {
  if (value === null) return '—';
  if (!unit || value.includes(unit)) return value;
  return `${value}${unit}`;
}

function flagCode(countryCode: string) {
  if (countryCode === 'EA' || countryCode === 'EU') return 'eu';
  if (countryCode === 'UK') return 'gb';
  return countryCode.toLowerCase();
}

function prioritizeEvents(events: EconomicCalendarEvent[]) {
  return [...events]
    .sort((a, b) => {
      if (b.importance !== a.importance) return b.importance - a.importance;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    })
    .slice(0, 6);
}

export default function EconomicCalendarPreview() {
  const week = currentUtcWeek();
  const calendar = useGetEconomicCalendar(week, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey(week),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      retry: 1,
    },
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const events = useMemo(() => prioritizeEvents(calendar.data?.events ?? []), [calendar.data?.events]);

  useEffect(() => {
    if (events.length < 2 || isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % events.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, [events.length, isPaused]);

  useEffect(() => {
    if (activeIndex >= events.length) setActiveIndex(0);
  }, [activeIndex, events.length]);

  if (calendar.isLoading) {
    return (
      <div className="flex h-full min-h-[430px] items-center justify-center border border-line-strong bg-black p-8 text-white shadow-[8px_8px_0_var(--brand)]">
        <div className="font-mono text-xs uppercase tracking-widest text-[#a1a1aa]">Synchronizing weekly calendar…</div>
      </div>
    );
  }

  if (calendar.isError || events.length === 0) {
    return (
      <div className="flex h-full min-h-[430px] flex-col items-center justify-center border border-line-strong bg-black p-8 text-center text-white shadow-[8px_8px_0_var(--brand)]">
        <CalendarDays size={28} className="mb-4 text-[#0000FF]" />
        <div className="font-mono text-xs uppercase tracking-widest">Calendar preview unavailable</div>
        <Link href="/calendar" className="mt-5 text-xs font-mono uppercase tracking-widest text-[#8f8fff] hover:text-white">
          Open calendar <ArrowRight size={12} className="inline" />
        </Link>
      </div>
    );
  }

  const event = events[activeIndex];
  const eventDate = new Date(event.date);

  return (
    <div
      className="flex h-full min-h-[430px] flex-col border border-line-strong bg-black text-white shadow-[8px_8px_0_var(--brand)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between border-b border-[#333] px-5 py-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[#0000FF]">Live calendar preview</div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[#777]">
            {week.from} — {week.to} · UTC
          </div>
        </div>
        <span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-500 motion-safe:animate-pulse" />
          Real feed
        </span>
      </div>

      <div key={event.id} className="flex flex-1 flex-col p-5 motion-safe:animate-[calendarReveal_450ms_ease-out]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-12 items-center justify-center overflow-hidden border border-white/20 bg-white">
              <img
                src={`https://flagcdn.com/w80/${flagCode(event.countryCode)}.png`}
                alt={`${event.countryCode} flag`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </span>
            <div>
              <div className="font-mono text-xs font-bold">{event.countryCode}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#777]">{event.category}</div>
            </div>
          </div>
          <span className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${getStormColor(event.stormRating)}`}>
            Storm {event.stormRating} · {formatStormRating(event.stormRating)}
          </span>
        </div>

        <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#777]">
          {eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
          {' · '}
          {eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })} UTC
        </div>
        <h3 className="mb-5 font-display text-2xl leading-tight">{event.title}</h3>

        <div className="mb-5 grid grid-cols-3 border-y border-[#333] py-4">
          {[
            ['Actual', formatValue(event.actual, event.unit)],
            ['Forecast', formatValue(event.forecast, event.unit)],
            ['Previous', formatValue(event.previous, event.unit)],
          ].map(([label, value]) => (
            <div key={label} className="border-r border-[#333] px-3 first:pl-0 last:border-0 last:pr-0">
              <div className="font-mono text-[8px] uppercase tracking-wider text-[#777]">{label}</div>
              <div className="mt-1 truncate font-mono text-sm font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#0000FF]" />
            <span className="text-[#a1a1aa]">
              <span className="text-white">{event.agency || event.source || 'Verified provider'}</span>
              {' · '}
              {event.verificationType.replaceAll('-', ' ')}
            </span>
          </div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-[#777]">
            Updated {new Date(event.lastUpdated).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC',
            })} UTC
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="flex min-w-0 flex-wrap gap-1">
            {event.affectedAssets.slice(0, 4).map(asset => (
              <span key={asset.address} className="border border-[#444] px-1.5 py-0.5 font-mono text-[9px]">
                {asset.symbol}
              </span>
            ))}
            {event.affectedAssets.length === 0 && (
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#777]">Exposure pending or none</span>
            )}
          </div>
          <Link
            href={`/events/${event.id}?date=${encodeURIComponent(eventDate.toISOString())}`}
            className="flex shrink-0 items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#8f8fff] hover:text-white"
          >
            Full brief <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#333] px-5 py-3">
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#777]">
          {activeIndex + 1} / {events.length} · {isPaused ? 'Paused' : 'Auto'}
        </span>
        <div className="flex gap-2" aria-label="Select calendar event">
          {events.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-5 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                index === activeIndex ? 'border-[#0000FF] bg-[#0000FF]' : 'border-[#555] bg-transparent hover:border-white'
              }`}
              aria-label={`Show event ${index + 1}: ${item.title}`}
              aria-current={index === activeIndex}
            />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes calendarReveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}