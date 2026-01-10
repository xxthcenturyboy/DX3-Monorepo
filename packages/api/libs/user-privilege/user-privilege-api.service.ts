import type { UpdatePrivilegeSetPayloadType } from '@dx3/models-shared'
import { ERROR_CODES } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { createApiErrorMessage } from '../utils'
import { UserPrivilegeSetModel } from './user-privilege-api.postgres-model'
import { UserPrivilegeSetCache } from './user-privilege-api.redis-cache'

export class UserPrivilegeService {
  private logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  private async getAllFromCache() {
    try {
      const cache = new UserPrivilegeSetCache()
      return await cache.getAllPrivilegeSets()
    } catch (err) {
      this.logger.logError(err.message)
    }

    return null
  }

  private async setAllToCache(data: UserPrivilegeSetModel[]) {
    try {
      const promises: Promise<void>[] = []
      const cache = new UserPrivilegeSetCache()
      for (const privilege of data) {
        promises.push(void cache.setCache(privilege.name, privilege.toJSON()))
      }
      await Promise.all(promises)
    } catch (err) {
      this.logger.logError(err.message || 'failed to write all privilege sets to cache.')
    }
  }

  public async getAllPrivilegeSets() {
    try {
      const cacheSets = await this.getAllFromCache()
      if (Array.isArray(cacheSets) && cacheSets.length > 0) {
        return cacheSets
      }

      const privilegeSets = await UserPrivilegeSetModel.findAll({
        order: [['order', 'ASC']],
      })

      void this.setAllToCache(privilegeSets)

      return privilegeSets
    } catch (err) {
      const msg = (err as Error).message || 'Error getting privilege sets'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async updatePrivilegeSet(id: string, payload: UpdatePrivilegeSetPayloadType) {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No id supplied'),
      )
    }

    const { description, name, order } = payload

    const set = await UserPrivilegeSetModel.findByPk(id)
    if (!set) {
      throw new Error('No Privilege Set Found!')
    }

    try {
      if (description !== undefined) {
        set.setDataValue('description', description)
      }
      if (name !== undefined) {
        set.setDataValue('name', name)
      }
      if (order !== undefined) {
        set.setDataValue('order', order)
      }

      await set.save()

      const cache = new UserPrivilegeSetCache()
      await cache.setCache(set.name, set.toJSON())

      return set
    } catch (err) {
      const msg = (err as Error).message || 'Error updating privilege set'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type UserPrivilegeServiceType = typeof UserPrivilegeService.prototype
