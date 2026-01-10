import { ERROR_CODES } from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { createApiErrorMessage } from '../utils'
import { ShortLinkModel } from './shortlink-api.postgres-model'
export class ShortlinkService {
  logger: ApiLoggingClassType

  constructor() {
    this.logger = ApiLoggingClass.instance
  }

  public async getShortlinkTarget(id: string) {
    if (!id) {
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    try {
      const path = await ShortLinkModel.getShortLinkTarget(id)
      if (path) {
        return path
      }
    } catch (err) {
      const msg = (err as Error).message
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }

    return null
  }
}

export type ShortlinkServiceType = typeof ShortlinkService.prototype
