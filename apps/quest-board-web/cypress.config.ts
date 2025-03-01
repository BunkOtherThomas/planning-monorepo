import { defineConfig } from 'cypress';
import type { Config } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions): void {
      // implement node event listeners here
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
} as Config); 