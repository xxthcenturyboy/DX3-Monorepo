import type { Fields, File } from 'formidable'
import type { CityResponse } from 'maxmind'

import type { UserSessionType } from '@dx3/api-libs/user/user-api.types'

// Augment Express Request type using module augmentation
// This is the proper way to extend Express types when imports are needed
declare module 'express-serve-static-core' {
  interface Request {
    fingerprint?: string
    geo?: CityResponse
    uploads?: {
      err?: {
        httpCode?: number
        message: string
      }
      fields?: Fields<string>
      files?: File[]
      uploadId?: string
    }
    user?: UserSessionType
  }
}
