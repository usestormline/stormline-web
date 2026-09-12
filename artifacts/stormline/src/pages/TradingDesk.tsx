import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { 
  Search, Info, AlertTriangle, Save, Trash2,
  Activity, Globe, Zap, ExternalLink, ArrowRight, X
} from 'lucide-react';
import { 
  useGetStockTokenAssets, 
  getGetStockTokenAssetsQueryKey,
  useGetStockTokenMarketDetail,
  getGetStockTokenMarketDetailQueryKey
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';

const DRAFT_KEY = 'stormline_trading_draft_v1';

export default function TradingDesk() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [note, setNote] = useState('');

  const [draftStatus, setDraftStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Restore draft defensively
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') throw new Error('Invalid format');
      if (parsed.version !== 1) throw new Error('Unsupported version');
      
      if (typeof parsed.assetAddress === 'string') setSelectedAddress(parsed.assetAddress);
      if (parsed.side === 'Buy' || parsed.side === 'Sell') setSide(parsed.side);
      if (parsed.orderType === 'Market' || parsed.orderType === 'Limit') setOrderType(parsed.orderType);
      if (typeof parsed.quantity === 'string') setQuantity(parsed.quantity);
      if (typeof parsed.limitPrice === 'string') setLimitPrice(parsed.limitPrice);
      if (typeof parsed.note === 'string') setNote(parsed.note);
      
      setDraftStatus({ type: 'info', message: 'Draft restored from local storage.' });
      const timer = setTimeout(() => setDraftStatus(null), 3000);
      return () => clearTimeout(timer);
    } catch (err) {
      localStorage.removeItem(DRAFT_KEY);
      setDraftStatus({ type: 'error', message: 'Stored draft was invalid and has been removed.' });
      return undefined;
    }
  }, []);

  const handleSaveDraft = () => {
    try {
      const draft = {
        version: 1,
        assetAddress: selectedAddress,
        side,
        orderType,
        quantity,
        limitPrice,
        note
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftStatus({ type: 'success', message: 'Draft saved successfully.' });
      setTimeout(() => setDraftStatus(null), 3000);
    } catch (err) {
      setDraftStatus({ type: 'error', message: 'Failed to save draft to storage.' });
      setTimeout(() => setDraftStatus(null), 3000);
    }
  };

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setSelectedAddress('');
      setSide('Buy');
      setOrderType('Market');
      setQuantity('');
      setLimitPrice('');
      setNote('');
      setDraftStatus({ type: 'info', message: 'Draft cleared.' });
      setTimeout(() => setDraftStatus(null), 3000);
    } catch (err) {
      setDraftStatus({ type: 'error', message: 'Failed to clear draft.' });
    }
  };

  const assetsQuery = useGetStockTokenAssets({
    query: {
      queryKey: getGetStockTokenAssetsQueryKey(),
      staleTime: 5 * 60 * 1000,
    }
  });

  const marketDetailQuery = useGetStockTokenMarketDetail(selectedAddress || 'skip', {
    query: {
      queryKey: getGetStockTokenMarketDetailQueryKey(selectedAddress || 'skip'),
      enabled: Boolean(selectedAddress),
      staleTime: 60 * 1000,
    }
  });

  const filteredAssets = useMemo(() => {
    if (!assetsQuery.data?.assets) return [];
    const q = searchQuery.toLowerCase();
    return assetsQuery.data.assets.filter(a => 
      a.symbol.toLowerCase().includes(q) || 
      a.name.toLowerCase().includes(q) ||
      a.address.toLowerCase().includes(q)
    );
  }, [assetsQuery.data, searchQuery]);

  const selectedAsset = useMemo(() => {
    return assetsQuery.data?.assets?.find(a => a.address === selectedAddress);
  }, [assetsQuery.data, selectedAddress]);

  const parsedQuantity = parseFloat(quantity);
  const isQuantityValid = !isNaN(parsedQuantity) && parsedQuantity > 0;

  const parsedLimit = parseFloat(limitPrice);
  const isLimitValid = !isNaN(parsedLimit) && parsedLimit > 0;

  let notional: number | null = null;
  if (isQuantityValid) {
    if (orderType === 'Market' && marketDetailQuery.data?.price) {
      notional = parsedQuantity * marketDetailQuery.data.price;
    } else if (orderType === 'Limit' && isLimitValid) {
      notional = parsedQuantity * parsedLimit;
    }
  }

  const market = marketDetailQuery.data;

  return (
    <div className="pb-16 max-w-[1400px] mx-auto">
      <PageHead
        eyebrow="EXECUTION CAPABILITY"
        title="Trading Desk"
        sub="Prepare orders against verified canonical Robinhood Stock Tokens. Remote execution is currently disabled."
      />

      <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-line-strong pb-6 text-sm">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted flex items-center gap-2">
          Direct Navigation <ArrowRight size={12} aria-hidden="true" />
        </span>
        <Link href="/app/portfolio" className="text-black hover:text-[#0000FF] font-semibold border border-line-strong hover:border-[#0000FF] px-4 py-1.5 bg-white hover:bg-blue-50 transition-colors shadow-[2px_2px_0_var(--line-strong)] hover:shadow-[2px_2px_0_#0000FF]">
          Asset Management
        </Link>
        <Link href="/app/dividend-access" className="text-black hover:text-[#0000FF] font-semibold border border-line-strong hover:border-[#0000FF] px-4 py-1.5 bg-white hover:bg-blue-50 transition-colors shadow-[2px_2px_0_var(--line-strong)] hover:shadow-[2px_2px_0_#0000FF]">
          Dividend Monitor
        </Link>
        <Link href="/app/strategy" className="text-black hover:text-[#0000FF] font-semibold border border-line-strong hover:border-[#0000FF] px-4 py-1.5 bg-white hover:bg-blue-50 transition-colors shadow-[2px_2px_0_var(--line-strong)] hover:shadow-[2px_2px_0_#0000FF]">
          Strategy Center
        </Link>
      </div>

      <div className="grid min-w-0 gap-8 items-start lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* Left Column (Context) */}
        <div className="min-w-0 space-y-6">
          <div className="min-w-0 border border-line-strong bg-white shadow-sm">
            <div className="p-5 border-b border-line-strong bg-gray-50">
              <h2 className="font-semibold">Asset Selection</h2>
            </div>
            <div className="min-w-0 p-5">
              <div className="relative mb-4 min-w-0 w-full max-w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} aria-hidden="true" />
                <input 
                  type="search"
                  className="input w-full !pl-11 !pr-11 text-sm focus:border-black focus:ring-1 focus:ring-black" 
                  placeholder="Search canonical symbol or name..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search canonical assets"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]"
                    aria-label="Clear asset search"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
              
              <div className="h-[320px] min-w-0 w-full max-w-full overflow-x-hidden overflow-y-auto border border-line-strong divide-y divide-line-strong bg-[#fbfbfb]">
                {assetsQuery.isLoading && (
                  <div className="p-8 text-sm text-muted text-center flex flex-col items-center">
                    <Activity className="animate-pulse mb-3 text-[#0000FF]" size={24} aria-hidden="true" />
                    Loading assets...
                  </div>
                )}
                {assetsQuery.isError && (
                  <div className="p-8 text-sm text-red-700 text-center flex flex-col items-center bg-red-50">
                    <AlertTriangle className="mb-3 text-red-600" size={24} aria-hidden="true" />
                    Failed to load canonical assets.
                  </div>
                )}
                
                {assetsQuery.data?.assets && filteredAssets.length === 0 && (
                  <div className="p-8 text-sm text-muted text-center">
                    No matching canonical assets found.
                  </div>
                )}
                
                {filteredAssets.map(asset => {
                  const isSelected = selectedAddress === asset.address;
                  return (
                    <button 
                      type="button"
                      key={asset.address}
                      onClick={() => setSelectedAddress(asset.address)}
                      className={`flex min-w-0 w-full max-w-full items-center justify-between px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:bg-gray-200 ${isSelected ? 'bg-black text-white' : 'hover:bg-gray-100 text-black bg-white'}`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex min-w-0 items-center gap-3 pr-3">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border p-1 ${
                          isSelected ? 'border-white bg-white' : 'border-black bg-black'
                        }`}>
                          <img
                            src={`https://images.financialmodelingprep.com/symbol/${encodeURIComponent(asset.symbol)}.png`}
                            alt={`${asset.name} logo`}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={event => {
                              event.currentTarget.parentElement?.classList.add('hidden');
                            }}
                          />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-semibold leading-none mb-1">{asset.symbol}</div>
                          <div className={`truncate text-xs ${isSelected ? 'text-gray-400' : 'text-muted'}`}>{asset.name}</div>
                        </div>
                      </div>
                      <div className={`text-[10px] font-mono uppercase tracking-wider shrink-0 ${isSelected ? 'text-gray-400' : 'text-muted'}`}>
                        {asset.currentMultiplier !== '1' ? 'Adj' : 'Std'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border border-line-strong bg-white shadow-sm">
            <div className="p-5 border-b border-line-strong bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold">Market Detail</h2>
              {selectedAsset && (
                <span className="font-mono text-[10px] font-bold px-2 py-1 border border-line-strong bg-white uppercase tracking-wider">
                  {selectedAsset.symbol}
                </span>
              )}
            </div>
            
            {!selectedAddress ? (
              <div className="p-10 text-center text-muted text-sm border-b border-transparent">
                Select an asset to view market context.
              </div>
            ) : marketDetailQuery.isLoading ? (
              <div className="p-10 text-center text-muted text-sm flex flex-col items-center">
                <Activity className="animate-pulse mb-3 text-[#0000FF]" size={24} aria-hidden="true" />
                Fetching latest quote...
              </div>
            ) : marketDetailQuery.isError ? (
              <div className="p-10 text-center text-red-700 text-sm flex flex-col items-center bg-red-50">
                <AlertTriangle className="mb-3 text-red-600" size={24} aria-hidden="true" />
                Market detail unavailable.
              </div>
            ) : market ? (
              <div className="p-5 space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="eyebrow mb-1 text-muted">Last Price</div>
                    <div className="display text-3xl font-semibold tracking-tight">
                      ${market.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="eyebrow mb-1 text-muted">24h Change</div>
                    <div className={`font-mono text-lg font-medium ${(market.change ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {(market.change ?? 0) >= 0 ? '+' : ''}{market.change?.toFixed(2) ?? '—'} ({market.changePercent?.toFixed(2) ?? '—'}%)
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-line-strong pt-4 text-sm">
                  <div>
                    <div className="eyebrow mb-1 text-muted">Currency</div>
                    <div className="font-medium">{market.currency || 'USD'}</div>
                  </div>
                  <div>
                     <div className="eyebrow mb-1 text-muted">Data Provider</div>
                     <div className="font-medium break-words">{market.provider || 'Unavailable'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="eyebrow mb-1 text-muted">Quote Updated</div>
                    <div className="font-mono text-xs text-black bg-gray-50 border border-line-strong p-2 inline-block">
                      {new Date(market.quoteUpdatedAt).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'medium' })} UTC
                    </div>
                  </div>
                </div>
                
                <div className="-mx-5 -mb-5 flex min-w-0 flex-col gap-3 border-t border-line-strong bg-gray-50 p-5">
                  <div className="min-w-0">
                    <div className="eyebrow mb-1 text-muted">Canonical Contract</div>
                    <div className="break-all font-mono text-[10px] text-black">
                      {market.contractAddress}
                    </div>
                  </div>
                  <a href={market.explorerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 self-start font-mono text-[10px] font-bold uppercase tracking-wider text-[#0000FF] transition-colors hover:text-[#000099] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2">
                    Explorer <ExternalLink size={10} aria-hidden="true" />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column (Ticket) */}
        <div className="border border-line-strong bg-white shadow-sm relative">
          <div className="p-5 border-b border-line-strong bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="font-semibold flex items-center gap-2">Order Ticket</h2>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={handleSaveDraft} 
                className="btn btn-dark text-xs px-3 py-1.5 h-8 flex items-center bg-black text-white hover:bg-gray-800 transition-colors shadow-[2px_2px_0_var(--line-strong)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--line-strong)]"
              >
                <Save size={14} className="mr-1.5" aria-hidden="true" /> Save Draft
              </button>
              <button 
                type="button"
                onClick={handleClearDraft} 
                className="btn btn-outline text-xs px-3 py-1.5 h-8 flex items-center text-red-700 border-red-700 hover:bg-red-700 hover:text-white transition-colors"
              >
                <Trash2 size={14} className="mr-1.5" aria-hidden="true" /> Clear
              </button>
            </div>
          </div>
          
          {draftStatus && (
            <div className={`px-5 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider border-b border-line-strong flex items-center justify-between transition-colors ${
              draftStatus.type === 'success' ? 'bg-green-100 text-green-900 border-green-200' :
              draftStatus.type === 'error' ? 'bg-red-100 text-red-900 border-red-200' :
              'bg-blue-100 text-blue-900 border-blue-200'
            }`} role="alert">
              <div className="flex items-center gap-2">
                {draftStatus.type === 'error' && <AlertTriangle size={14} aria-hidden="true" />}
                {draftStatus.type === 'success' && <Globe size={14} aria-hidden="true" />}
                {draftStatus.type === 'info' && <Info size={14} aria-hidden="true" />}
                {draftStatus.message}
              </div>
              <button type="button" onClick={() => setDraftStatus(null)} className="opacity-50 hover:opacity-100 p-1" aria-label="Dismiss message">
                &times;
              </button>
            </div>
          )}

          <div className="p-6 md:p-8 space-y-8">
            <div>
              <label className="eyebrow block mb-3 text-black">Action</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  className={`p-4 border text-center font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2 ${side === 'Buy' ? 'bg-[#0000FF] text-white border-[#0000FF] shadow-[4px_4px_0_#000]' : 'bg-white text-black border-line-strong hover:border-black hover:shadow-[4px_4px_0_#000]'}`}
                  onClick={() => setSide('Buy')}
                  aria-pressed={side === 'Buy'}
                >
                  Buy
                </button>
                <button 
                  type="button"
                  className={`p-4 border text-center font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF] focus-visible:ring-offset-2 ${side === 'Sell' ? 'bg-black text-white border-black shadow-[4px_4px_0_#0000FF]' : 'bg-white text-black border-line-strong hover:border-black hover:shadow-[4px_4px_0_#000]'}`}
                  onClick={() => setSide('Sell')}
                  aria-pressed={side === 'Sell'}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="eyebrow block mb-3 text-black">Order Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  className={`p-3 border text-center font-mono text-sm uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${orderType === 'Market' ? 'bg-gray-200 text-black border-black font-bold' : 'bg-white text-black border-line-strong hover:border-black hover:bg-gray-50'}`}
                  onClick={() => setOrderType('Market')}
                  aria-pressed={orderType === 'Market'}
                >
                  Market
                </button>
                <button 
                  type="button"
                  className={`p-3 border text-center font-mono text-sm uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${orderType === 'Limit' ? 'bg-gray-200 text-black border-black font-bold' : 'bg-white text-black border-line-strong hover:border-black hover:bg-gray-50'}`}
                  onClick={() => setOrderType('Limit')}
                  aria-pressed={orderType === 'Limit'}
                >
                  Limit
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="eyebrow block mb-2 text-black" htmlFor="qty-input">Quantity (Tokens)</label>
                <input 
                  id="qty-input"
                  type="number" 
                  min="0" 
                  step="any"
                  className="input font-mono text-lg p-3 bg-gray-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black" 
                  placeholder="0.00"
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)} 
                />
              </div>
              
              <div className={`transition-opacity duration-300 ${orderType === 'Limit' ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="eyebrow block mb-2 text-black" htmlFor="limit-input">Limit Price (USD)</label>
                <input 
                  id="limit-input"
                  type="number" 
                  min="0" 
                  step="any"
                  className="input font-mono text-lg p-3 bg-gray-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black" 
                  placeholder="0.00"
                  value={limitPrice} 
                  onChange={e => setLimitPrice(e.target.value)}
                  disabled={orderType !== 'Limit'}
                />
              </div>
            </div>

            <div>
              <label className="eyebrow block mb-2 text-black" htmlFor="note-input">Order Note (Optional)</label>
              <textarea 
                id="note-input"
                className="input text-sm resize-y bg-gray-50 focus:bg-white focus:border-black focus:ring-1 focus:ring-black leading-relaxed" 
                rows={2} 
                placeholder="Rationale, strategy reference, or context..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <div className="p-5 bg-gray-50 border border-line-strong border-dashed">
              <strong className="block mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
                Ticket Review
              </strong>
              {(!selectedAsset || !isQuantityValid || (orderType === 'Limit' && !isLimitValid)) ? (
                <div className="text-sm text-muted">
                  Complete the ticket to review your proposed order details.
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-black">
                  Preparing to <strong className={side === 'Buy' ? 'text-[#0000FF]' : 'text-black'}>{side.toUpperCase()}</strong>{' '}
                  <strong>{parsedQuantity}</strong> tokens of <strong>{selectedAsset.symbol}</strong>{' '}
                  using a <strong>{orderType.toUpperCase()}</strong> order
                  {orderType === 'Limit' ? ` at a limit price of $${parsedLimit.toFixed(2)}` : ''}.
                </div>
              )}
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="eyebrow text-black">Indicative Notional</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted">USD</span>
              </div>
              <div className="display text-4xl font-bold tracking-tight">
                {notional !== null ? `$${notional.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
              </div>
              {orderType === 'Market' && market?.price && isQuantityValid && (
                <div className="mt-3 text-[10px] text-muted font-mono bg-gray-50 border border-line-strong px-2 py-1.5 inline-block">
                  {parsedQuantity} × ${market.price.toFixed(2)} (Last Quote)
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-line-strong">
              <button 
                type="button"
                disabled 
                className="w-full bg-black text-white p-5 flex items-center justify-center opacity-60 cursor-not-allowed border border-black transition-colors"
                aria-disabled="true"
              >
                <span className="font-bold text-lg uppercase tracking-widest flex items-center gap-2">
                  Coming Soon <Zap size={18} aria-hidden="true" />
                </span>
              </button>
              <p className="mt-4 text-xs text-center text-muted max-w-md mx-auto leading-relaxed px-4">
                This interface is a frontend-first demonstration of the trading desk capability. Order routing, execution, and remote persistence are disabled pending backend integration. No order will be submitted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
