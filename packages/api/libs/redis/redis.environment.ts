import { isRunningInContainer } from '../config/config-api.service'

/**
 * Get the Redis connection URL for the current execution environment.
 * Parses the URL from the environment variable and swaps the hostname to
 * localhost when running outside a container.
 *
 * @param options Configuration options
 * @param options.envVar Environment variable name (default: 'REDIS_URL')
 * @returns Redis connection URL appropriate for the current environment
 * @throws Error if the environment variable is not set
 *
 * @example
 * ```ts
 * import { getRedisUrlForEnvironment } from '@dx3/api-libs/redis'
 *
 * // In container: returns REDIS_URL as-is
 * // On host: swaps hostname to localhost
 * const redisUrl = getRedisUrlForEnvironment()
 * ```
 */
export function getRedisUrlForEnvironment(options?: { envVar?: string }): string {
  const { envVar = 'REDIS_URL' } = options ?? {}

  const url = process.env[envVar]
  if (!url) {
    throw new Error(`${envVar} environment variable is not set`)
  }

  // If running in container, use the URL as-is
  if (isRunningInContainer()) {
    return url
  }

  // Running on host - swap container hostname with localhost
  try {
    const parsed = new URL(url)

    // Swap hostname to localhost
    parsed.hostname = 'localhost'

    return parsed.toString()
  } catch (error) {
    throw new Error(`Failed to parse ${envVar}: ${(error as Error).message}`)
  }
}
