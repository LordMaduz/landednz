import type { StorybookConfig } from '@storybook/react-vite'
import { resolve } from 'path'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: false, // Disable to avoid compatibility issues
  },
  core: {
    disableTelemetry: true,
  },
  viteFinal: async (config) => {
    // Path resolution
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '../src'),
    };

    // JSX configuration for automatic React import
    config.esbuild = config.esbuild || {};
    config.esbuild.jsx = 'automatic';
    config.esbuild.jsxImportSource = 'react';

    // Auto-provide React globally as fallback
    config.define = config.define || {};
    config.define.global = 'globalThis';

    // Build config
    config.build = config.build || {};
    config.build.minify = false;

    return config;
  },
}

export default config