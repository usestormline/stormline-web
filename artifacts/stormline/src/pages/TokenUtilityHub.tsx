import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ExternalLink, ShieldAlert, CheckCircle2, ChevronRight, Activity, Wallet, FileText, Search } from 'lucide-react';
import {
  getGetEconomicCalendarQueryKey,
  getGetStockTokenAssetsQueryKey,
  getGetStockTokenRegistryQueryKey,
  useGetEconomicCalendar,
  useGetStockTokenAssets,
  useGetStockTokenRegistry,
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';
import { dateKey, addUtcDays } from '@/lib/intelligence';

export default function TokenUtilityHub() {
  const [contractQuery, setContractQuery] = useState('');
  const registry = useGetStockTokenRegistry({
    query: {
      queryKey: getGetStockTokenRegistryQueryKey(),
      staleTime: 5 * 60 * 1000,
    }
  });
  const assetCatalog = useGetStockTokenAssets({
    query: {
      queryKey: getGetStockTokenAssetsQueryKey(),
      staleTime: 5 * 60 * 1000,
    },
  });

  const now = new Date();
  const calFrom = dateKey(now);
  const calTo = dateKey(addUtcDays(now, 14));
  const calendar = useGetEconomicCalendar({ from: calFrom, to: calTo }, {
    query: {
      queryKey: getGetEconomicCalendarQueryKey({ from: calFrom, to: calTo }),
      staleTime: 5 * 60 * 1000,
    }
  });

  const totalEvents = calendar.data?.events.length ?? 0;
  const mappedEvents = calendar.data?.events.filter(e => !e.needsTagging && e.affectedAssets && e.affectedAssets.length > 0).length ?? 0;
  const needsTaggingEvents = calendar.data?.events.filter(e => e.needsTagging).length ?? 0;
  const normalizedContractQuery = contractQuery.trim().toLowerCase();
  const matchingAssets = useMemo(() => {
    if (!normalizedContractQuery || !assetCatalog.data) return [];
    return assetCatalog.data.assets
      .filter(asset =>
        asset.symbol.toLowerCase().includes(normalizedContractQuery) ||
        asset.name.toLowerCase().includes(normalizedContractQuery) ||
        asset.address.toLowerCase() === normalizedContractQuery,
      )
      .slice(0, 8);
  }, [assetCatalog.data, normalizedContractQuery]);

  return (
    <>
      <PageHead
        eyebrow="TOKEN UTILITY & TOOLS"
        title="Token Utility Console"
        sub="These are the tools currently live. Use this console to interact with Robinhood Chain canonical assets securely and directly."
      />

      {/* Notice & Summary */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <section className="border border-line-strong bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-black" size={20} />
            <h2 className="font-semibold text-lg">Live Capability Summary</h2>
          </div>
          <ul className="space-y-3 text-sm text-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Direct reads of public Robinhood Chain ERC-20 balances.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Cross-referencing against Robinhood&apos;s canonical registry.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Self-custody ERC-20 token transfers requiring manual wallet signatures.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Geopolitical event-to-token impact scanning.</span>
            </li>
          </ul>
        </section>

        <section className="border border-black bg-black text-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-white" size={20} />
            <h2 className="font-semibold text-lg uppercase tracking-wide text-white">Not Automatic</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Stormline is an intelligence and utility console. It does not execute actions without your explicit approval.
          </p>
          <ul className="space-y-2 text-sm text-gray-400 font-mono text-xs uppercase tracking-wider">
            <li>• No automated swaps</li>
            <li>• No bridging between chains</li>
            <li>• No auto-trading</li>
            <li>• No custody of user assets</li>
            <li>• No fake protection execution</li>
          </ul>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tool 1 */}
        <article className="border border-line-strong bg-white flex flex-col">
          <div className="p-6 flex-1">
            <Wallet size={24} className="mb-4 text-black" />
            <h3 className="display text-2xl mb-2">Wallet Exposure Scanner</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Read public wallet balances against verified canonical contracts and map geopolitical catalysts to your holdings.
            </p>
            
            <div className="space-y-4 text-sm bg-gray-50 border border-line-strong p-4 mb-6">
              <p className="font-semibold">Step-by-step usage:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted">
                <li>Connect your Web3 wallet</li>
                <li>Switch to configured Robinhood Chain</li>
                <li>Scan nonzero ERC-20 balances against the official canonical registry</li>
                <li>Inspect upcoming mapped event catalysts</li>
              </ol>
              <div className="mt-4 text-xs font-mono text-black border-t border-line-strong pt-3">
                Requirement: Reads public wallet balances. Never asks for custody.
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-line-strong bg-gray-50 mt-auto">
            <Link href="/app/portfolio" className="btn btn-primary w-full justify-between">
              Open Exposure Scanner <ChevronRight size={16} />
            </Link>
          </div>
        </article>

        {/* Tool 2 */}
        <article className="border border-line-strong bg-white flex flex-col">
          <div className="p-6 flex-1">
            <FileText size={24} className="mb-4 text-black" />
            <h3 className="display text-2xl mb-2">Canonical Contract Verification</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Verify Stock Token validity against the canonical Robinhood registry to ensure authenticity.
            </p>
            
            <div className="space-y-4 text-sm bg-gray-50 border border-line-strong p-4 mb-6">
              <p className="font-semibold">Step-by-step usage:</p>
              <label htmlFor="canonical-contract-query" className="block font-semibold">
                Enter symbol, name, or complete contract address
              </label>
              <input
                id="canonical-contract-query"
                type="search"
                value={contractQuery}
                onChange={event => setContractQuery(event.target.value)}
                placeholder="Example: SPY or 0x..."
                className="input h-12 w-full bg-white"
              />
              <div className="mt-4 text-xs font-mono text-black border-t border-line-strong pt-3 flex flex-col gap-1">
                {assetCatalog.isLoading || registry.isLoading ? (
                  <span>Loading canonical contract catalog...</span>
                ) : assetCatalog.isError || registry.isError ? (
                  <span className="text-red-700">Canonical catalog unavailable. Do not trust an unverified contract.</span>
                ) : (
                  <>
                    <span>Status: {registry.data?.canonicalAssetCount} Canonical Assets</span>
                    <span>Chain: {registry.data?.chainName} ({registry.data?.chainId})</span>
                    <span>Usable/Price-ready: {registry.data?.usableAssetCount}</span>
                  </>
                )}
              </div>
              {normalizedContractQuery && !assetCatalog.isLoading && !assetCatalog.isError && (
                <div className="mt-4" aria-live="polite">
                  {matchingAssets.length === 0 ? (
                    <div className="border border-red-700 bg-red-50 p-3 text-sm text-red-800">
                      <strong className="block uppercase">Not in canonical registry</strong>
                      Reject this token on chain {assetCatalog.data?.chainId}. Check the complete address and network.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {matchingAssets.map(asset => (
                        <article key={asset.address} className="border border-line-strong bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold">
                                {asset.symbol} <span className="text-green-700">Canonical</span>
                              </p>
                              <p className="truncate text-xs text-muted">{asset.name}</p>
                            </div>
                            <a
                              href={asset.explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="shrink-0 text-xs font-semibold underline"
                            >
                              Explorer
                            </a>
                          </div>
                          <p className="mt-2 break-all font-mono text-[10px]">{asset.address}</p>
                          <p className="mt-2 text-[10px] uppercase text-muted">
                            Chain {assetCatalog.data?.chainId} · {asset.priceReady ? 'Price-ready' : 'Price feed not configured'}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="p-4 border-t border-line-strong bg-gray-50 mt-auto flex flex-col gap-2">
            <a href="https://docs.robinhood.com/chain/contracts" target="_blank" rel="noreferrer" className="btn btn-outline w-full justify-between bg-white">
              Official Robinhood Docs <ExternalLink size={14} />
            </a>
          </div>
        </article>

        {/* Tool 3 */}
        <article className="border border-line-strong bg-white flex flex-col">
          <div className="p-6 flex-1">
            <Activity size={24} className="mb-4 text-black" />
            <h3 className="display text-2xl mb-2">Send Stock Tokens</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Execute standard ERC-20 transfers for your canonical assets directly on Robinhood Chain.
            </p>
            
            <div className="space-y-4 text-sm bg-gray-50 border border-line-strong p-4 mb-6">
              <p className="font-semibold">Step-by-step usage:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted">
                <li>Connect your wallet</li>
                <li>Select only a verified nonzero holding</li>
                <li>Enter recipient address and amount</li>
                <li>Review bound sender, chain, contract, and amount</li>
                <li>Sign transaction in wallet and wait for receipt</li>
              </ol>
              <div className="mt-4 text-xs font-mono text-black border-t border-line-strong pt-3">
                Notice: Stormline never signs automatically. Manual signature required.
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-line-strong bg-gray-50 mt-auto">
            <Link href="/app/transfer" className="btn btn-primary w-full justify-between">
              Open Transfer Tool <ChevronRight size={16} />
            </Link>
          </div>
        </article>

        {/* Tool 4 */}
        <article className="border border-line-strong bg-white flex flex-col">
          <div className="p-6 flex-1">
            <Search size={24} className="mb-4 text-black" />
            <h3 className="display text-2xl mb-2">Event-to-Token Impact Scanner</h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Discover which verified macro and geopolitical events intersect with specific canonical assets.
            </p>
            
            <div className="space-y-4 text-sm bg-gray-50 border border-line-strong p-4 mb-6">
              <p className="font-semibold">Step-by-step usage:</p>
              <ol className="list-decimal list-inside space-y-2 text-muted">
                <li>Inspect upcoming mapped events</li>
                <li>Open rationale and sensitivity analysis</li>
                <li>Connect wallet to mark contract intersections with your holdings</li>
                <li>Open event brief for detailed geopolitical context</li>
              </ol>
              <div className="mt-4 text-xs font-mono text-black border-t border-line-strong pt-3 flex flex-col gap-1">
                {calendar.isLoading ? (
                  <span>Scanning 14-day calendar...</span>
                ) : calendar.isError ? (
                  <span className="text-red-600">Failed to load calendar events.</span>
                ) : (
                  <>
                    <span>14-Day Window Events: {totalEvents}</span>
                    <span>Mapped to Assets: {mappedEvents}</span>
                    <span>Pending Tagging: {needsTaggingEvents}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-line-strong bg-gray-50 mt-auto">
            <Link href="/market-impact" className="btn btn-primary w-full justify-between">
              Open Impact Scanner <ChevronRight size={16} />
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
