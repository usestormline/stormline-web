import { Link } from 'wouter';
import { useAppKitAccount } from '@reown/appkit/react';
import { ArrowRight, CalendarClock, Landmark, ShieldCheck, TriangleAlert } from 'lucide-react';
import {
  getGetEconomicCalendarQueryKey,
  getGetStockTokenPortfolioQueryKey,
  useGetEconomicCalendar,
  useGetStockTokenPortfolio,
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';

function currentUtcWeek() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = start.getUTCDay();
  start.setUTCDate(start.getUTCDate() - (day === 0 ? 6 : day - 1));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export default function ProtectionCoverage() {
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
  const portfolioParams = {
    address: address ?? '0x0000000000000000000000000000000000000000',
  };
  const portfolio = useGetStockTokenPortfolio(portfolioParams, {
    query: {
      queryKey: getGetStockTokenPortfolioQueryKey(portfolioParams),
      enabled: Boolean(address),
      staleTime: 2 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
    },
  });

  const eventsReady = Boolean(calendar.data && !calendar.isError);
  const exposureReady = Boolean(address && portfolio.data && !portfolio.isError);
  const holdings = portfolio.data?.holdings.length ?? 0;

  const items = [
    {
      title: 'Verified events',
      detail: eventsReady
        ? `${calendar.data?.events.length ?? 0} events synchronized for the current UTC week.`
        : calendar.isError
          ? 'The verified event feed could not be reached.'
          : 'Synchronizing the verified event feed.',
      status: eventsReady ? 'Ready' : calendar.isError ? 'Unavailable' : 'Syncing',
      ready: eventsReady,
      href: '/calendar',
      action: 'Open Event Calendar',
      icon: CalendarClock,
    },
    {
      title: 'Token exposure index',
      detail: exposureReady
        ? `${portfolio.data?.catalogCount ?? 0} canonical contracts indexed; ${holdings} positions have a nonzero balance.`
        : portfolio.isError
          ? 'The Robinhood registry or chain endpoint could not be reached.'
          : address
            ? 'Indexing canonical contracts for the connected wallet.'
            : 'Connect a wallet to calculate Stock Token exposure.',
      status: exposureReady
        ? 'Ready'
        : portfolio.isError
          ? 'Unavailable'
          : address
            ? 'Indexing'
            : 'Connect wallet',
      ready: exposureReady,
      href: '/app/portfolio',
      action: 'Open Stock Tokens',
      icon: Landmark,
    },
    {
      title: 'Monitoring rules',
      detail:
        'Rule persistence, scheduled evaluation, audit records, and a notification destination are required before rules can be armed.',
      status: 'Setup required',
      ready: false,
      href: '/app/shield',
      action: 'Open Monitoring Rules',
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      <PageHead
        eyebrow="Shield readiness"
        title="Protection Coverage"
        sub="Live readiness checks for verified events, canonical Stock Token exposure, and monitoring rules."
      />

      <section className="grid gap-5 lg:grid-cols-3">
        {items.map(({ title, detail, status, ready, href, action, icon: Icon }) => (
          <article key={title} className="flex min-h-72 flex-col border border-line-strong bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-line-strong bg-gray-50 p-5">
              <Icon size={20} className="text-brand" aria-hidden="true" />
              <span
                className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
                  ready
                    ? 'border-green-700 bg-green-50 text-green-800'
                    : 'border-amber-700 bg-amber-50 text-amber-800'
                }`}
              >
                {status}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="display text-2xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{detail}</p>
              <Link href={href} className="mt-auto inline-flex items-center gap-2 pt-8 text-xs font-semibold uppercase tracking-wider hover:text-brand">
                {action} <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 flex items-start gap-4 border border-line-strong bg-white p-6">
        {eventsReady && exposureReady ? (
          <ShieldCheck size={22} className="shrink-0 text-green-700" aria-hidden="true" />
        ) : (
          <TriangleAlert size={22} className="shrink-0 text-amber-700" aria-hidden="true" />
        )}
        <div>
          <h2 className="font-semibold">
            {eventsReady && exposureReady
              ? 'Core monitoring coverage is ready'
              : 'Coverage requires a connected wallet and available data sources'}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            Coverage means Stormline can display verified event windows beside canonical wallet
            exposure. It does not imply insurance, guaranteed protection, trade execution, or
            financial advice.
          </p>
        </div>
      </section>
    </>
  );
}