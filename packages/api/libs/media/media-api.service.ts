// import { Metadata } from 'sharp';
import type { Readable } from 'node:stream'
import type { Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

import { dxHashAnyToString } from '@dx3/encryption/src'
import {
  ERROR_CODES,
  type ImageResizeMediaType,
  MEDIA_SUB_TYPES,
  MEDIA_TYPE_BY_MIME_TYPE_MAP,
  MEDIA_TYPES,
  MEDIA_VARIANTS,
  type MediaDataType,
  MIME_TYPE_BY_SUB_TYPE,
  S3_BUCKETS,
  type UploadMediaHandlerParams,
} from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID } from '@dx3/test-data'

import {
  S3_ACCESS_KEY_ID,
  S3_APP_BUCKET_NAME,
  S3_SECRET_ACCESS_KEY,
} from '../config/config-api.consts'
import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import { S3Service, type S3ServiceType } from '../s3'
import { createApiErrorMessage, stream2buffer } from '../utils'
import { MediaModel } from './media-api.postgres-model'
import {
  MediaApiImageManipulationService,
  type MediaApiImageManipulationServiceType,
} from './media-api-image-manipulation.service'

export class MediaApiService {
  imageManipulationService: MediaApiImageManipulationServiceType
  logger: ApiLoggingClassType
  s3Service: S3ServiceType

  constructor() {
    this.imageManipulationService = new MediaApiImageManipulationService()
    this.logger = ApiLoggingClass.instance
    this.s3Service = new S3Service({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    })
  }

  public async clearUpload(uploadId?: string) {
    if (!uploadId) {
      return false
    }

    try {
      const removed = await this.s3Service.emptyS3Directory(
        `${S3_APP_BUCKET_NAME}-${S3_BUCKETS.UPLOAD_TMP}`,
        uploadId,
      )
      return removed.removed
    } catch (err) {
      this.logger.logError((err as Error).message)
      return false
    }
  }

  private _transformData(media: MediaModel): Partial<MediaDataType> {
    const mediaKeys = Object.keys(media.files || {})

    mediaKeys.forEach((key) => {
      if (media.files?.[key]) {
        const file = media.files[key]
        delete file.bucket
        delete file.key
        delete file.location
        delete file.eTag
      }
    })

    return {
      altText: media.altText,
      files: media.files,
      id: media.id,
      mediaSubType: media.mediaSubType,
      mediaType: media.mediaType,
      originalFileName: media.originalFileName,
      primary: media.primary,
    }
  }

  private isFileTypeAllowed(mediaSubType: string, mimetype: string) {
    const allowedTypes = MIME_TYPE_BY_SUB_TYPE[mediaSubType]
    if (!Array.isArray(allowedTypes)) {
      return false
    }

    if (allowedTypes.length === 1 && allowedTypes[0] === '*') {
      return true
    }

    for (const type of allowedTypes) {
      if (mimetype.search(type) > -1) {
        return true
      }
    }
    return false
  }

  private async processFile(
    mediaType: string,
    data: UploadMediaHandlerParams,
    file: Readable,
    id: string,
  ) {
    switch (mediaType) {
      case MEDIA_TYPES.ICON:
      case MEDIA_TYPES.SVG:
      case MEDIA_TYPES.GIF: {
        const imageBuffer = await stream2buffer(file)
        const imageMeta = await this.imageManipulationService.getMetaFromBuffer(imageBuffer)
        return [
          {
            asset: await stream2buffer(file),
            format: imageMeta.format,
            height: imageMeta.height,
            id: `${id}_${mediaType}`,
            size: data.fileSize,
            variant: MEDIA_VARIANTS.ORIGINAL,
            width: imageMeta.width,
          },
        ]
      }
      case MEDIA_TYPES.AUDIO:
      case MEDIA_TYPES.FONT:
      case MEDIA_TYPES.PDF:
      case MEDIA_TYPES.VIDEO:
        return [
          {
            asset: await stream2buffer(file),
            format: data.mimeType || '',
            height: 0,
            id: `${id}_${mediaType}`,
            size: data.fileSize,
            variant: MEDIA_VARIANTS.ORIGINAL,
            width: 0,
          },
        ]
      case MEDIA_TYPES.IMAGE: {
        return await this.imageManipulationService.resizeImageStream(id, file)
      }
      default:
        throw new Error(`103 Unsupported file uploaded: ${data.mimeType || 'no file type'}.`)
    }
  }

  public async userContentUpload(data: UploadMediaHandlerParams) {
    if (!data.mediaSubType || !data.filePath || !data.mimeType || !data.ownerId || !data.uploadId) {
      await this.clearUpload(data.uploadId)
      throw new Error(
        createApiErrorMessage(ERROR_CODES.GENERIC_VALIDATION_FAILED, 'No value supplied'),
      )
    }

    if (!this.isFileTypeAllowed(data.mediaSubType, data.mimeType)) {
      await this.clearUpload(data.uploadId)
      throw new Error(createApiErrorMessage(ERROR_CODES.MEDIA_INVALID_TYPE, 'Incorrect file type'))
    }
    const id = uuidv4()
    const ASSET_SUB_TYPE = data.mediaSubType.toLowerCase()
    const BUCKET = `${S3_APP_BUCKET_NAME}-${S3_BUCKETS.USER_CONTENT}`
    const KEY = `${data.ownerId}/${ASSET_SUB_TYPE}/${id}`
    const tagging = data.ownerId === TEST_EXISTING_USER_ID ? 'test-user=true' : undefined

    const moved = await this.s3Service.moveObject(
      `/${S3_APP_BUCKET_NAME}-${S3_BUCKETS.UPLOAD_TMP}/${data.uploadId}/${encodeURIComponent(data.originalFilename)}`,
      BUCKET,
      KEY,
      undefined,
      tagging,
    )

    if (moved) {
      await this.clearUpload(data.uploadId)
    }

    const mediaType = MEDIA_TYPE_BY_MIME_TYPE_MAP[data.mimeType]
    const hashedFilenameMimeType = dxHashAnyToString(`${data.originalFilename}${data.mimeType}`)

    const file = await this.s3Service.getObject(BUCKET, KEY)

    const processedFiles: ImageResizeMediaType[] = await this.processFile(
      mediaType,
      data,
      file as Readable,
      id,
    )

    const s3Promises = processedFiles.map(
      async (file) =>
        await this.s3Service.uploadObject(
          BUCKET,
          `${data.ownerId}/${ASSET_SUB_TYPE}/${file.id}`,
          file.asset as Buffer,
          data.mimeType,
          file.metaData,
        ),
    )

    const uploads = await Promise.all(s3Promises)
    for (let i = 0, max = uploads.length; i < max; i += 1) {
      processedFiles[i].s3UploadedFile = await uploads[i]
    }

    const mediaRecord: MediaDataType = {
      altText: data.altText,
      files: {},
      hashedFilenameMimeType: hashedFilenameMimeType,
      id,
      mediaSubType: ASSET_SUB_TYPE.toUpperCase(),
      mediaType: data.mimeType,
      originalFileName: data.originalFilename,
      ownerId: data.ownerId,
      primary: data.isPrimary || false,
    }

    for (const processedFile of processedFiles) {
      mediaRecord.files[processedFile.variant || 'UNDEFINED'] = {
        bucket: processedFile.s3UploadedFile?.Bucket,
        eTag: processedFile.s3UploadedFile?.ETag,
        format: processedFile.format,
        height: processedFile.height,
        key: processedFile.s3UploadedFile?.Key,
        location: processedFile.s3UploadedFile?.Location,
        size: processedFile.size,
        width: processedFile.width,
      }
    }

    try {
      if (data.mediaSubType === MEDIA_SUB_TYPES.PROFILE_IMAGE && data.isPrimary) {
        const existingPrimary = await MediaModel.findPrimaryProfile(data.ownerId)
        if (existingPrimary) {
          existingPrimary.primary = false
          await existingPrimary.save()
        }
      }
      const saveResult = await MediaModel.create(mediaRecord)
      return {
        body: this._transformData(saveResult),
        status: 200,
      }
    } catch (err) {
      const msg = (err as Error).message || 'File could not be uploaded.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.MEDIA_UPLOAD_FAILED, msg))
    }
  }

  public async getContentKey(id: string, variant: string) {
    try {
      const media = await MediaModel.findByPk(id)
      if (!media || !media.files[variant]) {
        return
      }

      return media.files[variant].key
    } catch (err) {
      const msg = (err as Error).message || 'Could not retrieve key.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }

  public async getUserContent(key: string, res: Response) {
    try {
      await this.s3Service.getObject(`${S3_APP_BUCKET_NAME}-${S3_BUCKETS.USER_CONTENT}`, key, res)
    } catch (err) {
      const msg = (err as Error).message || 'Could not get file.'
      this.logger.logError(msg)
      throw new Error(createApiErrorMessage(ERROR_CODES.GENERIC_SERVER_ERROR, msg))
    }
  }
}

export type MediaApiServiceType = typeof MediaApiService.prototype
