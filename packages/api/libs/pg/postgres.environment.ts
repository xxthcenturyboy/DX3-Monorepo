import { isRunningInContainer } from '../config/config-api.service'

/**
 * Get the PostgreSQL connection URI for the current execution environment.
 * Parses the URI from the environment variable and swaps the hostname to
 * localhost when running outside a container.
 *
 * When running on host, the port is changed to 5433 (the standard Docker-mapped port).
 *
 * @param options Configuration options
 * @param options.envVar Environment variable name for the URI (default: 'POSTGRES_URI')
 * @returns PostgreSQL connection URI appropriate for the current environment
 * @throws Error if the environment variable is not set
 *
 * @example
 * ```ts
 * import { getPostgresUriForEnvironment } from '@dx3/api-libs/pg'
 *
 * // In container: returns POSTGRES_URI as-is (postgres://user:pass@postgres-dx3:5432/db)
 * // On host: swaps to localhost:5433 (postgres://user:pass@localhost:5433/db)
 * const postgresUri = getPostgresUriForEnvironment()
 * ```
 */
export function getPostgresUriForEnvironment(options?: { envVar?: string }): string {
  const { envVar = 'POSTGRES_URI' } = options ?? {}

  const uri = process.env[envVar]
  if (!uri) {
    throw new Error(`${envVar} environment variable is not set`)
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
    parsed.port = '5433'

    return parsed.toString()
  } catch (error) {
    throw new Error(`Failed to parse ${envVar}: ${(error as Error).message}`)
  }
}
