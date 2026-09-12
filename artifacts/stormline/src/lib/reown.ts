import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
  configuredRobinhoodChain,
  robinhoodChain,
} from './chains';

export { configuredRobinhoodChain, robinhoodChain } from './chains';

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error('VITE_REOWN_PROJECT_ID is required to initialize wallet connections.');
}

const networks: [typeof robinhoodChain] = [robinhoodChain];

const metadata = {
  name: 'Stormline',
  description: 'Event-aware structural monitoring for tokenized assets.',
  url: window.location.origin,
  icons: [`${window.location.origin}/stormline-favicon.png`],
};

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  defaultNetwork: configuredRobinhoodChain,
  projectId,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
});