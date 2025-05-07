import { http } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import { createConfig } from '@privy-io/wagmi';

// Create wagmi config with Privy's bindings
export const config = createConfig({
  chains: [polygon, polygonMumbai],
  transports: {
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
});
