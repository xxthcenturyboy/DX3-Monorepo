import { dxGenerateHashWithSalt, dxGenerateOtp } from '@dx3/encryption/src'
import { OTP_LENGTH } from '@dx3/models-shared'

import { OTP_SALT } from '../../config/config-api.consts'
import { ApiLoggingClass, type ApiLoggingClassType } from '../../logger'
import {
  REDIS_DELIMITER,
  type RedisExpireOptions,
  RedisService,
  type RedisServiceType,
} from '../../redis'

export class OtpCodeCache {
  cache: RedisServiceType
  cacheExpirationOptions: RedisExpireOptions = {
    time: 2 * 60, // 2 minutes
    token: 'EX',
  }
  keyPrefix = 'otp'
  logger: ApiLoggingClassType

  constructor() {
    this.cache = RedisService.instance
    this.logger = ApiLoggingClass.instance
  }

  private getFormattedKeyName(keyValue?: string): string {
    if (keyValue) {
      return `${this.keyPrefix}${REDIS_DELIMITER}${keyValue}`
    }
    return `*${this.keyPrefix}*`
  }

  private async getHashedPhoneValue(countryCode: string, nationalNumber: string) {
    return await dxGenerateHashWithSalt(`${countryCode}${nationalNumber}`, OTP_SALT)
  }

  public async setEmailOtp(email: string): Promise<string> {
    if (!email) {
      return ''
    }

    const code = dxGenerateOtp(OTP_LENGTH)
    const hashedValue = await dxGenerateHashWithSalt(email, OTP_SALT)
    const key = this.getFormattedKeyName(`${code}_${hashedValue}`)
    try {
      await this.cache.setCacheItemWithExpiration(key, code, this.cacheExpirationOptions)
      return code
    } catch (err) {
      this.logger.logError((err as Error).message)
      return ''
    }
  }

  public async setPhoneOtp(countryCode: string, nationalNumber: string): Promise<string> {
    if (!countryCode || !nationalNumber) {
      return ''
    }

    const code = dxGenerateOtp(OTP_LENGTH).toString()
    const hashedValue = await this.getHashedPhoneValue(countryCode, nationalNumber)
    const key = this.getFormattedKeyName(`${code}_${hashedValue}`)
    try {
      await this.cache.setCacheItemWithExpiration(key, code, this.cacheExpirationOptions)
      return code
    } catch (err) {
      this.logger.logError((err as Error).message)
      return ''
    }
  }

  public async validateEmailOtp(code: string, email: string): Promise<boolean> {
    if (!email || !code) {
      return false
    }

    const hashedValue = await dxGenerateHashWithSalt(email, OTP_SALT)
    const key = this.getFormattedKeyName(`${code}_${hashedValue}`)
    try {
      const data = await this.cache.getCacheItemSimple(key)
      const isValid = data?.toString() === code?.toString()
      if (isValid) {
        void this.cache.deleteCacheItem(key)
      }
      return isValid
    } catch (err) {
      this.logger.logError((err as Error).message)
    }

    return false
  }

  public async validatePhoneOtp(
    code: string,
    countryCode: string,
    nationalNumber: string,
  ): Promise<boolean> {
    if (!countryCode || !nationalNumber || !code) {
      return false
    }

    const hashedValue = await this.getHashedPhoneValue(countryCode, nationalNumber)
    const key = this.getFormattedKeyName(`${code}_${hashedValue}`)
    try {
      const data = await this.cache.getCacheItemSimple(key)
      const isValid = data?.toString() === code?.toString()
      if (isValid) {
        void this.cache.deleteCacheItem(key)
      }
      return isValid
    } catch (err) {
      this.logger.logError((err as Error).message)
    }

    return false
  }
}

export type OtpCodeCacheType = typeof OtpCodeCache.prototype
