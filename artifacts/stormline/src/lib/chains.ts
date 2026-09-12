import { defineChain } from 'viem';

const robinhoodMainnetRpc =
  import.meta.env.VITE_RH_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com/';

export const robinhoodChain = defineChain({
  id: 4663,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [robinhoodMainnetRpc] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://robinhoodchain.blockscout.com',
    },
  },
});

const configuredChainId = Number(import.meta.env.VITE_RH_CHAIN_ID || robinhoodChain.id);

if (configuredChainId !== robinhoodChain.id) {
  throw new Error('Stormline only supports Robinhood Chain mainnet (4663).');
}

export const configuredRobinhoodChain = robinhoodChain;

// Populate only from Chainlink's official Price Feeds page for this exact network.
// Feed decimals are intentionally excluded because the API reads them on-chain.
export const chainlinkFeedsByChain = {
  [robinhoodChain.id]: {},
} as const satisfies Record<number, Record<string, `0x${string}`>>;
