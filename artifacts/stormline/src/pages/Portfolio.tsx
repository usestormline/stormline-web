import { Link } from 'wouter';
import { useAppKitAccount, useAppKitNetwork, useWalletInfo } from '@reown/appkit/react';
import { useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { ExternalLink, Landmark, RefreshCw, Wallet, ArrowRight } from 'lucide-react';
import {
  getGetStockTokenPortfolioQueryKey,
  useGetStockTokenPortfolio,
  getGetEconomicCalendarQueryKey,
  useGetEconomicCalendar,
} from '@usestormline/api-client-react';
import { configuredRobinhoodChain } from '@/lib/chains';
import PageHead from '@/components/ui/PageHead';
import { dateKey, addUtcDays } from '@/lib/intelligence';

export default function Portfolio() {
  const { address } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { walletInfo } = useWalletInfo();

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: configuredRobinhoodChain.id,
    query: { enabled: !!address },
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

  const now = new Date();
  const calFrom = dateKey(now);
  const calTo = dateKey(addUtcDays(now, 14)); // 2 weeks ahead

  const calendar = useGetEconomicCalendar({ from: calFrom, to: calTo }, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey({ from: calFrom, to: calTo }),
      staleTime: 5 * 60 * 1000,
    }
  });

  const formattedBalance = balance
    ? Number(formatUnits(balance.value, balance.decimals)).toLocaleString('en-US', { maximumFractionDigits: 6 })
    : '0';

  const upcomingEvents = calendar.data?.events.filter(e => new Date(e.date) >= now) ?? [];

  return (
    <>
      <PageHead 
        eyebrow="ASSET OPERATIONS"
        title="Asset Management"
        sub="Manage verified wallet exposure, inspect canonical Stock Tokens, and move between trading, strategy, transfer, and dividend monitoring."
      />

      <nav aria-label="Asset management tools" className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/app/trading" className="flex min-h-12 items-center justify-between border border-line-strong bg-white px-4 text-sm font-semibold transition-colors hover:border-[#0000FF] hover:text-[#0000FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]">
          Trading Desk <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link href="/app/strategy" className="flex min-h-12 items-center justify-between border border-line-strong bg-white px-4 text-sm font-semibold transition-colors hover:border-[#0000FF] hover:text-[#0000FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]">
          Strategy Center <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link href="/app/dividend-access" className="flex min-h-12 items-center justify-between border border-line-strong bg-white px-4 text-sm font-semibold transition-colors hover:border-[#0000FF] hover:text-[#0000FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]">
          Dividend Monitor <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link href="/app/transfer" className="flex min-h-12 items-center justify-between border border-line-strong bg-white px-4 text-sm font-semibold transition-colors hover:border-[#0000FF] hover:text-[#0000FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]">
          Wallet Transfer <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <section className="border border-line-strong bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line-strong bg-gray-50 p-5">
            <div>
              <p className="eyebrow mb-1">Connected account</p>
              <h2 className="font-semibold">Native Network Status</h2>
            </div>
            <Wallet size={20} className="text-black" />
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <p className="eyebrow mb-2">Native Balance</p>
              <p className="display text-4xl">
                {!address ? 'Connect wallet' : balanceLoading ? 'Loading…' : balance ? `${formattedBalance} ${balance.symbol}` : 'Unavailable'}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-2">Network</p>
              <p className="text-lg font-semibold">{caipNetwork?.name ?? 'Unknown network'}</p>
              <p className="mt-1 text-sm text-muted">{walletInfo?.name ?? 'Connected wallet'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="eyebrow mb-2">Public address</p>
              <p className="break-all font-mono text-sm">{address ?? 'No wallet connected'}</p>
            </div>
          </div>
        </section>

        <aside className="border border-line-strong bg-white p-6 sm:p-8">
          <Landmark size={24} className="mb-6 text-black" />
          <p className="eyebrow mb-2">Canonical registry</p>
          <h2 className="display text-3xl">
            {stockTokens.data?.catalogCount ?? '—'} <span className="text-muted text-xl">Contracts</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Stormline indexes Robinhood's canonical registry. Unofficial tokens or classic brokerage positions without verified contracts are strictly excluded.
          </p>
          <a href="https://docs.robinhood.com/chain/contracts" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider hover:text-[#0000FF]">
            Verify registry <ExternalLink size={13} />
          </a>
        </aside>
      </div>

      <section className="border border-line-strong bg-white">
        <div className="flex flex-col gap-4 border-b border-line-strong bg-gray-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow mb-1">Robinhood Chain · {stockTokens.data?.chainId ?? configuredRobinhoodChain.id}</p>
            <h2 className="font-semibold text-lg">Verified Stock Token Positions</h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/app/transfer" className="btn btn-primary">
              Send Stock Tokens
            </Link>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted">
              <RefreshCw size={14} className={stockTokens.isFetching ? 'animate-spin' : ''} />
              {stockTokens.data
                ? `${stockTokens.data.status} · ${new Date(stockTokens.data.asOf).toLocaleTimeString('en-GB', { timeZone: 'UTC' })} UTC`
                : address ? 'Waiting for registry' : 'Connect wallet to index'}
            </div>
          </div>
        </div>

        {!address ? (
          <div className="p-10 border-t border-line text-center bg-[#fbfbfb]">
            <h3 className="display text-2xl mb-3">Connect to Unmask Exposure</h3>
            <p className="max-w-2xl mx-auto text-sm leading-relaxed text-muted mb-6">
              Connecting your wallet cross-references your balances against Robinhood&apos;s canonical contracts.
              Stormline maps upcoming geopolitical events directly to the specific tokens you hold, separating true vectors from noise.
            </p>
          </div>
        ) : stockTokens.isLoading ? (
          <div className="p-10 text-center text-sm text-muted">Reading canonical token balances…</div>
        ) : stockTokens.isError ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-lg">Stock Token data is temporarily unavailable.</p>
            <p className="mt-2 text-sm text-muted">Stormline could not verify the registry. No balance was estimated.</p>
          </div>
        ) : stockTokens.data?.holdings.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-lg">No canonical balance detected.</p>
            <p className="mt-3 max-w-2xl mx-auto text-sm leading-relaxed text-muted">
              This address has zero balance across the {stockTokens.data.catalogCount} active contracts on Robinhood Chain.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line-strong">
            {stockTokens.data?.holdings.map((holding) => {
               const catalysts = upcomingEvents.filter(
                 e =>
                   !e.needsTagging &&
                   e.affectedAssets?.some(a => a.address.toLowerCase() === holding.contractAddress.toLowerCase()),
               );

              return (
                <article key={holding.contractAddress} className="p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      {holding.logoUrl ? (
                        <img src={holding.logoUrl} alt="" className="h-12 w-12 border border-line-strong object-cover bg-white" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center border border-line-strong font-mono text-xs bg-gray-50">
                          {holding.symbol.slice(0, 3)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-xl truncate">{holding.symbol}</p>
                        <p className="truncate text-sm text-muted mt-1">{holding.name}</p>
                      </div>
                    </div>
                    <div className="md:text-right">
                      <p className="eyebrow mb-1">Effective balance</p>
                      <p className="font-mono text-lg">{holding.effectiveBalance}</p>
                    </div>
                    <div>
                      <a href={holding.explorerUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 border border-line-strong px-4 text-xs font-mono uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
                        Contract <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>

                  {catalysts.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-line border-dashed">
                      <p className="eyebrow mb-4 text-muted">Upcoming Mapped Catalysts</p>
                      <div className="grid gap-3">
                        {catalysts.map(c => (
                           <Link key={c.id} href={`/events/${c.id}?date=${encodeURIComponent(new Date(c.date).toISOString())}`} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm group p-3 border border-line bg-gray-50 hover:bg-white hover:border-black transition-colors">
                             <span className="font-mono text-xs text-muted w-28 shrink-0">{new Date(c.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })} UTC</span>
                             <span className="font-medium group-hover:text-[#0000FF] transition-colors">{c.title}</span>
                             <span className="font-mono text-[10px] uppercase border border-line-strong px-2 py-1 text-black bg-white ml-auto">
                               Storm {c.stormRating}
                             </span>
                           </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  );
}