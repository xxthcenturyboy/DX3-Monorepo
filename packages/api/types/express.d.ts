import type { Fields, File } from 'formidable'

import type { UserSessionType } from '@dx3/api-libs/user/user-api.types'

// Augment Express Request type using module augmentation
// This is the proper way to extend Express types when imports are needed
declare module 'express-serve-static-core' {
  interface Request {
    uploads?: {
      fields?: Fields<string>
      files?: File[]
      uploadId?: string
      err?: {
        httpCode?: number
        message: string
      }
    }
    user?: UserSessionType
  }
}
