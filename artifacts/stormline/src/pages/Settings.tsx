import PageHead from '@/components/ui/PageHead';
import WalletButton from '@/components/wallet/WalletButton';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';

export default function Settings() {
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  return (
    <div className="max-w-3xl">
      <PageHead eyebrow="Preferences" title="Settings" />
      
      <div className="border border-line-strong bg-white p-8 md:p-12">
        <div className="border-b border-line-strong pb-8 mb-8">
          <h3 className="display text-2xl mb-4">Account Information</h3>
          <p className="text-muted leading-relaxed max-w-lg">
            Connect a wallet to verify ownership and inspect its public address. Stormline operates strictly as a non-custodial monitor.
          </p>
        </div>
        
        <div className="space-y-6">
          <div>
            <span className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Wallet</span>
            <WalletButton />
          </div>
          <div>
            <label htmlFor="wallet-address" className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Public Address</label>
            <input
              id="wallet-address"
              type="text"
              className="input bg-gray-50 text-muted"
              value={isConnected && address ? address : 'No wallet connected'}
              disabled
            />
          </div>
          <div>
            <label htmlFor="connected-network" className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">Connected Network</label>
            <input
              id="connected-network"
              type="text"
              className="input bg-gray-50 text-muted"
              value={isConnected ? caipNetwork?.name ?? 'Connected network' : 'Not connected'}
              disabled
            />
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <h4 className="mb-1 text-sm font-bold">Non-custodial security</h4>
          <p className="text-xs leading-relaxed text-muted">
            Stormline can observe public on-chain data. It cannot move funds, submit transactions,
            or access your wallet credentials.
          </p>
        </div>
      </div>
    </div>
  );
}