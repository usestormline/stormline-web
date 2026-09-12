import { useRoute, Link } from 'wouter';
import { getGetEconomicCalendarQueryKey, useGetEconomicCalendar } from '@usestormline/api-client-react';
import { ArrowLeft, ExternalLink, ShieldCheck, TriangleAlert } from 'lucide-react';
import PageHead from '@/components/ui/PageHead';
import { formatSensitivity, formatStormRating, getSensitivityColor, getStormColor } from '@/lib/intelligence';

export default function EventDetail() {
  const [, params] = useRoute('/events/:id');
  const searchParams = new URLSearchParams(window.location.search);
  const dateParam = searchParams.get('date');
  
  const baseDate = dateParam ? new Date(dateParam) : new Date();
  const from = new Date(baseDate);
  from.setUTCDate(from.getUTCDate() - 7);
  const to = new Date(baseDate);
  to.setUTCDate(to.getUTCDate() + 7);
  
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);

  const { data, isLoading, isError } = useGetEconomicCalendar({ from: fromStr, to: toStr }, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey({ from: fromStr, to: toStr }),
      staleTime: 5 * 60 * 1000,
    }
  });

  const event = data?.events.find(e => e.id === params?.id);

  if (isLoading) {
    return <div className="p-8 text-center text-muted flex min-h-80 items-center justify-center">Loading intelligence brief...</div>;
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center border border-line-strong bg-white p-8 text-center mt-6">
        <TriangleAlert size={32} className="mb-4 text-black" />
        <h2 className="display text-2xl mb-2">Event Not Found</h2>
        <p className="text-muted mb-6 text-sm">The requested intelligence brief could not be located in the current time window.</p>
        <Link href="/calendar" className="btn btn-outline border-black">Return to Calendar</Link>
      </div>
    );
  }

  const dateObj = new Date(event.date);
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/calendar" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Event Intelligence
        </Link>
      </div>
      
      <header className="border border-line-strong bg-white p-6 md:p-10 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest mb-4">
              <span className={`px-2 py-1 border ${getStormColor(event.stormRating)}`}>
                 STORM {event.stormRating}: {formatStormRating(event.stormRating)}
              </span>
              {event.ratingConfirmed && (
                <span className="flex items-center gap-1 text-black border border-line-strong px-2 py-1 bg-gray-50">
                  <ShieldCheck size={12} /> Confirmed
                </span>
              )}
            </div>
            <h1 className="display text-3xl md:text-5xl leading-tight text-balance">{event.title}</h1>
          </div>
          <div className="md:text-right shrink-0">
             <p className="text-2xl font-mono text-black">{dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC</p>
             <p className="text-sm text-muted mt-1">{dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-line-strong">
          <div>
            <p className="eyebrow mb-2 text-muted">Official Source</p>
            {event.sourceUrl ? (
              <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold flex items-center gap-1 text-black hover:text-[#0000FF] underline underline-offset-4 decoration-line-strong">
                {event.source || 'External Link'} <ExternalLink size={12} />
              </a>
            ) : (
              <p className="text-sm font-semibold">{event.source || 'Not Provided'}</p>
            )}
          </div>
          <div>
            <p className="eyebrow mb-2 text-muted">Verification</p>
            <p className="text-sm font-mono uppercase">{event.verificationType.replace(/-/g, ' ')}</p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-muted">Category</p>
            <p className="text-sm">{event.category}</p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-muted">Jurisdiction</p>
            <p className="text-sm font-mono flex items-center gap-2">
              <img
                src={`https://flagcdn.com/w80/${event.countryCode === 'EA' || event.countryCode === 'EU' ? 'eu' : event.countryCode === 'UK' ? 'gb' : event.countryCode.toLowerCase()}.png`}
                width="24"
                height="16"
                alt=""
                className="border border-black/10 object-cover"
              />
              {event.countryCode}
            </p>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <div className="flex items-center justify-between border-b border-line-strong bg-gray-50 p-6 border-t border-x">
          <div>
            <p className="eyebrow mb-1">Exposure mapping</p>
            <h2 className="font-semibold text-xl">Canonical Token Transmission</h2>
          </div>
        </div>
        {event.needsTagging ? (
          <div className="border border-line-strong border-t-0 bg-white p-12 text-center">
             <p className="font-mono text-sm uppercase tracking-widest text-muted">Editorial Review Pending</p>
             <p className="mt-3 text-sm text-muted max-w-md mx-auto leading-relaxed">This event has not yet been mapped to specific canonical token contracts. The intelligence team will provide exposure rationale closer to the event date.</p>
          </div>
        ) : event.affectedAssets?.length > 0 ? (
          <div className="grid gap-0 border-x border-b border-line-strong">
            {event.affectedAssets.map((asset, i) => (
              <article key={asset.address} className={`bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start ${i !== 0 ? 'border-t border-line-strong' : ''}`}>
                <div className="flex items-center gap-5 w-full md:w-72 shrink-0">
                  {asset.logoUrl ? (
                    <img src={asset.logoUrl} alt="" className="w-14 h-14 border border-line-strong object-cover shrink-0 bg-white" />
                  ) : (
                    <div className="w-14 h-14 border border-line-strong flex items-center justify-center font-mono text-sm shrink-0 bg-gray-50">
                      {asset.symbol.slice(0,3)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xl truncate">{asset.symbol}</h3>
                    <p className="text-sm text-muted truncate mt-1">{asset.name}</p>
                  </div>
                </div>
                
                <div className="flex-1 md:border-l md:border-line-strong md:pl-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 border ${getSensitivityColor(asset.sensitivity)}`}>
                      {formatSensitivity(asset.sensitivity)} Exposure
                    </span>
                    <span className="text-[10px] font-mono text-muted uppercase tracking-wider border border-line px-2 py-1 bg-gray-50">Source: {asset.source}</span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-black max-w-3xl">{asset.rationale}</p>
                  <p className="mt-5 text-[10px] font-mono text-muted break-all">Contract: {asset.address}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-line-strong border-t-0 bg-white p-12 text-center">
             <p className="font-mono text-sm uppercase tracking-widest text-muted">No Exposure Mapped</p>
             <p className="mt-3 text-sm text-muted max-w-md mx-auto leading-relaxed">This event has been verified but currently exhibits no direct, sector, or broad transmission impact to active canonical token contracts.</p>
          </div>
        )}
      </section>
    </div>
  );
}