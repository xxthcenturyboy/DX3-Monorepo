import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { S3Service } from '@dx3/api-libs/s3'
import { S3_BUCKETS } from '@dx3/models-shared'

import {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  S3_APP_BUCKET_NAME,
} from '../../config/config-api.consts'

export class DxS3Class {
  public static async initializeS3() {
    const logger = ApiLoggingClass.instance

    try {
      const service = new S3Service({
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      })
      if (!service) {
        logger.logError('S3 Service did not instantiate correctly. S3 unavailable')
        return false
      }

      await service.instantiate(S3_APP_BUCKET_NAME, Object.values(S3_BUCKETS))
      logger.logInfo('S3 Connected successfully')
      return true
    } catch (err) {
      logger.logError((err as Error).message, err)
      return false
    }
  }
}
