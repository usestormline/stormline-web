import { Link } from 'wouter';
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Database,
  History,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import {
  getGetNetworkStatisticsQueryKey,
  useGetNetworkStatistics,
} from '@usestormline/api-client-react';
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';

const classDetails = {
  live: {
    label: 'Live',
    icon: Radio,
    color: 'text-green-400 border-green-500/30 bg-green-500/10',
    description: 'Continuously refreshed from events received in the last 60 minutes.',
  },
  delayed: {
    label: 'Delayed',
    icon: Clock3,
    color: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    description: 'Finalized with a five-minute privacy and processing delay.',
  },
  historical: {
    label: 'Historical',
    icon: History,
    color: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
    description: 'Calculated from complete UTC days, excluding today.',
  },
} as const;

function StatusPanel({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <div className="border border-[#2b2b2b] bg-[#0a0a0a] p-8 md:p-12">
      <Database className="mb-6 text-[#666]" size={28} />
      <h2 className="font-display text-3xl mb-3">{title}</h2>
      <p className="text-[#a1a1aa] max-w-xl leading-relaxed">{description}</p>
      {retry && (
        <button onClick={retry} className="mt-6 border border-[#444] px-4 py-2 text-xs font-mono uppercase tracking-widest hover:border-white">
          Try again
        </button>
      )}
    </div>
  );
}

export default function Stats() {
  const statistics = useGetNetworkStatistics({
    query: {
      queryKey: getGetNetworkStatisticsQueryKey(),
      refetchInterval: 60_000,
      staleTime: 30_000,
    },
  });
  const data = statistics.data;
  const unavailable = statistics.isError;

  const formattedAsOf = data
    ? new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'medium',
        timeZone: 'UTC',
      }).format(new Date(data.asOf))
    : null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-dark text-white selection:bg-brand selection:text-white">
      <PublicHeader />

      <main className="flex-1 flex flex-col">
        <section className="px-6 md:px-12 py-16 md:py-24 border-b border-[#222] bg-[#050505]">
          <div className="max-w-[1600px] mx-auto w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-brand/30 bg-brand/10 mb-8 text-xs font-mono uppercase tracking-widest text-brand">
              <span className={`w-1.5 h-1.5 rounded-full ${data?.status === 'live' ? 'bg-green-400 animate-pulse' : 'bg-brand'}`} />
              {unavailable ? 'Unavailable aggregate feed' : data ? `${data.status} aggregate feed` : 'Aggregate feed'}
            </div>
            <h1 className="display text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6">Network Statistics</h1>
            <p className="text-[#a1a1aa] max-w-2xl text-lg leading-relaxed">
              Real rule and system activity reported only as privacy-protected totals. Stormline never publishes names, wallet addresses, account identifiers, or individual activity records.
            </p>
            {formattedAsOf && !unavailable && (
              <p className="mt-6 text-xs font-mono uppercase tracking-widest text-[#666]">
                Last checked {formattedAsOf} UTC · Refreshes every minute
              </p>
            )}
          </div>
        </section>

        <section className="px-6 md:px-12 py-12 border-b border-[#222]">
          <div className="max-w-[1600px] mx-auto w-full">
            {statistics.isLoading && !unavailable && (
              <StatusPanel title="Loading network totals" description="Requesting the latest privacy-safe aggregates from the network." />
            )}
            {unavailable && (
              <StatusPanel
                title="Statistics temporarily unavailable"
                description="The aggregate service could not be reached. The data provider may be temporarily offline."
                retry={() => statistics.refetch()}
              />
            )}
            {!unavailable && data?.status === 'empty' && (
              <StatusPanel
                title="No network activity yet"
                description="No rule evaluations or activity events have been received. Totals will appear after real events arrive and the privacy threshold is met."
              />
            )}
            {!unavailable && data?.status === 'private' && (
              <StatusPanel
                title="Activity is below the privacy threshold"
                description={`Events have been received, but no feed timing or counts are published until at least ${data.minimumCohortSize} anonymous cohorts contribute.`}
              />
            )}
            {!unavailable && data && data.status !== 'empty' && data.status !== 'private' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.metrics.map((metric) => {
                  const detail = classDetails[metric.dataClass];
                  const Icon = detail.icon;
                  return (
                    <article key={metric.key} className="bg-[#0a0a0a] border border-[#222] p-6">
                      <div className={`inline-flex items-center gap-2 border px-2 py-1 text-[10px] font-mono uppercase tracking-widest mb-6 ${detail.color}`}>
                        <Icon size={11} />
                        {detail.label}
                      </div>
                      <div className="text-xs font-mono uppercase tracking-widest text-[#777] mb-3 min-h-8">{metric.label}</div>
                      <div className="display text-4xl mb-3">
                        {metric.suppressed ? 'Private' : metric.count?.toLocaleString()}
                      </div>
                      <div className="text-[11px] leading-relaxed text-[#777]">{metric.window}</div>
                      {metric.suppressed && (
                        <div className="mt-4 text-[11px] leading-relaxed text-[#a1a1aa]">
                          Hidden until {data.minimumCohortSize} or more anonymous cohorts contribute.
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 md:px-12 py-16 flex-1 bg-[#0a0a0a]">
          <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#222]">
                <h2 className="font-display text-2xl">Metric timing</h2>
                <span className="text-xs font-mono text-[#666] uppercase tracking-widest">UTC windows</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(classDetails).map(([key, detail]) => {
                  const Icon = detail.icon;
                  return (
                    <div key={key} className="border border-[#222] bg-dark p-6">
                      <Icon className="text-[#777] mb-5" size={20} />
                      <h3 className="font-display text-xl mb-3">{detail.label}</h3>
                      <p className="text-sm text-[#8b8b93] leading-relaxed">{detail.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 border border-[#222] p-5 flex gap-4">
                <ShieldCheck className="text-brand shrink-0" size={19} />
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  Every public count requires at least {data?.minimumCohortSize ?? 3} distinct anonymous cohorts. Below that threshold, the value is marked <strong className="text-white font-medium">Private</strong> rather than estimated.
                </p>
              </div>
            </div>

            <div>
              <div className="mb-8 pb-4 border-b border-[#222]">
                <h2 className="font-display text-2xl">Feed state</h2>
              </div>
              <div className="bg-dark border border-[#222] p-6 mb-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#a1a1aa]">Current data</span>
                  <span className="font-mono text-xs uppercase text-brand">{unavailable ? 'Unavailable' : data?.status ?? 'Loading'}</span>
                </div>
                <p className="text-sm text-[#777] leading-relaxed">
                  {!unavailable && data?.status === 'live' && 'Recent events are arriving. Live metrics may continue to change.'}
                  {!unavailable && data?.status === 'delayed' && 'Thresholded activity exists in the previous 24 hours, outside the live window.'}
                  {!unavailable && data?.status === 'historical' && 'Only thresholded historical activity is available; recent windows remain private or empty.'}
                  {!unavailable && data?.status === 'private' && 'Activity exists, but its timing and totals remain hidden below the privacy threshold.'}
                  {!unavailable && data?.status === 'empty' && 'The service is available, but it has not received activity.'}
                  {unavailable && 'The service is unavailable, so retained totals are hidden until a fresh response is verified.'}
                  {!data && !unavailable && 'Checking the aggregate service.'}
                </p>
              </div>
              <div className="bg-brand text-white p-6 relative overflow-hidden">
                <Activity size={20} className="mb-5" />
                <h3 className="font-display text-xl mb-2">Review market impact</h3>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Compare verified event windows with canonical Stock Token exposure.
                </p>
                <Link href="/app/impact" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest border border-white/30 px-4 py-2 hover:bg-white hover:text-brand transition-colors">
                  Open Market Impact <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}