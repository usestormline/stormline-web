import { useAppKit, useAppKitAccount, useAppKitNetwork, useWalletInfo } from '@reown/appkit/react';
import { useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { ChevronDown, TriangleAlert, Wallet } from 'lucide-react';
import { configuredRobinhoodChain } from '@/lib/chains';

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletNetworkStatus() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { walletInfo } = useWalletInfo();
  const { data: balance, isLoading } = useBalance({
    address: address as `0x${string}`,
    chainId: configuredRobinhoodChain.id,
    query: { enabled: isConnected && !!address && caipNetwork?.id === configuredRobinhoodChain.id },
  });

  if (!isConnected || !address) {
    return null;
  }

  const numericBalance = balance ? Number(formatUnits(balance.value, balance.decimals)) : null;
  const amount = numericBalance !== null
    ? numericBalance.toLocaleString('en-US', {
        maximumFractionDigits: 5,
      })
    : '0';
  const isCorrectNetwork = caipNetwork?.id === configuredRobinhoodChain.id;
  const hasLowGas = isCorrectNetwork && numericBalance !== null && numericBalance < 0.005;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={() => open({ view: 'Account' })}
        aria-label={`Connected wallet ${address} on ${caipNetwork?.name ?? 'unknown network'}`}
        className={`flex min-h-10 min-w-0 max-w-full items-center gap-3 border bg-white px-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
          isCorrectNetwork ? 'border-green-700' : 'border-red-700'
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-black text-white">
          <Wallet size={14} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted">
            <span
              className={`mr-1 inline-block h-2 w-2 rounded-full ${
                isCorrectNetwork ? 'bg-green-700' : 'bg-red-700'
              }`}
              aria-hidden="true"
            />
            {isCorrectNetwork ? 'Connected' : 'Wrong network'} ·{' '}
            {caipNetwork?.name ?? 'Unknown chain'}
          </span>
          <span className="block truncate text-xs font-semibold sm:text-sm">
            {!isCorrectNetwork
              ? configuredRobinhoodChain.name
              : isLoading
                ? 'Reading gas balance…'
                : `${amount} ETH`}
            <span className="ml-2 hidden font-mono text-[10px] font-normal text-muted md:inline">
              {shortenAddress(address)}
            </span>
          </span>
        </span>
        <ChevronDown size={14} className="shrink-0 text-muted" aria-hidden="true" />
      </button>
      {hasLowGas && (
        <div
          role="status"
          className="hidden max-w-44 items-center gap-2 border border-amber-700 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 sm:flex"
        >
          <TriangleAlert size={15} className="shrink-0" aria-hidden="true" />
          <span>Low ETH for gas on Robinhood Chain.</span>
        </div>
      )}
    </div>
  );
}