/**
 * Mock implementation of ioredis using ioredis-mock package.
 * Provides a complete Redis mock with in-memory storage for unit testing.
 *
 * Usage: Jest will automatically use this mock when 'ioredis' is imported
 * due to moduleNameMapper configuration in jest.config.ts
 */

import * as path from 'node:path'

// Resolve the actual ioredis-mock package from node_modules
// We need to bypass Jest's module resolution to get the real package
const ioredisMockPath = path.resolve(__dirname, '../../../../../node_modules/ioredis-mock')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ioredisMockModule = require(ioredisMockPath)

// Handle ESM interop - ts-jest may wrap the module differently than Node.js
let IORedisMock: new (...args: unknown[]) => unknown
let ClusterClass: new (...args: unknown[]) => unknown

if (typeof ioredisMockModule === 'function') {
  // Direct function (Node.js require pattern)
  IORedisMock = ioredisMockModule
  ClusterClass = ioredisMockModule.Cluster
} else if (ioredisMockModule && typeof ioredisMockModule.default === 'function') {
  // ESM default export
  IORedisMock = ioredisMockModule.default
  ClusterClass = ioredisMockModule.default.Cluster || ioredisMockModule.Cluster
} else {
  // Fallback: try to use as-is
  throw new Error(
    `ioredis-mock loaded in unexpected format: ${typeof ioredisMockModule}, keys: ${Object.keys(ioredisMockModule || {}).join(', ')}`,
  )
}

// Create the Redis export with Cluster as a static property (matching real ioredis)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Redis = IORedisMock as any
Redis.Cluster = ClusterClass

// Shared instance for clearing mock store (avoids creating new instances with listeners)
let sharedClearInstance: { flushall: () => void } | null = null

// Helper to clear mock store between tests
const clearMockStore = () => {
  if (!sharedClearInstance) {
    sharedClearInstance = new IORedisMock() as { flushall: () => void }
  }
  sharedClearInstance.flushall()
}

// Helper to get a fresh mock instance
const createMockInstance = (options?: { keyPrefix?: string }) => {
  return new IORedisMock(options)
}

// Export to match ioredis structure
export { Redis, clearMockStore, createMockInstance }
export const Cluster = ClusterClass
export default Redis
