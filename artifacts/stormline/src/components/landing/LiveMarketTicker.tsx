import { Link } from 'wouter';
import {
  getGetStockTokenAssetsQueryKey,
  getGetStockTokenMarketDetailQueryKey,
  useGetStockTokenAssets,
  useGetStockTokenMarketDetail,
} from '@usestormline/api-client-react';

const TICKER_SYMBOLS = ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA'];

type TickerAsset = {
  address: string;
  symbol: string;
  name: string;
};

function MarketTickerItem({ asset }: { asset: TickerAsset }) {
  const quote = useGetStockTokenMarketDetail(asset.address, {
    query: {
      queryKey: getGetStockTokenMarketDetailQueryKey(asset.address),
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
      retry: 1,
    },
  });

  const data = quote.data;
  const isPositive = (data?.change ?? 0) >= 0;

  return (
    <Link
      href="/app/trading"
      className="mx-2 flex min-w-max items-center gap-3 border-r border-[#333] px-5 py-1 text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000FF]"
      aria-label={data
        ? `${asset.name}, ${data.price.toFixed(2)} ${data.currency ?? 'USD'}, ${isPositive ? 'up' : 'down'} ${Math.abs(data.changePercent ?? 0).toFixed(2)} percent`
        : `${asset.name}, quote loading`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-black p-1">
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
      <span className="font-mono text-xs font-bold tracking-wider">{asset.symbol}</span>
      {quote.isLoading ? (
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#777]">Loading quote…</span>
      ) : quote.isError || !data ? (
        <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">Unavailable</span>
      ) : (
        <>
          <span className="font-mono text-sm font-semibold">
            {data.currency === 'USD' || !data.currency ? '$' : ''}
            {data.price.toFixed(2)}
          </span>
          <span className={`font-mono text-xs font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '▲' : '▼'} {Math.abs(data.change ?? 0).toFixed(2)} ({Math.abs(data.changePercent ?? 0).toFixed(2)}%)
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#777]">
            {new Date(data.quoteUpdatedAt).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC',
            })} UTC
          </span>
        </>
      )}
    </Link>
  );
}

export default function LiveMarketTicker() {
  const assets = useGetStockTokenAssets({
    query: {
      queryKey: getGetStockTokenAssetsQueryKey(),
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  });

  const tickerAssets = TICKER_SYMBOLS.flatMap(symbol => {
    const asset = assets.data?.assets.find(candidate => candidate.symbol === symbol);
    return asset ? [{ address: asset.address, symbol: asset.symbol, name: asset.name }] : [];
  });

  if (assets.isLoading) {
    return (
      <div className="border-y border-[#222] bg-[#0a0a0a] px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-[#777]">
        Synchronizing canonical market quotes…
      </div>
    );
  }

  if (assets.isError || tickerAssets.length === 0) {
    return (
      <div className="border-y border-[#222] bg-[#0a0a0a] px-5 py-4 font-mono text-[10px] uppercase tracking-widest text-amber-400">
        Live market ticker unavailable
      </div>
    );
  }

  return (
    <section aria-label="Live canonical Stock Token market ticker" className="overflow-hidden border-y border-[#222] bg-[#0a0a0a] py-2">
      <div className="flex w-max whitespace-nowrap font-mono hover:[animation-play-state:paused] motion-safe:animate-[marketTicker_42s_linear_infinite]">
        {[0, 1, 2].map(repetition => (
          <div key={repetition} className="flex items-center" aria-hidden={repetition > 0}>
            {tickerAssets.map(asset => (
              <MarketTickerItem key={`${repetition}-${asset.address}`} asset={asset} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}