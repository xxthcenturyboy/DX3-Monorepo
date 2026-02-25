import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { send400, sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'
import { logRequest } from '@dx3/api-libs/logger/log-request.util'
import { MediaApiService } from '@dx3/api-libs/media/media-api.service'
import { MetricsService } from '@dx3/api-libs/metrics/metrics-api.service'
import {
  MEDIA_SUB_TYPES,
  METRIC_FEATURE_NAME,
  type MediaDataType,
  type MediaUploadResponseType,
  MIME_TYPES,
  type UploadMediaHandlerParams,
} from '@dx3/models-shared'

export const MediaApiController = {
  getMedia: async (req: Request, res: Response, _next: NextFunction) => {
    const { id, size } = req.params as { id: string; size: string }

    logRequest({ req, type: 'getMedia' })
    try {
      const service = new MediaApiService()
      const key = await service.getContentKey(id, size)
      if (!key) {
        return sendOK(req, res, null)
      }
      await service.getUserContent(key, res)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getMedia' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  getPublicMedia: async (req: Request, res: Response, _next: NextFunction) => {
    const { id, size } = req.params as { id: string; size: string }

    logRequest({ req, type: 'getPublicMedia' })
    try {
      const service = new MediaApiService()
      const meta = await service.getPublicContentMeta(id, size)
      if (!meta) {
        return res.status(StatusCodes.NOT_FOUND).send(null)
      }
      if (meta.mediaType === MIME_TYPES.FILE.PDF) {
        const safeName = meta.originalFileName.replace(/[^\w.-]/g, '_')
        res.set('Content-Disposition', `attachment; filename="${safeName}"`)
      }
      await service.getSystemContent(meta.key, res)
    } catch (err) {
      logRequest({ message: (err as Error)?.message, req, type: 'Failed getPublicMedia' })
      sendBadRequest(req, res, (err as Error).message)
    }
  },

  uploadContent: async (req: Request, res: Response, _next: NextFunction) => {
    const { err: uploadErr, fields, files, uploadId } = req.uploads
    logRequest({ req, type: 'uploadContent' })
    const service = new MediaApiService()

    const results: Partial<MediaUploadResponseType>[] = []

    if (uploadErr) {
      await service.clearUpload(uploadId)

      send400(res, {
        message: uploadErr.message || '',
        status: uploadErr.httpCode || StatusCodes.BAD_REQUEST,
      })

      return
    }

    const fileMeta: Partial<UploadMediaHandlerParams> = {
      altText: '',
      isPrimary: false,
      mediaSubType: '',
      ownerId: req.user?.id || 'missing-user-id',
      uploadId: req.uploads?.uploadId,
    }

    const fieldKeys = Object.keys(fields)
    for (const key of fieldKeys) {
      const value = fields[key][0]
      if (key === 'altText') {
        fileMeta.altText = value
        continue
      }
      if (key === 'mediaSubType') {
        fileMeta.mediaSubType = value
        if (value === MEDIA_SUB_TYPES.PROFILE_IMAGE) {
          fileMeta.isPrimary = true
        }
        continue
      }
      if (key === 'isPrimary' && !fileMeta.isPrimary) {
        fileMeta.isPrimary = typeof value === 'string' ? value === 'true' : false
      }
      if (key === 'public') {
        fileMeta.public = typeof value === 'string' ? value === 'true' : false
      }
      if (key === 'ownerId') {
        fileMeta.ownerId = value
      }
    }

    const promises: Promise<{
      body: Partial<MediaDataType>
      status: number
    }>[] = []

    for (const file of files) {
      if (!file || typeof file !== 'object') {
        continue
      }

      if (file.size === 0) {
        results.push({
          data: {},
          msg: 'File size is 0',
          ok: false,
        })

        continue
      }

      if (!file.filepath) {
        results.push({
          data: {},
          msg: 'Missing File Path',
          ok: false,
        })

        continue
      }

      const data: Partial<UploadMediaHandlerParams> = {
        filePath: '',
        fileSize: 0,
        mimeType: '',
        newFilename: '',
        originalFilename: '',
      }

      if (file.filepath) {
        data.filePath = file.filepath
      }
      if (file.mimetype) {
        data.mimeType = file.mimetype
      }
      if (file.size) {
        data.fileSize = file.size
      }
      if (file.originalFilename) {
        data.originalFilename = file.originalFilename
      }
      if (file.newFilename) {
        data.newFilename = file.newFilename
      }

      promises.push(
        service.contentUpload({
          ...fileMeta,
          ...data,
        } as UploadMediaHandlerParams),
      )
    }

    try {
      const parallelResults = await Promise.all(promises)

      for (const result of parallelResults) {
        if (result.status !== 200) {
          results.push({
            data: result.body,
            ok: false,
          })
        }

        if (result.status === 200) {
          results.push({
            data: result.body,
            ok: true,
          })
        }
      }
    } catch (err) {
      results.push({
        data: {},
        msg: (err as Error).message,
        ok: false,
      })
    }

    if (uploadId) {
      void service.clearUpload(uploadId)
    }

    // Record media upload feature usage
    const successfulUploads = results.filter((r) => r.ok).length
    if (successfulUploads > 0) {
      void MetricsService.instance?.recordFeatureUsage({
        context: {
          fileCount: successfulUploads,
          mediaSubType: fileMeta.mediaSubType,
        },
        featureName: METRIC_FEATURE_NAME.MEDIA_UPLOAD,
        req,
      })
    }

    sendOK(req, res, results)
  },
}

export type MediaApiControllerType = typeof MediaApiController
