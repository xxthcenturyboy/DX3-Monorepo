import type {
  NextFunction as INextFunction,
  Request as IRequest,
  Response as IResponse,
} from 'express'
import type { File as FormidableFile } from 'formidable'
import { StatusCodes } from 'http-status-codes'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { send400, sendBadRequest, sendOK } from '@dx3/api-libs/http-response/http-responses'

import { MediaApiController } from './media-api.controller'

const mockMediaServiceInstance = {
  clearUpload: jest.fn(),
  contentUpload: jest.fn(),
  getContentKey: jest.fn(),
  getPublicContentMeta: jest.fn(),
  getSystemContent: jest.fn(),
  getUserContent: jest.fn(),
}

jest.mock('@dx3/api-libs/media/media-api.service', () => ({
  MediaApiService: jest.fn(() => mockMediaServiceInstance),
}))
jest.mock('@dx3/api-libs/metrics/metrics-api.service', () => ({
  MetricsService: {
    instance: null,
  },
}))
jest.mock('@dx3/api-libs/http-response/http-responses', () => ({
  send400: jest.fn(),
  sendBadRequest: jest.fn(),
  sendOK: jest.fn(),
}))
jest.mock('@dx3/api-libs/logger/log-request.util', () => ({
  logRequest: jest.fn(),
}))

describe('MediaApiController', () => {
  let req: IRequest
  let res: IResponse
  let next: INextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    next = jest.fn() as unknown as INextFunction
    req.params = {}
  })

  it('should exist when imported', () => {
    expect(MediaApiController).toBeDefined()
  })

  it('should have getMedia method', () => {
    expect(MediaApiController.getMedia).toBeDefined()
  })

  it('should have getPublicMedia method', () => {
    expect(MediaApiController.getPublicMedia).toBeDefined()
  })

  it('should have uploadContent method', () => {
    expect(MediaApiController.uploadContent).toBeDefined()
  })

  // ─── getMedia ──────────────────────────────────────────────────────────────

  describe('getMedia', () => {
    it('should call sendOK with null when content key is not found', async () => {
      // arrange
      mockMediaServiceInstance.getContentKey.mockResolvedValueOnce(null)
      req.params = { id: 'media-1', size: 'original' }
      // act
      await MediaApiController.getMedia(req, res, next)
      // assert
      expect(sendOK).toHaveBeenCalledWith(req, res, null)
    })

    it('should call getUserContent when key is found', async () => {
      // arrange
      mockMediaServiceInstance.getContentKey.mockResolvedValueOnce('s3-key')
      mockMediaServiceInstance.getUserContent.mockResolvedValueOnce(undefined)
      req.params = { id: 'media-1', size: 'original' }
      // act
      await MediaApiController.getMedia(req, res, next)
      // assert
      expect(mockMediaServiceInstance.getUserContent).toHaveBeenCalledWith('s3-key', res)
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockMediaServiceInstance.getContentKey.mockRejectedValueOnce(new Error('S3 error'))
      req.params = { id: 'media-1', size: 'original' }
      // act
      await MediaApiController.getMedia(req, res, next)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── getPublicMedia ────────────────────────────────────────────────────────

  describe('getPublicMedia', () => {
    it('should respond with 404 when public content meta is not found', async () => {
      // arrange
      mockMediaServiceInstance.getPublicContentMeta.mockResolvedValueOnce(null)
      req.params = { id: 'media-1', size: 'original' }
      const mockStatus = jest.fn().mockReturnValue({ send: jest.fn() })
      res.status = mockStatus as unknown as IResponse['status']
      // act
      await MediaApiController.getPublicMedia(req, res, next)
      // assert
      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)
    })

    it('should call getSystemContent when meta is found', async () => {
      // arrange
      const mockMeta = { key: 's3-key', mediaType: 'image/jpeg', originalFileName: 'photo.jpg' }
      mockMediaServiceInstance.getPublicContentMeta.mockResolvedValueOnce(mockMeta)
      mockMediaServiceInstance.getSystemContent.mockResolvedValueOnce(undefined)
      req.params = { id: 'media-1', size: 'original' }
      // act
      await MediaApiController.getPublicMedia(req, res, next)
      // assert
      expect(mockMediaServiceInstance.getSystemContent).toHaveBeenCalledWith('s3-key', res)
    })

    it('should set Content-Disposition header for PDF files', async () => {
      // arrange
      const mockMeta = {
        key: 's3-key',
        mediaType: 'application/pdf',
        originalFileName: 'my document.pdf',
      }
      mockMediaServiceInstance.getPublicContentMeta.mockResolvedValueOnce(mockMeta)
      mockMediaServiceInstance.getSystemContent.mockResolvedValueOnce(undefined)
      req.params = { id: 'media-1', size: 'original' }
      const mockSet = jest.fn()
      res.set = mockSet as unknown as IResponse['set']
      // act
      await MediaApiController.getPublicMedia(req, res, next)
      // assert
      expect(mockSet).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename='),
      )
    })

    it('should call sendBadRequest when service throws', async () => {
      // arrange
      mockMediaServiceInstance.getPublicContentMeta.mockRejectedValueOnce(new Error('S3 error'))
      req.params = { id: 'media-1', size: 'original' }
      // act
      await MediaApiController.getPublicMedia(req, res, next)
      // assert
      expect(sendBadRequest).toHaveBeenCalled()
    })
  })

  // ─── uploadContent ─────────────────────────────────────────────────────────

  describe('uploadContent', () => {
    it('should call send400 and clearUpload when uploadErr is present', async () => {
      // arrange
      const mockUploadErr = { httpCode: StatusCodes.BAD_REQUEST, message: 'File too large' }
      req.uploads = { err: mockUploadErr, fields: {}, files: [], uploadId: 'upload-1' }
      mockMediaServiceInstance.clearUpload.mockResolvedValueOnce(undefined)
      // act
      await MediaApiController.uploadContent(req, res, next)
      // assert
      expect(mockMediaServiceInstance.clearUpload).toHaveBeenCalledWith('upload-1')
      expect(send400).toHaveBeenCalled()
    })

    it('should push a zero-size error result when a file has size 0', async () => {
      // arrange
      req.uploads = {
        err: null,
        fields: {},
        files: [
          {
            filepath: '/tmp/file',
            newFilename: 'abc',
            originalFilename: 'img.jpg',
            size: 0,
          } as FormidableFile,
        ],
        uploadId: 'upload-1',
      }
      // act
      await MediaApiController.uploadContent(req, res, next)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.arrayContaining([expect.objectContaining({ msg: 'File size is 0', ok: false })]),
      )
    })

    it('should push a missing-filepath error result when file has no filepath', async () => {
      // arrange
      req.uploads = {
        err: null,
        fields: {},
        files: [
          {
            filepath: '',
            newFilename: 'abc',
            originalFilename: 'img.jpg',
            size: 100,
          } as FormidableFile,
        ],
        uploadId: 'upload-1',
      }
      // act
      await MediaApiController.uploadContent(req, res, next)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.arrayContaining([expect.objectContaining({ msg: 'Missing File Path', ok: false })]),
      )
    })

    it('should call contentUpload and return success results for valid files', async () => {
      // arrange
      mockMediaServiceInstance.contentUpload.mockResolvedValueOnce({
        body: { id: 'media-1' },
        status: 200,
      })
      req.uploads = {
        err: null,
        fields: { mediaSubType: ['profile_image'] },
        files: [
          {
            filepath: '/tmp/file.jpg',
            mimetype: 'image/jpeg',
            newFilename: 'abc',
            originalFilename: 'photo.jpg',
            size: 1024,
          } as FormidableFile,
        ],
        uploadId: 'upload-1',
      }
      // act
      await MediaApiController.uploadContent(req, res, next)
      // assert
      expect(mockMediaServiceInstance.contentUpload).toHaveBeenCalled()
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.arrayContaining([expect.objectContaining({ ok: true })]),
      )
    })

    it('should push error result when contentUpload returns non-200 status', async () => {
      // arrange
      mockMediaServiceInstance.contentUpload.mockResolvedValueOnce({
        body: { error: 'Invalid type' },
        status: 400,
      })
      req.uploads = {
        err: null,
        fields: {},
        files: [
          {
            filepath: '/tmp/file.jpg',
            mimetype: 'image/jpeg',
            newFilename: 'abc',
            originalFilename: 'photo.jpg',
            size: 512,
          } as FormidableFile,
        ],
        uploadId: 'upload-1',
      }
      // act
      await MediaApiController.uploadContent(req, res, next)
      // assert
      expect(sendOK).toHaveBeenCalledWith(
        req,
        res,
        expect.arrayContaining([expect.objectContaining({ ok: false })]),
      )
    })
  })
})
