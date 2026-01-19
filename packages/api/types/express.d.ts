import type { UserSessionType } from '@dx3/api-libs/user/user-api.types'
import type { Fields, File } from 'formidable'

// Augment Express Request type using module augmentation
// This is the proper way to extend Express types when imports are needed
declare module 'express-serve-static-core' {
  interface Request {
    fingerprint?: string
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
