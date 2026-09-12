import { ReactNode, useEffect, useRef, useState } from 'react';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { useChainId, useSwitchChain } from 'wagmi';
import { TriangleAlert } from 'lucide-react';
import { configuredRobinhoodChain } from '@/lib/chains';

export default function ChainGuard({ children }: { children: ReactNode }) {
  const { isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const chainId = useChainId();
  const { switchChainAsync, isPending } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);
  const switchButtonRef = useRef<HTMLButtonElement>(null);
  const isWrongNetwork = isConnected && chainId !== configuredRobinhoodChain.id;

  useEffect(() => {
    if (isWrongNetwork) switchButtonRef.current?.focus();
    else setError(null);
  }, [isWrongNetwork]);

  async function switchNetwork() {
    setError(null);
    try {
      await switchChainAsync({ chainId: configuredRobinhoodChain.id });
    } catch (switchError) {
      setError(
        switchError instanceof Error && /reject|denied|cancel/i.test(switchError.message)
          ? 'Network switch was rejected in the wallet.'
          : `The wallet could not add or switch to ${configuredRobinhoodChain.name}.`,
      );
    }
  }

  return (
    <>
      <div aria-hidden={isWrongNetwork || undefined} inert={isWrongNetwork ? true : undefined}>
        {children}
      </div>
      {isWrongNetwork && (
        <div className="fixed inset-0 z-50 flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-black/80 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="chain-guard-title"
            aria-describedby="chain-guard-description"
            className="w-full max-w-lg border border-black bg-white p-6 shadow-2xl sm:p-8"
          >
            <TriangleAlert size={28} className="mb-5 text-red-700" aria-hidden="true" />
            <p className="eyebrow mb-3">Wrong network</p>
            <h1 id="chain-guard-title" className="display text-3xl sm:text-4xl">
              Switch to Robinhood Chain
            </h1>
            <p id="chain-guard-description" className="mt-4 leading-relaxed text-muted">
              Stock Tokens only exist on Robinhood Chain. Your wallet is connected to{' '}
              {caipNetwork?.name ?? `chain ${chainId}`}.
            </p>
            {error && (
              <p role="alert" className="mt-4 border-l-4 border-red-700 bg-red-50 p-3 text-sm text-red-900">
                {error}
              </p>
            )}
            <button
              ref={switchButtonRef}
              type="button"
              onClick={switchNetwork}
              disabled={isPending}
              className="btn btn-primary mt-6 min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? 'Waiting for wallet…' : `Switch to ${configuredRobinhoodChain.name}`}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
