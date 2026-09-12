import { Link } from 'wouter';
import {
  ArrowRight,
  CalendarClock,
  Database,
  Radar,
  ShieldCheck,
  TriangleAlert,
  Activity,
  Landmark,
  Target
} from 'lucide-react';
import {
  getGetEconomicCalendarQueryKey,
  getGetStockTokenPortfolioQueryKey,
  getGetStockTokenRegistryQueryKey,
  useGetEconomicCalendar,
  useGetStockTokenPortfolio,
  useGetStockTokenRegistry,
} from '@usestormline/api-client-react';
import { useAppKitAccount } from '@reown/appkit/react';
import PageHead from '@/components/ui/PageHead';
import { currentUtcWeek, formatStormRating, getStormColor, formatSensitivity, formatEventTime } from '@/lib/intelligence';
import GlobalRiskMap from '@/components/intelligence/GlobalRiskMap';

function StatusLabel({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'warning' | 'success' }) {
  return (
    <span className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
      tone === 'warning' ? 'border-amber-600 bg-amber-50 text-amber-800'
        : tone === 'success' ? 'border-green-700 bg-green-50 text-green-800'
        : 'border-line-strong bg-gray-50 text-muted'
    }`}>
      {children}
    </span>
  );
}

export default function Dashboard() {
  const { address } = useAppKitAccount();
  const week = currentUtcWeek();

  const calendar = useGetEconomicCalendar(week, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey(week),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      retry: 1,
    },
  });

  const portfolioParams = { address: address ?? '0x0000000000000000000000000000000000000000' };
  const stockTokens = useGetStockTokenPortfolio(portfolioParams, {
    query: {
      queryKey: getGetStockTokenPortfolioQueryKey(portfolioParams),
      enabled: Boolean(address),
      staleTime: 2 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
    },
  });

  const registry = useGetStockTokenRegistry({
    query: {
      queryKey: getGetStockTokenRegistryQueryKey(),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      retry: 1,
    },
  });

  const eventsReady = Boolean(calendar.data && !calendar.isError);
  const exposureReady = Boolean(address && stockTokens.data && !stockTokens.isError);
  const coreCoverageReady = eventsReady && exposureReady;

  const portfolioHoldings = stockTokens.data?.holdings ?? [];
  const portfolioContracts = new Set(portfolioHoldings.map(h => h.contractAddress.toLowerCase()));

  const allEvents = calendar.data?.events ?? [];
  const priorityEvents = allEvents.filter(e => e.stormRating >= 2).slice(0, 8);
  const mappedEvents = allEvents.filter(e => !e.needsTagging && e.affectedAssets && e.affectedAssets.length > 0);
  const relevantEvents = mappedEvents.filter(e => e.affectedAssets.some(a => portfolioContracts.has(a.address.toLowerCase())));

  return (
    <>
      <PageHead
        eyebrow="OVERVIEW"
        title="Intelligence Command"
        sub="Track verified political and macro events and translate intelligence into explicit portfolio strategy."
      />

      <section aria-label="Command Statistics" className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="border border-line-strong bg-white p-5 flex flex-col justify-between">
          <p className="eyebrow mb-3">Tracked Events</p>
          <div className="flex items-end justify-between">
            <p className="display text-4xl">{calendar.isLoading ? '—' : allEvents.length}</p>
            <Activity size={20} className="text-muted mb-1" />
          </div>
        </div>
        <div className="border border-line-strong bg-white p-5 flex flex-col justify-between">
          <p className="eyebrow mb-3">Mapped Exposure</p>
          <div className="flex items-end justify-between">
            <p className="display text-4xl">{calendar.isLoading ? '—' : mappedEvents.length}</p>
            <Radar size={20} className="text-muted mb-1" />
          </div>
        </div>
        <div className="border border-line-strong bg-white p-5 flex flex-col justify-between">
          <p className="eyebrow mb-3">Portfolio Relevant</p>
          <div className="flex items-end justify-between">
            <p className={`display text-4xl ${relevantEvents.length > 0 ? 'text-[#0000FF]' : 'text-black'}`}>
              {calendar.isLoading ? '—' : address ? relevantEvents.length : '0'}
            </p>
            <ShieldCheck size={20} className={relevantEvents.length > 0 ? 'text-[#0000FF] mb-1' : 'text-muted mb-1'} />
          </div>
        </div>
        <div className="border border-line-strong bg-white p-5 flex flex-col justify-between">
          <p className="eyebrow mb-3">Canonical Tokens</p>
          <div className="flex items-end justify-between">
            <p className="display text-4xl">{registry.isLoading ? '—' : registry.data?.canonicalAssetCount ?? '0'}</p>
            <Landmark size={20} className="text-muted mb-1" />
          </div>
        </div>
      </section>

      <GlobalRiskMap events={allEvents} />

      <div className="grid xl:grid-cols-3 gap-6 mb-6">
        <section className="xl:col-span-2 border border-line-strong bg-white flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-line-strong bg-gray-50">
            <div>
              <p className="eyebrow mb-1">Upcoming Horizon</p>
              <h2 className="font-semibold text-lg">Event-to-Token Queue</h2>
            </div>
            <CalendarClock size={20} />
          </div>

          {calendar.isError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#fbfbfb]">
              <Database size={24} className="mb-4 text-red-600" />
              <h3 className="display text-2xl">Verified feed unavailable</h3>
              <p className="mt-3 text-sm text-muted">Stormline cannot reach the intelligence provider.</p>
            </div>
          ) : priorityEvents.length > 0 ? (
            <div className="flex-1 divide-y divide-line">
              {priorityEvents.map((event) => {
                const visibleAssets = event.affectedAssets?.slice(0, 4) || [];
                const strongestAsset = event.affectedAssets?.slice().sort((a, b) => b.sensitivity - a.sensitivity)[0];

                return (
                  <div key={event.id} className="p-5 flex flex-col md:flex-row gap-5 justify-between group">
                    <div className="md:w-1/2 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link href={`/events/${event.id}?date=${encodeURIComponent(new Date(event.date).toISOString())}`} className="font-semibold text-lg hover:text-[#0000FF] transition-colors block">{event.title}</Link>
                        <div className="flex flex-wrap items-center gap-2 mt-3 font-mono text-[10px] uppercase">
                          <span className={`px-2 py-0.5 border ${getStormColor(event.stormRating)}`}>Storm {event.stormRating}: {formatStormRating(event.stormRating)}</span>
                          <span className="border border-line px-2 py-0.5 text-muted">{event.source || 'Official Source'}</span>
                          <span className="text-muted whitespace-nowrap">{formatEventTime(event.date)}</span>
                        </div>
                      </div>

                      {event.affectedAssets?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-line md:border-none md:pt-0 md:mt-auto">
                           <Link href={`/app/strategy?eventId=${event.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0000FF] hover:text-black transition-colors bg-blue-50/50 hover:bg-gray-100 px-3 py-1.5 border border-[#0000FF] hover:border-black">
                              <Target size={14} /> Formulate Strategy
                           </Link>
                        </div>
                      )}
                    </div>
                    <div className="md:w-1/2 md:text-right min-w-0">
                      {event.needsTagging ? (
                        <span className="inline-block border border-dashed border-line-strong px-2 py-1 text-xs text-muted font-mono uppercase tracking-wider bg-gray-50">Needs Tagging</span>
                      ) : event.affectedAssets?.length > 0 ? (
                        <div className="flex flex-col md:items-end gap-2">
                          <div className="flex flex-wrap md:justify-end gap-1.5">
                            {visibleAssets.map(a => {
                              const isHeld = portfolioContracts.has(a.address.toLowerCase());
                              return (
                                <div key={a.address} className={`flex items-center gap-1 border px-1.5 py-1 ${isHeld ? 'border-[#0000FF] bg-blue-50 text-[#0000FF]' : 'border-line-strong bg-white text-black'}`} title={`${formatSensitivity(a.sensitivity)} Exposure: ${a.rationale}`}>
                                  {a.logoUrl ? (
                                    <img src={a.logoUrl} alt="" className="w-3.5 h-3.5" />
                                  ) : (
                                    <div className="w-3.5 h-3.5 bg-gray-100 flex items-center justify-center font-mono text-[8px]">{a.symbol.charAt(0)}</div>
                                  )}
                                  <span className="text-[10px] font-mono font-semibold">{a.symbol}</span>
                                  <span className={`w-1.5 h-1.5 rounded-full ml-0.5 ${a.sensitivity === 3 ? 'bg-red-600' : a.sensitivity === 2 ? 'bg-amber-500' : 'bg-[#0000FF]'}`} />
                                </div>
                              );
                            })}
                            {event.affectedAssets.length > 4 && <span className="text-[10px] text-muted font-mono self-center">+{event.affectedAssets.length - 4}</span>}
                          </div>
                          {strongestAsset && (
                            <p className="text-sm text-black line-clamp-2 mt-1" title={strongestAsset.rationale}>
                              <span className="font-semibold">{strongestAsset.symbol} {formatSensitivity(strongestAsset.sensitivity)}:</span> {strongestAsset.rationale}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block border border-line px-2 py-1 text-xs text-muted font-mono uppercase tracking-wider">Unmapped</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-10 bg-[#fbfbfb]">
              <p className="text-sm text-muted">{calendar.isLoading ? 'Synchronizing intelligence queue…' : 'No elevated priority events in the current window.'}</p>
            </div>
          )}

          <div className="p-4 bg-gray-50 border-t border-line-strong">
            <Link href="/calendar" className="text-xs font-mono uppercase tracking-wider text-black flex items-center gap-2 hover:text-[#0000FF] w-max">
              View All Intelligence Briefs <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <aside className="border border-line-strong bg-white h-max">
          <div className="border-b border-line-strong bg-gray-50 p-5">
            <p className="eyebrow mb-1">Next Action</p>
            <Link href="/app/strategy" className="display text-2xl hover:text-[#0000FF] transition-colors flex items-center gap-2">
              <Target size={24} /> Strategy Center
            </Link>
          </div>
          <div className="space-y-5 p-5">
            <div className={`flex items-start gap-3 border-l-4 p-4 ${coreCoverageReady ? 'border-[#0000FF] bg-blue-50/50' : 'border-amber-600 bg-amber-50'}`}>
              {coreCoverageReady ? (
                <Target size={18} className="mt-0.5 shrink-0 text-[#0000FF]" />
              ) : (
                <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-800" />
              )}
              <div>
                <strong className="text-sm">{coreCoverageReady ? 'Ready for strategy formulation' : 'Wallet connection required'}</strong>
                <p className={`mt-1 text-xs leading-relaxed ${coreCoverageReady ? 'text-black' : 'text-amber-900'}`}>
                  {coreCoverageReady
                    ? 'Verified events are mapped to your portfolio. Translate intelligence into explicit decisions.'
                    : 'Connect a wallet to map your canonical Stock Token exposure to upcoming events.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/app/strategy" className="btn btn-primary w-full justify-between shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
                Open Strategy Center <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-3 pt-5 border-t border-line-strong">
              <Link href="/calendar" className="flex items-center justify-between border-b border-line pb-3 text-sm hover:text-[#0000FF]">
                <span>Event intelligence</span>
                <StatusLabel tone={eventsReady ? 'success' : calendar.isError ? 'warning' : 'muted'}>
                  {eventsReady ? 'Ready' : calendar.isError ? 'Unavailable' : 'Syncing'}
                </StatusLabel>
              </Link>
              <Link href="/app/portfolio" className="flex items-center justify-between border-b border-line pb-3 text-sm hover:text-[#0000FF]">
                <span>Token exposure index</span>
                <StatusLabel tone={registry.data ? 'success' : registry.isError ? 'warning' : 'muted'}>
                  {registry.data ? `${registry.data.canonicalAssetCount} indexed` : registry.isError ? 'Unavailable' : 'Indexing'}
                </StatusLabel>
              </Link>
              <Link href="/app/shield" className="flex items-center justify-between text-sm hover:text-[#0000FF]">
                <span>Monitoring rules</span>
                <StatusLabel tone="warning">Setup required</StatusLabel>
              </Link>
            </div>

            <Link href="/app/coverage" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-[#0000FF]">
              Open coverage matrix <ArrowRight size={13} />
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
