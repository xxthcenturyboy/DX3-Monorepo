import type { USER_ROLE } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { REDIS_DELIMITER, RedisService, type RedisServiceType } from '../redis'
import type { UserPrivilegeSetModel } from './user-privilege-api.postgres-model'

export class UserPrivilegeSetCache {
  cache: RedisServiceType
  keyPrefix = 'user-privilege-set'
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

  public async setCache(
    privilegeSetName: keyof typeof USER_ROLE,
    privilegeSet: UserPrivilegeSetModel,
  ): Promise<boolean> {
    if (!privilegeSetName || !privilegeSet) {
      return false
    }

    const key = this.getFormattedKeyName(privilegeSetName)
    const data = JSON.stringify(privilegeSet)
    try {
      const save = await this.cache.setCacheItem(key, data)
      return save
    } catch (err) {
      this.logger.logError(err)
      return false
    }
  }

  public async getCache(
    privilegeSetName: keyof typeof USER_ROLE,
  ): Promise<UserPrivilegeSetModel | null> {
    if (!privilegeSetName) {
      return null
    }

    const key = this.getFormattedKeyName(privilegeSetName)
    try {
      const data = await this.cache.getCacheItem<UserPrivilegeSetModel>(key)
      return data
    } catch (err) {
      this.logger.logError(err)
    }

    return null
  }

  public async getAllPrivilegeSets(): Promise<UserPrivilegeSetModel[]> {
    const key = this.getFormattedKeyName()
    try {
      const data = await this.cache.getAllNamespace<UserPrivilegeSetModel>(key)
      return data
    } catch (err) {
      this.logger.logError(err)
    }

    return null
  }
}

export type UserPrivilegeSetCacheType = typeof UserPrivilegeSetCache.prototype
