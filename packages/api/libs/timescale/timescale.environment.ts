import { isRunningInContainer } from '../config/config-api.service'

/**
 * Check if TimescaleDB logging is enabled.
 * TimescaleDB is optional - apps can run without it.
 *
 * @returns true if TIMESCALE_ENABLED is 'true'
 */
export function isTimescaleEnabled(): boolean {
  return process.env.TIMESCALE_ENABLED === 'true'
}

/**
 * Get the TimescaleDB connection URI for the current execution environment.
 * Parses the URI from the environment variable and swaps the hostname to
 * localhost when running outside a container.
 *
 * When running on host, the port is changed to 5434 (the standard Docker-mapped port for TimescaleDB).
 *
 * @param options Configuration options
 * @param options.envVar Environment variable name for the URI (default: 'TIMESCALE_URI')
 * @returns TimescaleDB connection URI appropriate for the current environment, or null if not configured
 *
 * @example
 * ```ts
 * import { getTimescaleUriForEnvironment } from '@dx3/api-libs/timescale'
 *
 * // In container: returns TIMESCALE_URI as-is (postgres://user:pass@ax-timescaledb:5432/ax_logs)
 * // On host: swaps to localhost:5434 (postgres://user:pass@localhost:5434/ax_logs)
 * const timescaleUri = getTimescaleUriForEnvironment()
 * ```
 */
export function getTimescaleUriForEnvironment(options?: { envVar?: string }): string | null {
  const { envVar = 'TIMESCALE_URI' } = options ?? {}

  const uri = process.env[envVar]
  if (!uri) {
    return null
  }

  // If running in container, use the URI as-is
  if (isRunningInContainer()) {
    return uri
  }

  // Running on host - swap container hostname with localhost and use host port
  try {
    const parsed = new URL(uri)

    // Swap hostname to localhost and use the Docker-mapped port
    parsed.hostname = 'localhost'
    parsed.port = '5434'

    return parsed.toString()
  } catch (error) {
    console.error(`Failed to parse ${envVar}: ${(error as Error).message}`)
    return null
  }
}
