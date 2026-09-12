import { useState } from 'react';
import { Radar, Briefcase, Globe } from 'lucide-react';
import { useAppKitAccount } from '@reown/appkit/react';
import {
  getGetEconomicCalendarQueryKey,
  getGetStockTokenPortfolioQueryKey,
  useGetEconomicCalendar,
  useGetStockTokenPortfolio,
  useGetStockTokenMarketDetail,
  getGetStockTokenMarketDetailQueryKey,
  type EconomicCalendarAffectedAsset,
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';
import { dateKey, addUtcDays, getStormColor, getSensitivityColor, formatSensitivity } from '@/lib/intelligence';
import { Link } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function mappingSourceLabel(source: EconomicCalendarAffectedAsset['source']) {
  if (source === 'curator') return 'Human Curator';
  if (source === 'suggested') return 'Automated Suggestion';
  return 'Stormline Editorial Model';
}

function AssetPriceSummary({ asset }: { asset: EconomicCalendarAffectedAsset }) {
  const query = useGetStockTokenMarketDetail(asset.address, {
    query: {
      queryKey: getGetStockTokenMarketDetailQueryKey(asset.address),
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
    },
  });

  if (query.isLoading) {
    return (
      <div className="w-full border-t border-line pt-3 font-mono text-[10px] uppercase tracking-wider text-muted md:w-48 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        Loading latest quote…
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="w-full border-t border-line pt-3 font-mono text-[10px] uppercase tracking-wider text-muted md:w-48 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        Price unavailable
      </div>
    );
  }

  const changeIsPositive = (query.data.change ?? 0) >= 0;
  const changePrefix = changeIsPositive ? '+' : '';

  return (
    <div className="w-full shrink-0 border-t border-line pt-3 md:w-48 md:border-l md:border-t-0 md:pl-5 md:pt-0">
      <p className="eyebrow mb-1">Latest quote</p>
      <p className="font-mono text-xl font-semibold">
        {query.data.currency === 'USD' || !query.data.currency ? '$' : ''}
        {query.data.price.toFixed(2)}
      </p>
      {query.data.change !== null && query.data.changePercent !== null ? (
        <p className={`mt-1 font-mono text-xs font-semibold ${changeIsPositive ? 'text-green-700' : 'text-red-700'}`}>
          {changePrefix}{query.data.change.toFixed(2)} ({changePrefix}{query.data.changePercent.toFixed(2)}%)
        </p>
      ) : (
        <p className="mt-1 font-mono text-xs text-muted">Change unavailable</p>
      )}
      <p className="mt-2 font-mono text-[9px] uppercase tracking-wider text-muted">
        {new Date(query.data.quoteUpdatedAt).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'UTC',
        })} UTC
      </p>
    </div>
  );
}

export default function MarketImpact() {
  const { address } = useAppKitAccount();
  const now = new Date();
  const calendarParams = { from: dateKey(now), to: dateKey(addUtcDays(now, 14)) }; // Next 14 days
  const portfolioParams = { address: address ?? '0x0000000000000000000000000000000000000000' };

  const [selectedAsset, setSelectedAsset] = useState<EconomicCalendarAffectedAsset | null>(null);

  const detailParams = selectedAsset?.address ?? '0x0000000000000000000000000000000000000000';
  const detailQuery = useGetStockTokenMarketDetail(detailParams, {
    query: {
      queryKey: getGetStockTokenMarketDetailQueryKey(detailParams),
      enabled: Boolean(selectedAsset),
      staleTime: 30 * 1000,
      refetchInterval: 30 * 1000,
    }
  });

  const calendar = useGetEconomicCalendar(calendarParams, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey(calendarParams),
      staleTime: 15 * 60 * 1000,
    },
  });

  const portfolio = useGetStockTokenPortfolio(portfolioParams, {
    query: {
      queryKey: getGetStockTokenPortfolioQueryKey(portfolioParams),
      enabled: Boolean(address),
      staleTime: 2 * 60 * 1000,
    },
  });

  const portfolioHoldings = portfolio.data?.holdings ?? [];
  const portfolioContracts = new Set(portfolioHoldings.map(h => h.contractAddress.toLowerCase()));

  const eventsWithImpact = (calendar.data?.events ?? [])
    .filter(e => !e.needsTagging && e.affectedAssets && e.affectedAssets.length > 0 && new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <>
      <PageHead
        eyebrow="GEOPOLITICAL INTELLIGENCE"
        title="Geopolitical Impact"
        sub="Event-to-token relationships separating verified direct, sector, and broad transmission vectors. Mappings describe rationale without implying unverified price forecasts."
      />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <section className="border border-line-strong bg-white p-6">
          <Briefcase size={20} className="text-black mb-4" />
          <p className="eyebrow mb-1">Analysis Mode</p>
          <p className="display text-3xl">{address ? 'Portfolio Active' : 'Market-Wide'}</p>
          <p className="mt-2 text-xs text-muted">{address ? 'Intersections with holdings are marked.' : 'Connect a wallet to map your holdings.'}</p>
        </section>
        <section className="border border-line-strong bg-white p-6">
          <Radar size={20} className="text-black mb-4" />
          <p className="eyebrow mb-1">Impact Events</p>
          <p className="display text-3xl">{calendar.isLoading ? '—' : eventsWithImpact.length}</p>
          <p className="mt-2 text-xs text-muted">Upcoming events with mapped canonical exposure.</p>
        </section>
        <section className="border border-line-strong bg-white p-6">
          <Globe size={20} className="text-black mb-4" />
          <p className="eyebrow mb-1">Editorial Policy</p>
          <p className="text-sm font-semibold mt-1 leading-snug">No Unsupported Forecasts</p>
          <p className="mt-2 text-xs text-muted leading-relaxed">Rationale describes the fundamental vector; it does not claim price direction.</p>
        </section>
      </div>

      <div className="border border-line-strong bg-white">
        <div className="border-b border-line-strong bg-gray-50 p-6 flex justify-between items-center">
          <div>
            <p className="eyebrow mb-1">Transmission Vectors</p>
            <h2 className="font-semibold text-lg">Upcoming Event Exposure</h2>
          </div>
        </div>

        {calendar.isLoading ? (
          <div className="p-10 text-center text-muted">Loading intelligence mapping…</div>
        ) : calendar.isError ? (
          <div className="p-10 text-center text-muted">Failed to load event exposure mapping. Please try again.</div>
        ) : eventsWithImpact.length === 0 ? (
          <div className="p-10 text-center text-muted">No upcoming events have mapped token exposure.</div>
        ) : (
          <div className="divide-y divide-line-strong">
            {eventsWithImpact.map(event => {
              const hasRelevant = event.affectedAssets.some(a => portfolioContracts.has(a.address.toLowerCase()));

              return (
                <div key={event.id} className="p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <Link href={`/events/${event.id}?date=${encodeURIComponent(new Date(event.date).toISOString())}`} className="display text-2xl hover:text-[#0000FF] transition-colors">{event.title}</Link>
                      <div className="flex items-center gap-2 mt-3 font-mono text-[10px] uppercase tracking-wider">
                        <span className="text-muted border border-line px-2 py-0.5">{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC'})} UTC</span>
                        <span className={`px-2 py-0.5 border ${getStormColor(event.stormRating)}`}>Storm {event.stormRating}</span>
                        {hasRelevant && (
                          <span className="text-[#0000FF] bg-blue-50 border border-[#0000FF] px-2 py-0.5">Portfolio Relevant</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {event.affectedAssets.map(asset => {
                      const isHeld = portfolioContracts.has(asset.address.toLowerCase());
                      return (
                        <button
                          type="button"
                          key={asset.address}
                          onClick={() => setSelectedAsset(asset)}
                          aria-label={`View market detail for ${asset.name || asset.symbol}`}
                          className={`w-full text-left border p-5 flex flex-col md:flex-row gap-5 md:items-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] hover:border-black ${isHeld ? 'border-[#0000FF] bg-blue-50/30' : 'border-line bg-gray-50'}`}
                        >
                            <div className="md:w-40 shrink-0">
                              <div className="font-semibold text-lg flex items-center gap-3">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black bg-black p-1.5">
                                  <img
                                    src={`https://images.financialmodelingprep.com/symbol/${encodeURIComponent(asset.symbol)}.png`}
                                    alt={`${asset.name || asset.symbol} logo`}
                                    className="h-full w-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.75)]"
                                    loading="lazy"
                                    onError={e => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                </span>
                                <span>{asset.symbol}</span>
                               {isHeld && <span className="w-2 h-2 rounded-full bg-[#0000FF]" title="In Portfolio" />}
                             </div>
                             <span className={`inline-block mt-2 font-mono text-[10px] uppercase tracking-wider border px-2 py-1 ${getSensitivityColor(asset.sensitivity)}`}>
                               {formatSensitivity(asset.sensitivity)} Vector
                             </span>
                           </div>
                           <div className="min-w-0 flex-1">
                             <p className="text-sm text-black leading-relaxed">{asset.rationale}</p>
                             <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">
                               Mapping source: {mappingSourceLabel(asset.source)}
                             </p>
                           </div>
                           <AssetPriceSummary asset={asset} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl gap-0 overflow-x-hidden overflow-y-auto rounded-none border-line-strong bg-white p-0">
          {selectedAsset && (
            <div className="min-w-0 border-b border-line-strong bg-gray-50 p-6">
              <DialogHeader className="flex min-w-0 flex-row items-center gap-4 space-y-0 pr-8 text-left">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black bg-black p-1.5">
                  <img
                     src={`https://images.financialmodelingprep.com/symbol/${encodeURIComponent(selectedAsset.symbol)}.png`}
                    alt={`${selectedAsset.name || selectedAsset.symbol} logo`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="display break-words text-xl font-semibold">{selectedAsset.name || selectedAsset.symbol}</DialogTitle>
                  <DialogDescription className="text-sm text-muted uppercase font-mono tracking-wider">
                    {selectedAsset.symbol} Market Detail
                  </DialogDescription>
                </div>
              </DialogHeader>
            </div>
          )}

          <div className="min-w-0 p-6">
             {detailQuery.isLoading ? (
               <div className="py-12 text-center text-muted font-mono text-sm animate-pulse">Loading verified market detail...</div>
             ) : detailQuery.isError ? (
               <div className="py-12 text-center flex flex-col items-center gap-4">
                 <p className="text-muted text-sm">Failed to retrieve market detail for {selectedAsset?.symbol}.</p>
                 <button onClick={() => detailQuery.refetch()} className="btn btn-outline">Retry Connection</button>
               </div>
             ) : detailQuery.data ? (
               <div className="min-w-0 space-y-8">
                 <div className="flex flex-wrap items-end justify-between gap-6">
                   <div>
                     <div className="flex items-baseline gap-3 mb-1">
                       <span className="text-5xl font-semibold display tracking-tight">${detailQuery.data.price?.toFixed(2)}</span>
                       {detailQuery.data.change !== null && detailQuery.data.changePercent !== null && (
                         <span className={`text-lg font-mono ${detailQuery.data.change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {detailQuery.data.change > 0 ? '+' : ''}{detailQuery.data.change.toFixed(2)}
                           {' '}({detailQuery.data.change > 0 ? '+' : ''}{detailQuery.data.changePercent.toFixed(2)}%)
                         </span>
                       )}
                     </div>
                     <div className="text-xs text-muted font-mono uppercase tracking-wider space-y-1">
                       <p>Provider: {detailQuery.data.provider}</p>
                       <p>Quote: {new Date(detailQuery.data.quoteUpdatedAt).toUTCString()}</p>
                       <p>Observation: {new Date(detailQuery.data.asOf).toUTCString()}</p>
                     </div>
                   </div>
                   {detailQuery.data.currency && detailQuery.data.exchange && (
                     <div className="text-right text-xs font-mono uppercase tracking-wider text-muted border border-line-strong p-3 bg-gray-50">
                       <div className="text-black font-semibold mb-1">{detailQuery.data.exchange}</div>
                       <div>{detailQuery.data.currency}</div>
                       {detailQuery.data.isEtf && <div className="mt-2 border border-line-strong px-2 py-0.5 inline-block text-black bg-white">Exchange Traded Fund</div>}
                     </div>
                   )}
                 </div>

                 <div className="min-w-0 break-words border border-[#0000FF]/20 bg-[#0000FF]/5 p-4 text-sm leading-relaxed text-[#0000FF]">
                   <strong className="font-semibold">Editorial Note:</strong> Market data is provided for asset verification and context. Price movements do not imply causality with geopolitical events. Mappings describe fundamental transmission vectors, not short-term price forecasts.
                 </div>

                 <div className="grid min-w-0 grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 md:grid-cols-4">
                   <div>
                     <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Open</p>
                      <p className="font-mono text-sm">{detailQuery.data.open !== null ? `$${detailQuery.data.open.toFixed(2)}` : '—'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Prev Close</p>
                      <p className="font-mono text-sm">{detailQuery.data.previousClose !== null ? `$${detailQuery.data.previousClose.toFixed(2)}` : '—'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Day Range</p>
                      <p className="font-mono text-sm">{detailQuery.data.dayLow !== null && detailQuery.data.dayHigh !== null ? `$${detailQuery.data.dayLow.toFixed(2)} - $${detailQuery.data.dayHigh.toFixed(2)}` : '—'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">52W Range</p>
                      <p className="font-mono text-sm">{detailQuery.data.yearLow !== null && detailQuery.data.yearHigh !== null ? `$${detailQuery.data.yearLow.toFixed(2)} - $${detailQuery.data.yearHigh.toFixed(2)}` : '—'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Volume</p>
                      <p className="font-mono text-sm">{detailQuery.data.volume !== null ? detailQuery.data.volume.toLocaleString() : '—'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Avg Volume</p>
                      <p className="font-mono text-sm">{detailQuery.data.averageVolume !== null ? detailQuery.data.averageVolume.toLocaleString() : '—'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-muted font-mono uppercase tracking-wider mb-1">Market Cap</p>
                      <p className="font-mono text-sm">{detailQuery.data.marketCap !== null ? `$${(detailQuery.data.marketCap / 1e9).toFixed(2)}B` : '—'}</p>
                   </div>
                 </div>

                 <div className="border-t border-line pt-6">
                   <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">About {detailQuery.data.name}</h3>
                   <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-wider mb-4 text-muted">
                     {detailQuery.data.sector && <span>Sector <span className="text-black">{detailQuery.data.sector}</span></span>}
                     {detailQuery.data.industry && <span>Industry <span className="text-black">{detailQuery.data.industry}</span></span>}
                     {detailQuery.data.country && <span>Country <span className="text-black">{detailQuery.data.country}</span></span>}
                     {detailQuery.data.website && (
                        <span className="min-w-0">
                          Website <a href={detailQuery.data.website} target="_blank" rel="noreferrer" className="break-all text-[#0000FF] hover:underline normal-case">{detailQuery.data.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a>
                       </span>
                     )}
                   </div>
                   {detailQuery.data.description && (
                     <p className="text-sm leading-relaxed text-black/80">{detailQuery.data.description}</p>
                   )}
                 </div>

                 <div className="border-t border-line pt-6">
                   <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider mb-3 text-muted">Canonical Contract</h3>
                   <div className="bg-gray-50 border border-line p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                     <div className="font-mono text-xs break-all">
                       <p className="text-muted mb-1 uppercase tracking-wider text-[10px]">Chain ID {detailQuery.data.chainId}</p>
                       <p className="text-black">{detailQuery.data.contractAddress}</p>
                     </div>
                     {detailQuery.data.explorerUrl && (
                       <a href={detailQuery.data.explorerUrl} target="_blank" rel="noreferrer" className="btn btn-outline text-xs shrink-0 whitespace-nowrap uppercase font-mono tracking-wider">
                         View on Explorer
                       </a>
                     )}
                   </div>
                 </div>

               </div>
             ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
