import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useChainId,
  usePublicClient,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { erc20Abi, formatUnits, getAddress, isAddress, parseUnits, zeroAddress } from 'viem';
import { ArrowRight, CheckCircle2, ExternalLink, RotateCcw, Send, TriangleAlert, Wallet, XCircle } from 'lucide-react';
import {
  getGetStockTokenPortfolioQueryKey,
  useGetStockTokenPortfolio,
} from '@usestormline/api-client-react';
import PageHead from '@/components/ui/PageHead';
import { configuredRobinhoodChain } from '@/lib/chains';

export default function TransferStockToken() {
  const queryClient = useQueryClient();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: configuredRobinhoodChain.id });
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const {
    data: transactionHash,
    error: writeError,
    isPending: isWriting,
    writeContractAsync,
    reset,
  } = useWriteContract();
  const [selectedContract, setSelectedContract] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [intent, setIntent] = useState<{
    sender: `0x${string}`;
    portfolioQueryAddress: string;
    chainId: 4663;
    contractAddress: `0x${string}`;
    tokenName: string;
    symbol: string;
    decimals: number;
    currentMultiplier: string;
    recipient: `0x${string}`;
    displayAmount: string;
    rawAmount: bigint;
  } | null>(null);
  const submissionLock = useRef(false);
  const portfolioInvalidated = useRef(false);

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
  const holdings = portfolio.data?.holdings ?? [];
  const selected = useMemo(
    () => holdings.find((holding) => holding.contractAddress === selectedContract),
    [holdings, selectedContract],
  );
  const receipt = useWaitForTransactionReceipt({
    chainId: configuredRobinhoodChain.id,
    hash: transactionHash,
    query: { enabled: Boolean(transactionHash) },
  });
  const receiptSucceeded = receipt.data?.status === 'success';
  const receiptReverted = receipt.data?.status === 'reverted';

  useEffect(() => {
    if (!receiptSucceeded || !intent || !publicClient || portfolioInvalidated.current) return;
    portfolioInvalidated.current = true;
    void (async () => {
      try {
        const freshRawBalance = await publicClient.readContract({
          address: intent.contractAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [intent.sender],
        });
        const multiplierScale = 10n ** 18n;
        const multiplier = parseUnits(intent.currentMultiplier, 18);
        const effectiveRawBalance = (freshRawBalance * multiplier) / multiplierScale;
        const senderParams = { address: intent.portfolioQueryAddress };

        queryClient.setQueryData(
          getGetStockTokenPortfolioQueryKey(senderParams),
          (current: typeof portfolio.data) => {
            if (!current) return current;
            return {
              ...current,
              asOf: new Date().toISOString(),
              holdings: current.holdings
                .map((holding) =>
                  holding.contractAddress.toLowerCase() === intent.contractAddress.toLowerCase()
                    ? {
                        ...holding,
                        rawBalance: freshRawBalance.toString(),
                        balance: formatUnits(freshRawBalance, intent.decimals),
                        effectiveBalance: formatUnits(effectiveRawBalance, intent.decimals),
                      }
                    : holding,
                )
                .filter((holding) => BigInt(holding.rawBalance) > 0n),
            };
          },
        );
      } catch {
        setRefreshError(
          'Transfer confirmed, but the updated balance could not be read. Refresh after the portfolio cache expires.',
        );
      }
    })();
  }, [intent, portfolio.data, publicClient, queryClient, receiptSucceeded]);

  async function switchToRobinhoodChain() {
    setFormError(null);
    try {
      await switchChainAsync({ chainId: configuredRobinhoodChain.id });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Network switch was rejected.');
    }
  }

  function reviewTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    reset();

    if (!address || !selected) {
      setFormError('Select a Stock Token held by the connected wallet.');
      return;
    }
    if (chainId !== configuredRobinhoodChain.id) {
      setFormError('Switch the wallet to Robinhood Chain before transferring.');
      return;
    }
    if (portfolio.data?.chainId !== configuredRobinhoodChain.id) {
      setFormError(
        `The canonical asset registry is for chain ${portfolio.data?.chainId ?? 'unknown'}, not configured chain ${configuredRobinhoodChain.id}. Transfer is disabled to prevent using a contract on the wrong network.`,
      );
      return;
    }
    if (!isAddress(recipient)) {
      setFormError('Enter a valid EVM destination address.');
      return;
    }
    const normalizedRecipient = getAddress(recipient);
    if (normalizedRecipient === zeroAddress) {
      setFormError('The zero address is not a valid transfer destination.');
      return;
    }
    if (
      !isAddress(selected.contractAddress) ||
      !Number.isInteger(selected.decimals) ||
      selected.decimals < 0 ||
      selected.decimals > 36 ||
      !/^\d+$/.test(selected.rawBalance)
    ) {
      setFormError('The selected asset metadata could not be verified. Refresh the portfolio.');
      return;
    }

    let transferAmount: bigint;
    try {
      transferAmount = parseUnits(amount, selected.decimals);
    } catch {
      setFormError(`Enter an amount with no more than ${selected.decimals} decimal places.`);
      return;
    }

    if (transferAmount <= 0n) {
      setFormError('Transfer amount must be greater than zero.');
      return;
    }
    if (transferAmount > BigInt(selected.rawBalance)) {
      setFormError(`Amount exceeds the available ${selected.symbol} contract balance.`);
      return;
    }

    setIntent({
      sender: getAddress(address),
      portfolioQueryAddress: address,
      chainId: configuredRobinhoodChain.id,
      contractAddress: getAddress(selected.contractAddress),
      tokenName: selected.name,
      symbol: selected.symbol,
      decimals: selected.decimals,
      currentMultiplier: selected.currentMultiplier,
      recipient: normalizedRecipient,
      displayAmount: amount,
      rawAmount: transferAmount,
    });
  }

  async function confirmTransfer() {
    if (!intent || submissionLock.current || transactionHash) return;
    if (
      !address ||
      getAddress(address) !== intent.sender ||
      chainId !== intent.chainId
    ) {
      setFormError(
        'The connected account or network changed after review. Return to editing and review the transfer again.',
      );
      return;
    }
    submissionLock.current = true;
    setFormError(null);
    setRefreshError(null);
    try {
      await writeContractAsync({
        address: intent.contractAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [intent.recipient, intent.rawAmount],
        chainId: configuredRobinhoodChain.id,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The wallet rejected the transaction.');
    } finally {
      submissionLock.current = false;
    }
  }

  function startNewTransfer() {
    reset();
    setIntent(null);
    setSelectedContract('');
    setRecipient('');
    setAmount('');
    setFormError(null);
    portfolioInvalidated.current = false;
  }

  const explorerUrl = transactionHash
    ? `${configuredRobinhoodChain.blockExplorers.default.url}/tx/${transactionHash}`
    : null;

  return (
    <>
      <PageHead
        eyebrow="On-Chain Self-Custody"
        title="Send Stock Tokens"
        sub="Execute direct self-custody transfers of canonical Robinhood Stock Tokens from your wallet on Robinhood Chain. These actions are standard ERC-20 transfers and are not related to automated protection execution."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="border border-line-strong bg-white">
          <div className="flex items-center justify-between border-b border-line-strong bg-gray-50 p-5">
            <div>
              <p className="eyebrow mb-1">ERC-20 transfer</p>
              <h2 className="font-semibold">Prepare transaction</h2>
            </div>
            <Send size={20} aria-hidden="true" />
          </div>

          {!isConnected ? (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <Wallet size={28} className="mb-5 text-brand" aria-hidden="true" />
              <h3 className="display text-2xl">Connect a wallet to continue</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Stormline will load only canonical Stock Tokens with a nonzero balance.
              </p>
              <button type="button" onClick={() => open({ view: 'Connect' })} className="btn btn-primary mt-7">
                Connect wallet
              </button>
            </div>
          ) : chainId !== configuredRobinhoodChain.id ? (
            <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
              <TriangleAlert size={28} className="mb-5 text-amber-700" aria-hidden="true" />
              <h3 className="display text-2xl">Robinhood Chain required</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Transfers are submitted only on configured chain ID {configuredRobinhoodChain.id}.
                Switch networks before selecting an asset.
              </p>
              <button
                type="button"
                onClick={switchToRobinhoodChain}
                disabled={isSwitching}
                className="btn btn-primary mt-7 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSwitching ? 'Switching…' : 'Switch to Robinhood Chain'}
              </button>
              {formError && <p className="mt-4 text-sm text-red-700">{formError}</p>}
            </div>
          ) : (
            !intent ? (
            <form onSubmit={reviewTransfer} className="space-y-6 p-6 sm:p-8">
              <div>
                <label htmlFor="stock-token" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                  Stock Token
                </label>
                <select
                  id="stock-token"
                  value={selectedContract}
                  onChange={(event) => {
                    setSelectedContract(event.target.value);
                    setAmount('');
                    setFormError(null);
                  }}
                  className="input h-12 w-full"
                  disabled={portfolio.isLoading || holdings.length === 0}
                  required
                >
                  <option value="">
                    {portfolio.isError
                      ? 'Canonical registry or chain unavailable'
                      : portfolio.isLoading
                      ? 'Loading canonical positions…'
                      : holdings.length === 0
                        ? 'No transferable Stock Token detected'
                        : 'Select a token'}
                  </option>
                  {holdings.map((holding) => (
                    <option key={holding.contractAddress} value={holding.contractAddress}>
                      {holding.symbol} — {holding.balance}
                    </option>
                  ))}
                </select>
                {portfolio.isError && (
                  <p role="alert" className="mt-2 text-sm text-red-700">
                    Stock Token positions could not be verified. No transfer can be prepared.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="transfer-amount" className="text-xs font-semibold uppercase tracking-wider">
                    Amount
                  </label>
                  {selected && (
                    <button
                      type="button"
                      onClick={() => setAmount(selected.balance)}
                      className="font-mono text-[10px] uppercase tracking-wider text-brand hover:underline"
                    >
                      Max {selected.balance} {selected.symbol}
                    </button>
                  )}
                </div>
                <input
                  id="transfer-amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="input h-12 w-full"
                  required
                />
                {selected && Number(selected.currentMultiplier) !== 1 && (
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    Transfer uses the contract balance. Displayed effective exposure includes a
                    corporate-action multiplier of {selected.currentMultiplier}.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="recipient-address" className="mb-2 block text-xs font-semibold uppercase tracking-wider">
                  Destination address
                </label>
                <input
                  id="recipient-address"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="0x…"
                  autoComplete="off"
                  spellCheck={false}
                  className="input h-12 w-full font-mono"
                  required
                />
              </div>

              {(formError || writeError) && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-900"
                >
                  {formError ?? writeError?.message}
                </div>
              )}

              <button
                type="submit"
                disabled={!selected || portfolio.isError}
                className="btn btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                Review transfer <ArrowRight size={15} aria-hidden="true" />
              </button>
            </form>
            ) : (
              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <p className="eyebrow mb-2">Final review</p>
                  <h3 className="display text-3xl">Confirm every field</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Your wallet will sign this exact transaction. It cannot be reversed after confirmation.
                  </p>
                </div>

                <dl className="divide-y divide-line border-y border-line-strong text-sm">
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="font-mono text-xs uppercase text-muted">Network</dt>
                    <dd>
                      {configuredRobinhoodChain.name} · {configuredRobinhoodChain.id}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="font-mono text-xs uppercase text-muted">Asset</dt>
                    <dd>{intent.tokenName} ({intent.symbol})</dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="font-mono text-xs uppercase text-muted">Amount</dt>
                    <dd>{intent.displayAmount} {intent.symbol} contract units</dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="font-mono text-xs uppercase text-muted">Contract</dt>
                    <dd className="break-all font-mono text-xs">{intent.contractAddress}</dd>
                  </div>
                  <div className="grid gap-1 py-4 sm:grid-cols-[160px_1fr]">
                    <dt className="font-mono text-xs uppercase text-muted">Recipient</dt>
                    <dd className="break-all font-mono text-xs">{intent.recipient}</dd>
                  </div>
                </dl>

                {address && intent.recipient.toLowerCase() === address.toLowerCase() && (
                  <div role="alert" className="border-l-4 border-amber-700 bg-amber-50 p-4 text-sm text-amber-900">
                    The recipient is the connected wallet. This self-transfer changes no ownership but still costs gas.
                  </div>
                )}

                {(formError || writeError || receipt.error) && (
                  <div role="alert" aria-live="assertive" className="border-l-4 border-red-700 bg-red-50 p-4 text-sm text-red-900">
                    {formError ?? writeError?.message ?? receipt.error?.message}
                  </div>
                )}

                {refreshError && (
                  <div role="status" className="border-l-4 border-amber-700 bg-amber-50 p-4 text-sm text-amber-900">
                    {refreshError}
                  </div>
                )}

                {transactionHash && (
                  <div
                    aria-live="polite"
                    className={`border-l-4 p-4 ${
                      receiptReverted
                        ? 'border-red-700 bg-red-50'
                        : receiptSucceeded
                          ? 'border-green-700 bg-green-50'
                          : receipt.isError
                            ? 'border-amber-700 bg-amber-50'
                            : 'border-brand bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {receiptReverted ? (
                        <XCircle size={18} className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" />
                      ) : (
                        <CheckCircle2
                          size={18}
                          className={`mt-0.5 shrink-0 ${
                            receiptSucceeded
                              ? 'text-green-700'
                              : receipt.isError
                                ? 'text-amber-700'
                                : 'text-brand'
                          }`}
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <p className="font-semibold">
                          {receiptSucceeded
                            ? 'Transfer confirmed'
                            : receiptReverted
                              ? 'Transaction reverted'
                              : receipt.isError
                                ? 'Confirmation status unavailable'
                              : 'Transaction submitted'}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-muted">{transactionHash}</p>
                        {receipt.isError && !receiptReverted && (
                          <p className="mt-2 text-xs leading-relaxed text-amber-900">
                            The transaction may still be pending. Check the explorer before taking
                            any further action.
                          </p>
                        )}
                        {explorerUrl && (
                          <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-brand"
                          >
                            View transaction <ExternalLink size={13} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!transactionHash ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIntent(null)}
                      disabled={isWriting}
                      className="btn btn-outline min-h-12 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit details
                    </button>
                    <button
                      type="button"
                      onClick={confirmTransfer}
                      disabled={isWriting || submissionLock.current}
                      className="btn btn-primary min-h-12 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isWriting ? 'Confirm in wallet…' : 'Sign transfer'}
                    </button>
                  </div>
                ) : receiptSucceeded || receiptReverted ? (
                  <button type="button" onClick={startNewTransfer} className="btn btn-outline min-h-12 w-full">
                    <RotateCcw size={14} aria-hidden="true" /> New transfer
                  </button>
                ) : receipt.isError ? (
                  <button
                    type="button"
                    onClick={() => void receipt.refetch()}
                    className="btn btn-outline min-h-12 w-full"
                  >
                    Retry receipt check
                  </button>
                ) : (
                  <p className="text-center text-xs font-mono uppercase tracking-wider text-muted">
                    Waiting for a terminal receipt before another transfer can begin
                  </p>
                )}
              </div>
            )
          )}
        </section>

        <aside className="space-y-5">
          <section className="border border-line-strong bg-white p-6">
            <p className="eyebrow mb-3">Transaction safety</p>
            <ul className="space-y-3 text-sm leading-relaxed text-muted">
              <li>Only contracts returned by Robinhood&apos;s canonical registry can be selected.</li>
              <li>Your wallet displays and signs the final transaction.</li>
              <li>The destination and transfer amount cannot be reversed after confirmation.</li>
              <li>Robinhood Chain ETH is required for network fees.</li>
            </ul>
          </section>

          {selected && (
            <section className="border border-line-strong bg-white p-6">
              <p className="eyebrow mb-3">Selected contract</p>
              <h2 className="font-semibold">{selected.name}</h2>
              <p className="mt-2 break-all font-mono text-xs text-muted">{selected.contractAddress}</p>
              <p className="mt-4 text-sm">
                Available: {selected.balance} {selected.symbol}
              </p>
              <a
                href={selected.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider hover:text-brand"
              >
                Verify contract <ExternalLink size={13} aria-hidden="true" />
              </a>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}