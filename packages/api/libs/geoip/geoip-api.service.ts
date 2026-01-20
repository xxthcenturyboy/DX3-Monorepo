import type { CityResponse } from 'maxmind'
import * as maxmind from 'maxmind'

import { MAXMIND_GEOIP_DB_PATH } from '@dx3/api-libs/config/config-api.consts'
import { ApiLoggingClass } from '@dx3/api-libs/logger'

let lookupReader: maxmind.Reader<CityResponse> | null = null
let lookupPromise: Promise<maxmind.Reader<CityResponse> | null> | null = null

export class GeoIpService {
  public static async lookup(ip: string): Promise<CityResponse | null> {
    if (!ip) {
      return null
    }

    const reader = await GeoIpService.getReader()
    if (!reader) {
      return null
    }

    try {
      return reader.get(ip) ?? null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error'
      ApiLoggingClass?.instance?.logDebug(`GeoIP lookup failed: ${errorMessage}`)
      return null
    }
  }

  private static async getReader(): Promise<maxmind.Reader<CityResponse> | null> {
    if (!MAXMIND_GEOIP_DB_PATH) {
      ApiLoggingClass?.instance?.logDebug('GeoIP lookup skipped: MAXMIND_GEOIP_DB_PATH not set')
      return null
    }

    if (lookupReader) {
      return lookupReader
    }

    if (lookupPromise) {
      return lookupPromise
    }

    lookupPromise = GeoIpService.loadReader()
    return lookupPromise
  }

  private static async loadReader(): Promise<maxmind.Reader<CityResponse> | null> {
    try {
      const reader = await maxmind.open<CityResponse>(MAXMIND_GEOIP_DB_PATH)
      lookupReader = reader
      return reader
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error'
      ApiLoggingClass?.instance?.logWarn(`GeoIP database load failed: ${errorMessage}`)
      return null
    } finally {
      lookupPromise = null
    }
  }
}
