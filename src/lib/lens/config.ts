import { LensConfig, development, production } from '@lens-protocol/react-web';
import { config as wagmiConfig } from '@/lib/wagmi/config';
import { createLensBindings } from '@lens-protocol/react-web/bindings/wagmi';

// Determine if we're in production or development
const isProd = process.env.NODE_ENV === 'production';

// Create bindings for Lens with wagmi
const bindings = createLensBindings({
  wagmiConfig
});

// Create Lens configuration
export const lensConfig: LensConfig = {
  environment: isProd ? production : development,
  bindings,
  debug: !isProd,
};
