import type { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { wagmiAdapter } from './reown';

export default function WalletProvider({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiAdapter.wagmiConfig}>{children}</WagmiProvider>;
}