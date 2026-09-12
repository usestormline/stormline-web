import { KeyboardEvent, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { ArrowLeft, ShieldCheck, Wallet } from 'lucide-react';
import Logo from '@/components/layout/Logo';

const focusableSelector = 'button:not([disabled]), a[href]';

export default function WalletAccessGate() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isConnected) {
      dialogRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus();
    }
  }, [isConnected]);

  if (isConnected) {
    return null;
  }

  function handleKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-black/80 p-4 sm:p-8">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-gate-title"
        aria-describedby="wallet-gate-description"
        onKeyDown={handleKeyboard}
        className="my-auto w-full max-w-xl border border-black bg-white"
      >
        <div className="flex items-center justify-between border-b border-line-strong px-5 py-4 sm:px-8">
          <Logo />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Required access
          </span>
        </div>

        <div className="p-5 sm:p-8 md:p-10">
          <div className="mb-7 flex h-12 w-12 items-center justify-center bg-brand text-white">
            <ShieldCheck size={24} aria-hidden="true" />
          </div>

          <p className="eyebrow mb-3">Wallet verification</p>
          <h1 id="wallet-gate-title" className="display text-3xl leading-tight sm:text-4xl">
            Connect Robinhood Wallet to access Stormline
          </h1>
          <p id="wallet-gate-description" className="mt-4 max-w-lg leading-relaxed text-muted">
            Robinhood Wallet is required to enter the monitoring dashboard. The connection
            verifies your public wallet address only. Stormline never requests your seed phrase
            or private key.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => open({ view: 'Connect' })}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-black px-5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Wallet size={17} aria-hidden="true" />
              Connect Robinhood Wallet
            </button>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-line-strong px-5 text-xs font-semibold uppercase tracking-wider transition-colors hover:border-black hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Return to landing
            </Link>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-muted">
            Wallet connection unlocks non-custodial monitoring. Stormline does not manage or execute trades.
          </p>
        </div>
      </div>
    </div>
  );
}