import { useMemo, useState } from 'react';
import { useGetStockTokenAssets, getGetStockTokenAssetsQueryKey } from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';
import { Search, ExternalLink, Info, Filter, Activity, AlertCircle, Building2 } from 'lucide-react';

const filterModes = ['all', 'adjusted', 'standard'] as const;
type FilterMode = (typeof filterModes)[number];

function truncateAddress(address: string) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function companyLogoUrl(symbol: string) {
  return `https://images.financialmodelingprep.com/symbol/${encodeURIComponent(symbol)}.png`;
}

function hasMultiplierAdjustment(multiplier: string | undefined) {
  if (!multiplier) return false;
  const value = Number(multiplier);
  return Number.isFinite(value) && value !== 1;
}

function formatMultiplier(multiplier: string) {
  const value = Number(multiplier);
  if (!Number.isFinite(value)) return multiplier;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
    useGrouping: false,
  });
}

export default function DividendAccess() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const { data, isLoading, isError } = useGetStockTokenAssets({
    query: {
      queryKey: getGetStockTokenAssetsQueryKey(),
      staleTime: 5 * 60 * 1000,
    }
  });

  const filteredAssets = useMemo(() => {
    if (!data?.assets) return [];

    let result = data.assets;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        a =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.address.toLowerCase().includes(q)
      );
    }

    if (filterMode === 'adjusted') {
      result = result.filter(a => hasMultiplierAdjustment(a.currentMultiplier));
    } else if (filterMode === 'standard') {
      result = result.filter(a => !hasMultiplierAdjustment(a.currentMultiplier));
    }

    return result;
  }, [data, searchQuery, filterMode]);
  const adjustedCount = data?.assets.filter(asset => hasMultiplierAdjustment(asset.currentMultiplier)).length ?? 0;

  return (
    <>
      <PageHead
        eyebrow="CORPORATE ACTIONS"
        title="Multiplier Terminal"
        sub="Inspect canonical Stock Token multipliers to identify verified corporate-action accrual adjustments."
        action={
          <span className="inline-flex min-h-10 items-center border border-[#0000FF] bg-blue-50 px-4 font-mono text-xs font-semibold uppercase tracking-wider text-[#0000FF]">
            Live Feed
          </span>
        }
      />

      <div className="mb-8 border border-black bg-black text-white p-6 md:p-8">
        <div className="flex items-start gap-4">
          <Info className="shrink-0 mt-0.5 text-[#0000FF]" size={22} aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wide mb-2">Accrual Mechanism</h2>
            <p className="text-sm leading-relaxed text-gray-300 max-w-4xl">
              Robinhood dividend accrual is normally reflected through <code className="bg-[#111] px-1.5 py-0.5 border border-gray-800 text-xs font-mono">uiMultiplier</code> / shares-per-token adjustments rather than a wallet crypto payout. A multiplier deviating from 1 indicates a confirmed structural change, typically a corporate action (such as a split or dividend), though the specific event must be verified separately. No claiming, staking, or deposits are required to maintain proportional value.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-line-strong bg-white">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search symbol, name, or contract..."
            className="w-full pl-9 pr-4 py-2 border border-line-strong text-sm focus-visible:outline-none focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black transition-colors"
            aria-label="Search assets"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={16} className="text-muted shrink-0" aria-hidden="true" />
          <select
            value={filterMode}
            onChange={event => {
              const value = event.target.value;
              if (filterModes.includes(value as FilterMode)) setFilterMode(value as FilterMode);
            }}
            className="w-full sm:w-auto border border-line-strong text-sm py-2 px-3 pr-8 bg-white focus-visible:outline-none focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black cursor-pointer"
            aria-label="Filter assets by adjustment status"
          >
            <option value="all">All Assets</option>
            <option value="adjusted">Adjusted (Multiplier ≠ 1)</option>
            <option value="standard">Standard (Multiplier = 1)</option>
          </select>
        </div>
      </div>

      {data && (
        <dl className="mb-6 grid border border-line-strong bg-white sm:grid-cols-3">
          <div className="border-b border-line-strong p-4 sm:border-b-0 sm:border-r">
            <dt className="eyebrow mb-1">Canonical Assets</dt>
            <dd className="font-mono text-xl font-semibold">{data.assets.length}</dd>
          </div>
          <div className="border-b border-line-strong p-4 sm:border-b-0 sm:border-r">
            <dt className="eyebrow mb-1">Adjusted Multipliers</dt>
            <dd className="font-mono text-xl font-semibold text-[#0000FF]">{adjustedCount}</dd>
          </div>
          <div className="p-4">
            <dt className="eyebrow mb-1">Registry Snapshot</dt>
            <dd className="font-mono text-xs font-semibold">
              {new Date(data.asOf).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
            </dd>
          </div>
        </dl>
      )}

      {isLoading ? (
        <div className="border border-line-strong bg-white p-16 flex flex-col items-center justify-center text-muted">
          <Activity className="animate-pulse mb-4 text-[#0000FF]" size={32} aria-hidden="true" />
          <p className="font-mono text-sm uppercase tracking-widest">Loading registry feed...</p>
        </div>
      ) : isError ? (
        <div className="border border-red-800 bg-red-50 p-12 flex flex-col items-center justify-center text-red-900">
          <AlertCircle className="mb-4 text-red-700" size={32} aria-hidden="true" />
          <p className="font-semibold text-lg mb-2">Terminal Offline</p>
          <p className="text-sm">Unable to connect to the canonical registry feed. Please try again later.</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="border border-line-strong bg-white p-16 flex flex-col items-center justify-center text-muted">
          <Building2 className="mb-4 text-gray-300" size={32} aria-hidden="true" />
          <p className="text-lg font-semibold text-black mb-2">No matching assets</p>
          <p className="text-sm">Adjust your search or filter settings to see results.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto border border-line-strong bg-white">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-line-strong text-xs uppercase tracking-wider text-muted font-mono">
                <tr>
                  <th className="px-5 py-4 font-medium">Asset</th>
                  <th className="px-5 py-4 font-medium">Identifiers</th>
                  <th className="px-5 py-4 font-medium text-right">Multiplier</th>
                  <th className="px-5 py-4 font-medium">Status / Adjustment</th>
                  <th className="px-5 py-4 font-medium text-right">Chain Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-strong">
                {filteredAssets.map(asset => {
                  const mult = asset.currentMultiplier ?? 'Unavailable';
                  const isAdjusted = hasMultiplierAdjustment(mult);

                  return (
                    <tr key={asset.address} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={companyLogoUrl(asset.symbol)}
                            alt={`${asset.name} logo`}
                            className="h-8 w-8 rounded-full border border-line-strong bg-black object-contain"
                            onError={event => {
                              event.currentTarget.hidden = true;
                            }}
                          />
                          <div>
                            <p className="font-semibold text-black">{asset.symbol}</p>
                            <p className="text-xs text-muted max-w-[200px] truncate" title={asset.name}>{asset.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs text-muted" title="Contract Address">{truncateAddress(asset.address)}</span>
                          {asset.isin ? (
                            <span className="text-xs text-black" title="ISIN">{asset.isin}</span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No ISIN</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-mono font-medium ${isAdjusted ? 'text-[#0000FF] bg-blue-50 px-2 py-1 border border-blue-200' : 'text-black'}`}>
                          <span title={mult}>{formatMultiplier(mult)}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isAdjusted ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-[#0000FF]" aria-hidden="true"></span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#0000FF]">Corporate Action</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted">
                            <span className="inline-block w-2 h-2 bg-gray-300" aria-hidden="true"></span>
                            <span className="text-xs font-medium uppercase tracking-wider">Standard</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={asset.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-black hover:text-[#0000FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2 transition-colors text-xs font-semibold uppercase tracking-wider"
                          aria-label={`View ${asset.symbol} on block explorer`}
                        >
                          Explorer <ExternalLink size={14} aria-hidden="true" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-4">
            {filteredAssets.map(asset => {
              const mult = asset.currentMultiplier ?? 'Unavailable';
              const isAdjusted = hasMultiplierAdjustment(mult);

              return (
                <article key={asset.address} className="border border-line-strong bg-white p-5 relative overflow-hidden">
                  {isAdjusted && (
                    <div className="absolute top-0 right-0 w-1 h-full bg-[#0000FF]" aria-hidden="true" />
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={companyLogoUrl(asset.symbol)}
                        alt={`${asset.name} logo`}
                        className="h-10 w-10 rounded-full border border-line-strong bg-black object-contain"
                        onError={event => {
                          event.currentTarget.hidden = true;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg leading-none">{asset.symbol}</h3>
                        <p className="text-sm text-muted mt-1">{asset.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-line-strong">
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wider font-mono mb-1">Multiplier</p>
                      <p
                        className={`font-mono text-lg ${isAdjusted ? 'text-[#0000FF] font-semibold' : 'text-black'}`}
                        title={mult}
                      >
                        {formatMultiplier(mult)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted uppercase tracking-wider font-mono mb-1">Adjustment</p>
                      {isAdjusted ? (
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0000FF]">Corporate Action</span>
                      ) : (
                        <span className="text-xs font-medium uppercase tracking-wider text-muted">Standard</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-line-strong">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-muted">{truncateAddress(asset.address)}</span>
                      {asset.isin ? (
                        <span className="text-[10px] font-medium text-black">ISIN: {asset.isin}</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No ISIN</span>
                      )}
                    </div>
                    <a
                      href={asset.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 border border-line-strong text-black hover:text-[#0000FF] hover:border-[#0000FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2 transition-colors"
                      aria-label={`View ${asset.symbol} on block explorer`}
                    >
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
