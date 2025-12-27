import { StatusCodes } from 'http-status-codes'

import { ApiLoggingClass } from '../logger'
import { HEALTHZ_STATUS_ERROR, HEALTHZ_STATUS_OK } from './healthz-api.const'

/**
 * Get the default URL for HTTP health checks.
 * Uses the local /api/livez endpoint instead of an external URL.
 * This avoids external network dependencies and is faster.
 */
function getDefaultHealthCheckUrl(): string {
  const port = process.env.API_PORT || '4000'
  return `http://localhost:${port}/api/livez`
}

export class HttpHealthzService {
  private async ping(url?: string) {
    try {
      const result = await fetch(url || getDefaultHealthCheckUrl())
      if (result && result.status === StatusCodes.OK) {
        return HEALTHZ_STATUS_OK
      }

      return HEALTHZ_STATUS_ERROR
    } catch (err) {
      ApiLoggingClass.instance.logError((err as Error).message)
      return (err as Error).message
    }
  }

  public async healthCheck(url?: string): Promise<string | number> {
    return this.ping(url)
  }
}

export type HttpHealthzServiceType = typeof HttpHealthzService.prototype
