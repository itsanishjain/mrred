import { PrivyClientConfig } from '@privy-io/react-auth';
import { polygon, polygonMumbai } from 'wagmi/chains';

export const privyConfig: PrivyClientConfig = {
  // Use polygonMumbai for testing, polygon for production
  defaultChain: polygonMumbai,
  supportedChains: [polygon, polygonMumbai],
  
  // Configure login methods
  loginMethods: ['email', 'wallet'],
  
  // Enable embedded wallets
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  
  // Appearance customization
  appearance: {
    theme: 'light',
    accentColor: '#6366F1', // Indigo color
  },
};
