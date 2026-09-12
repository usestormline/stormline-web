import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Wallet } from 'lucide-react';

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function WalletButton({ compact = false }: { compact?: boolean }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const label = isConnected && address
    ? shortenAddress(address)
    : compact
      ? 'Connect'
      : 'Connect Wallet';

  return (
    <button
      type="button"
      onClick={() => open({ view: isConnected ? 'Account' : 'Connect' })}
      aria-label={isConnected && address ? `Wallet connected: ${address}` : 'Connect wallet'}
      className="inline-flex min-h-10 items-center justify-center gap-2 border border-black bg-black px-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <Wallet size={15} aria-hidden="true" />
      <span className={compact ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  );
}