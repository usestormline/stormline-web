import { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Newspaper,
  Globe2,
  MapPin
} from 'lucide-react';
import {
  useGetIntelligenceNews,
  getGetIntelligenceNewsQueryKey,
  type GetIntelligenceNewsKind,
  type IntelligenceNewsItem
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';

function NewsItem({ item }: { item: IntelligenceNewsItem }) {
  const pubDate = new Date(item.publishedAt);
  const verificationLabel = {
    official_company_release: 'Official',
    official_incident_report: 'Official incident',
    reported: 'Reported',
    single_source: 'Single source',
    structured_confirmation: 'ACLED confirmed',
  }[item.verification];
  const isVerified = item.verification === 'official_company_release' || item.verification === 'structured_confirmation';
  
  return (
    <article data-testid={`card-news-${item.id}`} className="border-b border-line last:border-b-0 hover:bg-gray-50 transition-colors p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:gap-6 group">
      <div className="lg:w-48 shrink-0 flex flex-col gap-3">
        <time dateTime={item.publishedAt} className="font-mono text-xs text-black block">
          {pubDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
          <span className="text-muted ml-2">{pubDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC</span>
        </time>
        <div className="flex flex-wrap gap-2 items-center">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 border border-[#0000FF] text-[#0000FF] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider bg-[#0000FF]/5">
              <ShieldCheck size={12} />
              {verificationLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 border border-line-strong text-black px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider bg-white">
              {item.kind === 'geopolitical' ? <Globe2 size={12} /> : <Newspaper size={12} />}
              {verificationLabel}
            </span>
          )}
          {item.kind === 'geopolitical' && (
            <span data-testid={`status-source-count-${item.id}`} className="font-mono text-[10px] text-muted">
              {item.independentSourceCount} independent {item.independentSourceCount === 1 ? 'source' : 'sources'}
            </span>
          )}
          {item.symbol && (
            <span className="font-mono text-[10px] font-bold text-black border border-line bg-white px-1.5 py-0.5">
              {item.symbol}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-medium text-base sm:text-lg leading-snug mb-2">
          <a 
            href={item.sourceUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#0000FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] rounded-sm inline-flex items-start gap-1.5"
              data-testid={`link-news-source-${item.id}`}
          >
            <span className="line-clamp-2">{item.title}</span>
            <ExternalLink size={14} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </h3>
        
        {item.summary && (
          <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">
            {item.summary}
          </p>
        )}

        {item.conflictDetails && (
          <div data-testid={`details-conflict-${item.id}`} className="mb-3 grid gap-2 border border-line bg-gray-50 p-3 text-xs sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#0000FF]" />
              <span><strong>{item.conflictDetails.location}, {item.conflictDetails.country}</strong><br />{item.conflictDetails.eventType}{item.conflictDetails.subEventType ? ` · ${item.conflictDetails.subEventType}` : ''}</span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase text-muted">Actors</span>
              <p>{item.conflictDetails.actors.length ? item.conflictDetails.actors.join(' · ') : 'Not identified'}</p>
              <p className="mt-1 font-mono text-[10px] uppercase text-muted">Reported fatalities: <strong className="text-black">{item.conflictDetails.fatalities}</strong></p>
            </div>
          </div>
        )}
        
        <div className="mt-auto pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-muted items-center">
            <span title="Source">Src: {item.source}</span>
            <span className="text-line-strong opacity-30">•</span>
            <span title="Data Provider">Prv: {item.provider}</span>
            {item.kind === 'geopolitical' && item.corroboratingSources.length > 0 && (
              <>
                <span className="text-line-strong opacity-30">•</span>
                <span title={item.corroboratingSources.join(', ')}>Sources: {item.corroboratingSources.join(', ')}</span>
              </>
            )}
            {item.category && (
              <>
                <span className="text-line-strong opacity-30">•</span>
                <span>Cat: {item.category}</span>
              </>
            )}
          </div>
          
          {item.canonicalAsset && (
             <div className="flex items-center gap-2 border border-line px-2 py-1 bg-white shrink-0 self-start sm:self-auto">
               <span className="text-[9px] font-mono uppercase text-muted tracking-wider">Canonical</span>
               <span className="font-mono text-[10px] font-bold text-black">{item.canonicalAsset.symbol}</span>
               <a 
                 href={item.canonicalAsset.explorerUrl}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-[#0000FF] hover:bg-[#0000FF]/10 p-0.5 rounded transition-colors flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0000FF]"
                 aria-label={`View ${item.canonicalAsset.symbol} on explorer`}
                 title="View contract on block explorer"
               >
                 <ExternalLink size={12} />
               </a>
             </div>
          )}
        </div>
      </div>

      {item.imageUrl && (
        <div className="hidden xl:block w-32 shrink-0 self-start">
           <div className="border border-line bg-gray-100 aspect-video relative overflow-hidden">
             <img 
               src={item.imageUrl} 
               alt="" 
               loading="lazy" 
               className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 mix-blend-multiply hover:grayscale-0 hover:opacity-100 transition-all duration-300" 
             />
           </div>
        </div>
      )}
    </article>
  );
}

export default function NewswirePage() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [debouncedSymbol, setDebouncedSymbol] = useState('');
  const [kind, setKind] = useState<GetIntelligenceNewsKind>('all');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSymbol(searchSymbol.trim().toUpperCase()), 300);
    return () => clearTimeout(timer);
  }, [searchSymbol]);

  const params = {
    kind: kind === 'all' ? undefined : kind,
    symbol: debouncedSymbol || undefined,
    limit: 50,
  };

  const query = useGetIntelligenceNews(params, {
    query: {
      queryKey: getGetIntelligenceNewsQueryKey(params),
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
    }
  });

  const lastUpdated = query.data?.asOf 
    ? new Date(query.data.asOf).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) 
    : null;

  return (
    <>
      <PageHead
        eyebrow="Market Intelligence"
        title="Newswire & Geopolitical Intelligence"
        sub={lastUpdated ? `Live feed · Synchronized at ${lastUpdated} UTC` : 'Synchronizing feed...'}
        action={
          <div className="flex items-center gap-2 border border-line-strong bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-widest shrink-0 mt-4 sm:mt-0 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <span className={`h-2 w-2 rounded-full ${query.isError || query.data?.status === 'degraded' ? 'bg-amber-500' : query.isFetching && !query.data ? 'bg-[#0000FF] animate-pulse' : 'bg-green-600'}`} />
            {query.isError ? 'Feed Unavailable' : query.isFetching && !query.data ? 'Synchronizing' : query.data?.status === 'degraded' ? 'Degraded Feed' : 'Live Feed'}
          </div>
        }
      />

      <div className="mb-6 flex flex-col justify-between gap-4 border-y border-line-strong py-4 md:flex-row md:items-center bg-white shadow-[0_4px_20px_-15px_rgba(0,0,0,0.1)]">
        <div className={`flex items-center gap-2 max-w-sm w-full relative group ${kind === 'geopolitical' ? 'opacity-50' : ''}`}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-[#0000FF] transition-colors" />
          <input 
             type="text" 
             placeholder="Filter by symbol (e.g. AAPL)"
             value={searchSymbol}
             onChange={(e) => setSearchSymbol(e.target.value)}
             className="input pl-9 h-10 font-mono text-sm uppercase placeholder:normal-case w-full"
             aria-label="Filter by symbol"
             data-testid="input-news-symbol"
             disabled={kind === 'geopolitical'}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'press_release', 'news', 'geopolitical'] as const).map(k => (
             <button
               key={k}
               onClick={() => {
                 setKind(k);
                 if (k === 'geopolitical') setSearchSymbol('');
               }}
               className={`h-10 border px-4 font-mono text-[10px] uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] ${
                 kind === k ? 'border-black bg-black text-white' : 'border-line-strong bg-white text-muted hover:border-black hover:text-black'
               }`}
               data-testid={`button-feed-${k}`}
             >
               {k === 'press_release' ? 'Official Releases' : k === 'news' ? 'Market News' : k === 'geopolitical' ? 'Geopolitical' : 'All Updates'}
             </button>
          ))}
        </div>
      </div>

      {query.data?.status === 'degraded' && (
        <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-900 p-4 font-mono text-xs flex items-start gap-3">
           <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
           <div>
             <strong className="text-sm font-sans tracking-tight">Partial Feed Degradation</strong>
             <p className="mt-1 leading-relaxed">
               One or more upstream providers are currently unavailable. The feed may be incomplete.
                {query.data.providerStatuses.filter(p => p.status !== 'live').map(p => (
                  <span key={p.provider} className="block font-bold mt-1">
                    {p.provider}: {p.status === 'access_required'
                      ? 'corporate license and API access required before commercial use'
                      : 'provider unavailable'}
                    {' '}
                    <a
                      href={p.termsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      data-testid={`link-provider-terms-${p.provider.toLowerCase()}`}
                    >
                      Review terms
                    </a>
                  </span>
                ))}
             </p>
           </div>
        </div>
      )}

      {query.isLoading ? (
        <div className="flex min-h-80 items-center justify-center border border-line-strong bg-white">
          <RefreshCw size={20} className="mr-3 animate-spin text-black" />
          <span className="text-sm text-muted font-mono uppercase tracking-widest">Loading intelligence…</span>
        </div>
      ) : query.isError ? (
        <div className="flex min-h-80 flex-col items-center justify-center border border-line-strong bg-white p-8 text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <AlertTriangle size={30} className="mb-5 text-red-600" />
          <h2 className="display text-2xl">Feed synchronization failed</h2>
          <p className="mt-3 max-w-md text-sm text-muted">Stormline could not retrieve the intelligence feed from the network.</p>
          <button type="button" onClick={() => query.refetch()} className="btn btn-outline border-black mt-6">
            Retry Connection
          </button>
        </div>
      ) : query.data?.items.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center border border-line-strong bg-white p-8 text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <Newspaper size={30} className="mb-5 text-muted opacity-50" />
          <h2 className="display text-2xl">No updates found</h2>
          <p className="mt-3 text-sm text-muted">
            {debouncedSymbol 
              ? `There are no recent releases or news items for ${debouncedSymbol}.` 
              : 'There are no intelligence updates matching your criteria.'}
          </p>
          {debouncedSymbol && (
            <button type="button" onClick={() => setSearchSymbol('')} className="btn btn-outline border-black mt-6">
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <div className="border border-line-strong bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
           {query.data?.items.map(item => (
              <NewsItem key={item.id} item={item} />
           ))}
        </div>
      )}
    </>
  );
}
