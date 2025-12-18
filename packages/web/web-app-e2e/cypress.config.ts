/// <reference types="node" />

import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'src/support/e2e.ts',
    webServer: {
      command: 'pnpm --filter @dx3/web-app dev',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      url: 'http://localhost:3000',
    },
  },
})
