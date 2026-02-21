import type internal from 'node:stream'
import { PassThrough } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import dayjs from 'dayjs'
import type { NextFunction, Request, Response } from 'express'
import type { Fields, File, Part } from 'formidable'
import formidable from 'formidable'
import type IncomingForm from 'formidable/Formidable'
import type VolatileFile from 'formidable/VolatileFile'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidV4 } from 'uuid'

import {
  ERROR_CODES,
  MEDIA_MAX_FILE_SIZE_BYTES,
  MEDIA_MAX_FILES_PER_UPLOAD,
  S3_BUCKETS,
} from '@dx3/models-shared'

import { S3_APP_BUCKET_NAME } from '../config/config-api.consts'
import { getEnvironment, isDebug } from '../config/config-api.service'
import { ApiLoggingClass } from '../logger'
import { S3Service } from '../s3'
import { createApiErrorMessage } from '../utils/lib/error/api-error.utils'
import { getAllowedFileTypesMessage, isAllowedMimeType } from './media-api.allowed-types'

type UploadResultType = {
  fields: Fields<string>
  files: File[]
}

export const UploadMiddleware = {
  _sendToS3: async (
    formData: IncomingForm,
    s3Uploads: Promise<void>[],
    req: Request,
  ): Promise<UploadResultType> => {
    const uploadResult = await new Promise<UploadResultType>((resolve, reject) => {
      let formidableError: unknown

      if (!formData) {
        req.uploads = {
          err: {
            httpCode: StatusCodes.BAD_REQUEST,
            message: 'No data sent',
          },
        }
        reject('form not defined in formidable')
      }

      formData.parse(req, (err, fields, files) => {
        if (err) {
          formidableError = err
        }

        Promise.all(s3Uploads)
          .then(() => {
            let filesArray: File[] = []

            if (Object.hasOwn(files, 'file')) {
              filesArray = files.file
            }

            if (Object.hasOwn(files, 'files')) {
              filesArray = files.files
            }

            if (!formidableError) {
              resolve({
                fields,
                files: filesArray,
              })

              return
            }

            reject(formidableError)
          })
          .catch((err) => {
            reject(formidableError || err)
          })
      })
    })

    return uploadResult
  },

  _streamHandler: (
    bucketTmp: string,
    uploadId: string,
    s3Uploads: Promise<void>[],
    passThrough: PassThrough,
    file?: VolatileFile,
  ): internal.Writable => {
    if (file) {
      const env = getEnvironment()
      const fileName = (file as unknown as File).originalFilename
      const contentType = (file as unknown as File).mimetype

      if (fileName && contentType) {
        try {
          const s3Client = S3Service.getS3Client({
            accessKeyId: env.S3_ACCESS_KEY_ID,
            endpoint: env.S3_ENDPOINT,
            provider: env.S3_PROVIDER,
            region: env.S3_REGION,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          })

          const upload = new Upload({
            client: s3Client,
            params: {
              Body: passThrough,
              Bucket: bucketTmp,
              ContentType: contentType,
              Key: `${uploadId}/${fileName}`,
              // ACL: 'public-read',
            },
          })

          const uploadRequest = upload
            .done()
            .then(async (response) => {
              if (response.Location) {
                ;(file as unknown as File).filepath = response.Location
              }
            })
            .catch((err) => ApiLoggingClass.instance.logError(err))

          s3Uploads.push(uploadRequest)
        } catch (err) {
          ApiLoggingClass.instance.logError(err)
        }
      }
    }

    return passThrough
  },

  multipleFiles: async (req: Request, _res: Response, next: NextFunction) => {
    if (!isDebug() && !req.user?.id) {
      req.uploads = {
        err: {
          httpCode: StatusCodes.FORBIDDEN,
          message: 'User not allowed.',
        },
      }
      return next()
    }

    const uploadId = `${uuidV4()}-${dayjs().valueOf()}`
    const s3Uploads: Promise<void>[] = []

    try {
      const formData: IncomingForm = formidable({
        fileWriteStreamHandler: (file?: VolatileFile): internal.Writable => {
          const passThrough = new PassThrough({ allowHalfOpen: false })
          const bucketName = `${S3_APP_BUCKET_NAME}-${S3_BUCKETS.UPLOAD_TMP}`

          if (file) {
            return UploadMiddleware._streamHandler(
              bucketName,
              uploadId,
              s3Uploads,
              passThrough,
              file,
            )
          }

          return passThrough
        },
        // Validate file types before processing
        filter: ({ mimetype, originalFilename }: Part): boolean => {
          if (!isAllowedMimeType(mimetype)) {
            ApiLoggingClass.instance.logWarn(
              `Rejected file upload: "${originalFilename}" with type "${mimetype}". ` +
                `Allowed types: ${getAllowedFileTypesMessage()}`,
            )
            return false
          }
          return true
        },
        maxFileSize: MEDIA_MAX_FILE_SIZE_BYTES,
        maxFiles: MEDIA_MAX_FILES_PER_UPLOAD,
        multiples: true,
      })

      const uploadResult = await UploadMiddleware._sendToS3(formData, s3Uploads, req)

      if (uploadResult) {
        req.uploads = {
          ...uploadResult,
          uploadId: uploadId,
        }
      }

      next()
    } catch (err) {
      let message = typeof err === 'string' ? err : (err as Error).message || ''

      if (message.includes('maxFiles')) {
        message = createApiErrorMessage(
          ERROR_CODES.MEDIA_FILE_COUNT_EXCEEDED,
          'File upload count exceeded.',
        )
      }

      if (message.includes('maxTotalFileSize')) {
        message = createApiErrorMessage(
          ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
          'File size limit exceeded.',
        )
      }

      req.uploads = {
        err: {
          httpCode: err.httpCode || StatusCodes.PRECONDITION_FAILED,
          message: message,
        },
        uploadId: uploadId,
      }
      next()
    }
  },
  singleFile: async (req: Request, _res: Response, next: NextFunction) => {
    if (!isDebug() && !req.user?.id) {
      req.uploads = {
        err: {
          httpCode: StatusCodes.FORBIDDEN,
          message: 'User not allowed.',
        },
      }
      return next()
    }

    const uploadId = `${uuidV4()}-${dayjs().valueOf()}`
    const s3Uploads: Promise<void>[] = []

    try {
      const formData: IncomingForm = formidable({
        fileWriteStreamHandler: (file?: VolatileFile): internal.Writable => {
          const passThrough = new PassThrough({ allowHalfOpen: false })
          const bucketName = `${S3_APP_BUCKET_NAME}-${S3_BUCKETS.UPLOAD_TMP}`

          if (file) {
            return UploadMiddleware._streamHandler(
              bucketName,
              uploadId,
              s3Uploads,
              passThrough,
              file,
            )
          }

          return passThrough
        },
        // Validate file types before processing
        filter: ({ mimetype, originalFilename }: Part): boolean => {
          if (!isAllowedMimeType(mimetype)) {
            ApiLoggingClass.instance.logWarn(
              `Rejected file upload: "${originalFilename}" with type "${mimetype}". ` +
                `Allowed types: ${getAllowedFileTypesMessage()}`,
            )
            return false
          }
          return true
        },
        maxFileSize: MEDIA_MAX_FILE_SIZE_BYTES,
        maxFiles: 1,
        multiples: false,
      })

      const uploadResult = await UploadMiddleware._sendToS3(formData, s3Uploads, req)

      if (uploadResult) {
        req.uploads = {
          ...uploadResult,
          uploadId: uploadId,
        }
      }

      next()
    } catch (err) {
      let message = typeof err === 'string' ? err : (err as Error).message || ''

      if (message.includes('maxFiles')) {
        message = createApiErrorMessage(
          ERROR_CODES.MEDIA_FILE_COUNT_EXCEEDED,
          'File upload count exceeded.',
        )
      }

      if (message.includes('maxTotalFileSize')) {
        message = createApiErrorMessage(
          ERROR_CODES.MEDIA_FILE_SIZE_EXCEEDED,
          'File size limit exceeded.',
        )
      }

      req.uploads = {
        err: {
          httpCode: err.httpCode || StatusCodes.PRECONDITION_FAILED,
          message: message,
        },
        uploadId: uploadId,
      }
      next()
    }
  },
}
