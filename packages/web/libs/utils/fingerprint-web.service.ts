import fingerprint, { type Agent } from '@fingerprintjs/fingerprintjs'

import { logger } from '../logger'

export class FingerprintWebService {
  static #instance: FingerprintWebServiceType
  cachedFingerprint: string | null = null
  fpPromise: Promise<Agent>

  constructor() {
    this.fpPromise = fingerprint.load()
    FingerprintWebService.#instance = this
  }

  public static get instance() {
    if (!FingerprintWebService.#instance) {
      new FingerprintWebService()
    }

    return FingerprintWebService.#instance
  }

  public async getFingerprint(): Promise<string | null> {
    if (this.cachedFingerprint) {
      return this.cachedFingerprint
    }

    if (this.fpPromise) {
      try {
        const fp = await this.fpPromise
        if (fp) {
          const result = await fp.get()
          this.cachedFingerprint = result.visitorId
          return result.visitorId
        }
      } catch (err) {
        logger.error('FingerprintWebService', 'getFingerprint', 'Error getting fingerprint', err)
      }
    }

    return null
  }
}

export type FingerprintWebServiceType = typeof FingerprintWebService.prototype
