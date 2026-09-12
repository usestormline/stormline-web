import { Link } from 'wouter';
import { Plus } from 'lucide-react';
import {
  getGetEconomicCalendarQueryKey,
  getGetIntelligenceNewsQueryKey,
  useGetEconomicCalendar,
  useGetIntelligenceNews,
} from '@usestormline/api-client-react';
import { currentUtcWeek } from '@/lib/intelligence';

const GEO_RISK_PATTERN = /\b(geopolit|sanction|tariff|war|conflict|military|election|government|diplomat|nato|opec|iran|russia|ukraine|china|taiwan|israel|gaza|red sea)\w*/i;

export default function Features() {
  const week = currentUtcWeek();
  const calendar = useGetEconomicCalendar(week, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey(week),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      retry: 1,
    },
  });
  const newsParams = { limit: 100 };
  const news = useGetIntelligenceNews(newsParams, {
    query: {
      queryKey: getGetIntelligenceNewsQueryKey(newsParams),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
      retry: 1,
    },
  });

  const events = calendar.data?.events ?? [];
  const newsItems = news.data?.items ?? [];
  const valueFor = (isLoading: boolean, isError: boolean, value: number) =>
    isLoading ? '—' : isError ? 'N/A' : value.toLocaleString('en-US');

  const stats = [
    {
      label: 'Geo-risk news watch',
      value: valueFor(
        news.isLoading,
        news.isError,
        newsItems.filter(item => GEO_RISK_PATTERN.test(`${item.title} ${item.summary ?? ''} ${item.category ?? ''}`)).length,
      ),
    },
    {
      label: 'Storm impacts this week',
      value: valueFor(calendar.isLoading, calendar.isError, events.filter(event => event.stormRating >= 2).length),
    },
    {
      label: 'Canonical exposure mappings',
      value: valueFor(
        calendar.isLoading,
        calendar.isError,
        events.filter(event => !event.needsTagging && event.affectedAssets.length > 0).length,
      ),
    },
    {
      label: 'Official releases monitored',
      value: valueFor(
        news.isLoading,
        news.isError,
        newsItems.filter(item => item.verification === 'official_company_release').length,
      ),
    },
  ];

  return (
    <section className="bg-white text-black border-t border-line-strong pt-0 relative overflow-hidden" id="how-it-works">
      <div className="border-b border-line-strong w-full bg-[#f9f9f9]">
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <div key={stat.label} className="relative">
              {i !== 0 && <div className="hidden md:block absolute left-[-24px] top-0 bottom-0 w-px bg-line" />}
              <div className="display text-5xl md:text-7xl mb-3 text-black tracking-tight">{stat.value}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div>
              <div className="eyebrow mb-6">Event-aware exposure</div>
              <h2 className="display text-4xl md:text-6xl leading-[1.1] mb-8 tracking-tight">
                See verified events<br/>beside owned assets.
              </h2>
              <p className="text-muted leading-relaxed mb-10 max-w-lg text-lg">
                Stormline combines official event records with canonical Robinhood Stock Token
                balances. Unknown relationships remain unknown instead of being replaced by an
                unsupported impact score.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/calendar" className="btn btn-primary">View Storm Calendar</Link>
                <Link href="/app" className="btn btn-outline">Enter Platform</Link>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end relative h-[400px]">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-70"></div>
              <div className="wireframe-globe self-center">
                <div className="wireframe-globe-h" />
                <div className="wireframe-globe-v" />
                <div className="absolute top-[30%] left-[20%] text-brand" style={{ transform: 'translate(-50%, -50%)' }}><Plus size={24} strokeWidth={1.5} /></div>
                <div className="absolute top-[65%] right-[25%] text-brand" style={{ transform: 'translate(-50%, -50%)' }}><Plus size={24} strokeWidth={1.5} /></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 border-t border-line-strong pt-16">
            <div>
              <h3 className="text-xl font-bold mb-4 font-display">Macro Calendar</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Browse normalized macro releases and official US policy publications with source,
                agency, verification, and freshness metadata.
              </p>
              <Link href="/calendar" className="text-brand text-xs font-mono uppercase tracking-widest hover:underline">View Calendar &rarr;</Link>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 font-display">Market Impact</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Review upcoming high-impact events beside Stock Token positions detected for the
                connected wallet. No causality or return is inferred.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 font-display">Tokenized Equities</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">
                Match wallet balances only against Robinhood&apos;s official chain-4663 contract
                registry. Look-alike tickers and brokerage positions are excluded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
