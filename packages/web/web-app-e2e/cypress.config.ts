/// <reference types="node" />

import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'src/support/e2e.ts',
    // @ts-expect-error -- webServer is a valid Cypress 13+ runtime option but absent from the bundled type definitions
    webServer: {
      command: 'pnpm --filter @dx3/web-app dev',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      url: 'http://localhost:3000',
    },
  },
})
