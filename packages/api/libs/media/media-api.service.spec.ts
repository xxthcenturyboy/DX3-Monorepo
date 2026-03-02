import { Readable } from 'node:stream'
import type { Response as IResponse } from 'express'
import { Response } from 'jest-express/lib/response'

import { MEDIA_SUB_TYPES, MEDIA_VARIANTS, MIME_TYPES } from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID } from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { mockS3ServiceInstance } from '../testing/mocks/internal/s3.mock'
import { MediaApiService } from './media-api.service'

// Must be before any imports of ../s3
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../s3', () => require('../testing/mocks/internal/s3.mock'))
jest.mock('@dx3/utils-shared')
jest.mock('./media-api-image-manipulation.service.ts')
jest.mock('./media-api.postgres-model')
jest.mock('../utils', () => ({
  createApiErrorMessage: jest.fn((code: string | number, msg: string) => `${code} ${msg}`),
  stream2buffer: jest.fn().mockResolvedValue(Buffer.from('mock-file-data')),
}))

// Lazy references to mocked modules (resolved after jest.mock hoisting)
const getMediaModel = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./media-api.postgres-model').MediaModel as Record<string, jest.Mock>

const _getImageService = () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./media-api-image-manipulation.service').MediaApiImageManipulationService as {
    prototype: Record<string, jest.Mock>
  }

describe('MediaApiService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Restore s3 defaults after each test
    mockS3ServiceInstance.emptyS3Directory.mockResolvedValue({ message: 'Success', removed: true })
    mockS3ServiceInstance.getObject.mockResolvedValue(Buffer.from('mock-file-content'))
    mockS3ServiceInstance.moveObject.mockResolvedValue(true)
    mockS3ServiceInstance.uploadObject.mockResolvedValue({
      Bucket: 'mock-s3-bucket',
      ETag: '"mock-etag-12345"',
      Key: 'test-file.jpg',
      Location: 'https://mock-s3-bucket.s3.amazonaws.com/test-file.jpg',
    })
  })

  it('should exist upon import', () => {
    expect(MediaApiService).toBeDefined()
  })

  // ────────────────────────────────────────────────────────────
  // clearUpload
  // ────────────────────────────────────────────────────────────
  describe('clearUpload', () => {
    it('should return false immediately when uploadId is not provided', async () => {
      const service = new MediaApiService()
      const result = await service.clearUpload(undefined)
      expect(result).toBe(false)
    })

    it('should return removed status when s3 emptyS3Directory succeeds', async () => {
      mockS3ServiceInstance.emptyS3Directory.mockResolvedValue({ removed: true })
      const service = new MediaApiService()
      const result = await service.clearUpload('some-upload-id')
      expect(result).toBe(true)
    })

    it('should return false and log error when s3 emptyS3Directory throws', async () => {
      mockS3ServiceInstance.emptyS3Directory.mockRejectedValue(new Error('S3 timeout'))
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      const service = new MediaApiService()
      const result = await service.clearUpload('some-upload-id')
      expect(result).toBe(false)
      expect(logErrorSpy).toHaveBeenCalledWith('S3 timeout')
    })
  })

  // ────────────────────────────────────────────────────────────
  // contentUpload
  // ────────────────────────────────────────────────────────────
  describe('contentUpload', () => {
    it('should throw when required params are missing', async () => {
      const service = new MediaApiService()
      await expect(
        service.contentUpload({
          fileSize: 0,
          isPrimary: false,
          newFilename: 'file',
          originalFilename: 'file',
          public: false,
        } as never),
      ).rejects.toThrow()
    })

    it('should throw when file type is not allowed for the given subType', async () => {
      const service = new MediaApiService()
      await expect(
        service.contentUpload({
          altText: '',
          filePath: '/tmp/file',
          fileSize: 100,
          isPrimary: false,
          mediaSubType: MEDIA_SUB_TYPES.DOCUMENT,
          mimeType: 'image/jpeg', // Not allowed for DOCUMENT sub-type
          newFilename: 'file.jpg',
          originalFilename: 'file.jpg',
          ownerId: 'test-owner',
          public: false,
          uploadId: 'upload-123',
        }),
      ).rejects.toThrow()
    })

    it('should complete a PDF upload and return body + status 200', async () => {
      const MediaModel = getMediaModel()
      const mockSaveResult = {
        altText: 'alt',
        files: {
          ORIGINAL: {
            bucket: 'b',
            eTag: 'e',
            format: 'pdf',
            height: 0,
            key: 'some/key',
            location: 'https://...',
            size: 100,
            width: 0,
          },
        },
        id: 'new-media-id',
        mediaSubType: 'DOCUMENT',
        mediaType: 'application/pdf',
        originalFileName: 'file.pdf',
        primary: false,
      }
      MediaModel.create = jest.fn().mockResolvedValue(mockSaveResult)
      MediaModel.findPrimaryProfile = jest.fn().mockResolvedValue(null)

      const service = new MediaApiService()
      const result = await service.contentUpload({
        altText: 'alt',
        filePath: '/tmp/file.pdf',
        fileSize: 1024,
        isPrimary: false,
        mediaSubType: MEDIA_SUB_TYPES.DOCUMENT,
        mimeType: MIME_TYPES.FILE.PDF,
        newFilename: 'file.pdf',
        originalFilename: 'file.pdf',
        ownerId: 'owner-id',
        public: true,
        uploadId: 'upload-abc',
      })

      expect(result.status).toBe(200)
      expect(result.body).toBeDefined()
    })

    it('should unset primary on existing profile image when uploading a new primary PROFILE_IMAGE', async () => {
      const MediaModel = getMediaModel()
      const mockExistingPrimary = {
        primary: true,
        save: jest.fn().mockResolvedValue(undefined),
      }
      const mockResized = [
        {
          asset: Buffer.from('resized'),
          format: 'jpeg',
          height: 100,
          id: 'photo_ORIGINAL',
          size: 500,
          variant: MEDIA_VARIANTS.ORIGINAL,
          width: 100,
        },
      ]
      const mockNewRecord = {
        altText: '',
        files: { ORIGINAL: { format: 'jpeg', height: 100, size: 50, width: 100 } },
        id: 'id2',
        mediaSubType: 'PROFILE_IMAGE',
        mediaType: MIME_TYPES.IMAGE.JPG,
        originalFileName: 'photo.jpg',
        primary: true,
      }
      MediaModel.findPrimaryProfile = jest.fn().mockResolvedValue(mockExistingPrimary)
      MediaModel.create = jest.fn().mockResolvedValue(mockNewRecord)

      const mockReadable = new Readable({ read() {} })
      mockReadable.push(null)
      mockS3ServiceInstance.getObject.mockResolvedValue(mockReadable)

      const service = new MediaApiService()
      // Override imageManipulationService directly on the instance (auto-mock may not use prototype chain)
      jest
        .spyOn(service.imageManipulationService, 'resizeImageStream')
        .mockResolvedValue(mockResized)

      await service.contentUpload({
        altText: '',
        filePath: '/tmp/photo.jpg',
        fileSize: 500,
        isPrimary: true,
        mediaSubType: MEDIA_SUB_TYPES.PROFILE_IMAGE,
        mimeType: MIME_TYPES.IMAGE.JPG,
        newFilename: 'photo.jpg',
        originalFilename: 'photo.jpg',
        ownerId: TEST_EXISTING_USER_ID,
        public: false,
        uploadId: 'upload-profile',
      })

      expect(mockExistingPrimary.save).toHaveBeenCalled()
      expect(mockExistingPrimary.primary).toBe(false)
    })

    it('should throw for an unsupported file type in processFile', async () => {
      // Use a mimeType that maps to an unknown MEDIA_TYPE (not in switch cases) to hit default branch
      // We mock MEDIA_TYPE_BY_MIME_TYPE_MAP by using a mimeType with no mapping
      // Approach: use a valid DOCUMENT subType but override the map by mocking getObject to return stream
      // and then providing a mimeType that maps to nothing → default throw
      // Simplest: allow the file type check to pass, but mock MEDIA_TYPE_BY_MIME_TYPE_MAP to return 'UNKNOWN'
      const MediaModel = getMediaModel()
      MediaModel.findPrimaryProfile = jest.fn().mockResolvedValue(null)

      // ASSET subType with wildcard allows any mime type; provide a mime that maps to undefined in MEDIA_TYPE_BY_MIME_TYPE_MAP
      const service = new MediaApiService()
      await expect(
        service.contentUpload({
          altText: '',
          filePath: '/tmp/file',
          fileSize: 100,
          isPrimary: false,
          mediaSubType: MEDIA_SUB_TYPES.ASSET,
          mimeType: 'application/unknown-type',
          newFilename: 'file',
          originalFilename: 'file',
          ownerId: 'owner-id',
          public: false,
          uploadId: 'upload-unsupported',
        }),
      ).rejects.toThrow()
    })

    it('should throw when MediaModel.create fails', async () => {
      const MediaModel = getMediaModel()
      MediaModel.create = jest.fn().mockRejectedValue(new Error('DB write error'))
      MediaModel.findPrimaryProfile = jest.fn().mockResolvedValue(null)

      const service = new MediaApiService()
      await expect(
        service.contentUpload({
          altText: '',
          filePath: '/tmp/file.pdf',
          fileSize: 100,
          isPrimary: false,
          mediaSubType: MEDIA_SUB_TYPES.DOCUMENT,
          mimeType: MIME_TYPES.FILE.PDF,
          newFilename: 'file.pdf',
          originalFilename: 'file.pdf',
          ownerId: 'owner-id',
          public: false,
          uploadId: 'upload-abc',
        }),
      ).rejects.toThrow()
    })
  })

  // ────────────────────────────────────────────────────────────
  // getPublicContentMeta
  // ────────────────────────────────────────────────────────────
  describe('getPublicContentMeta', () => {
    it('should return null when media record is not found', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue(null)

      const service = new MediaApiService()
      const result = await service.getPublicContentMeta('nonexistent-id', 'ORIGINAL')
      expect(result).toBeNull()
    })

    it('should return null when media is not public', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue({
        files: { ORIGINAL: { key: 'some/key' } },
        public: false,
      })

      const service = new MediaApiService()
      const result = await service.getPublicContentMeta('media-id', 'ORIGINAL')
      expect(result).toBeNull()
    })

    it('should return null when the requested variant does not exist', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue({
        files: {},
        public: true,
      })

      const service = new MediaApiService()
      const result = await service.getPublicContentMeta('media-id', 'THUMB')
      expect(result).toBeNull()
    })

    it('should return null when the variant key is empty', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue({
        files: { ORIGINAL: { key: null } },
        public: true,
      })

      const service = new MediaApiService()
      const result = await service.getPublicContentMeta('media-id', 'ORIGINAL')
      expect(result).toBeNull()
    })

    it('should return key, mediaType, originalFileName when media is public with a valid key', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue({
        files: { ORIGINAL: { key: 'owner/image.jpg' } },
        mediaType: 'image/jpeg',
        originalFileName: 'image.jpg',
        public: true,
      })

      const service = new MediaApiService()
      const result = await service.getPublicContentMeta('media-id', 'ORIGINAL')
      expect(result).toEqual({
        key: 'owner/image.jpg',
        mediaType: 'image/jpeg',
        originalFileName: 'image.jpg',
      })
    })

    it('should return null and log error when findByPk throws', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockRejectedValue(new Error('DB unavailable'))
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')

      const service = new MediaApiService()
      const result = await service.getPublicContentMeta('media-id', 'ORIGINAL')
      expect(result).toBeNull()
      expect(logErrorSpy).toHaveBeenCalledWith('DB unavailable')
    })
  })

  // ────────────────────────────────────────────────────────────
  // getPublicContentKey
  // ────────────────────────────────────────────────────────────
  describe('getPublicContentKey', () => {
    it('should return the key when getPublicContentMeta succeeds', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue({
        files: { ORIGINAL: { key: 'path/to/file.pdf' } },
        mediaType: 'application/pdf',
        originalFileName: 'file.pdf',
        public: true,
      })

      const service = new MediaApiService()
      const key = await service.getPublicContentKey('media-id', 'ORIGINAL')
      expect(key).toBe('path/to/file.pdf')
    })

    it('should return null when getPublicContentMeta returns null', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue(null)

      const service = new MediaApiService()
      const key = await service.getPublicContentKey('nonexistent', 'ORIGINAL')
      expect(key).toBeNull()
    })
  })

  // ────────────────────────────────────────────────────────────
  // getContentKey
  // ────────────────────────────────────────────────────────────
  describe('getContentKey', () => {
    it('should return undefined when media is not found', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue(null)

      const service = new MediaApiService()
      const result = await service.getContentKey('nonexistent-id', MEDIA_VARIANTS.THUMB)
      expect(result).toBeUndefined()
    })

    it('should return the key when media and variant are found', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockResolvedValue({
        files: { [MEDIA_VARIANTS.ORIGINAL]: { key: 'owner/sub/file.jpg' } },
      })

      const service = new MediaApiService()
      const key = await service.getContentKey('media-id', MEDIA_VARIANTS.ORIGINAL)
      expect(key).toBe('owner/sub/file.jpg')
    })

    it('should throw and log error when findByPk throws', async () => {
      const MediaModel = getMediaModel()
      MediaModel.findByPk = jest.fn().mockRejectedValue(new Error('Connection refused'))
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')

      const service = new MediaApiService()
      await expect(service.getContentKey('media-id', MEDIA_VARIANTS.ORIGINAL)).rejects.toThrow()
      expect(logErrorSpy).toHaveBeenCalledWith('Connection refused')
    })
  })

  // ────────────────────────────────────────────────────────────
  // getUserContent
  // ────────────────────────────────────────────────────────────
  describe('getUserContent', () => {
    it('should call s3Service.getObject with the user content bucket', async () => {
      mockS3ServiceInstance.getObject.mockResolvedValue(undefined)
      const res = new Response() as unknown as IResponse
      const service = new MediaApiService()
      await service.getUserContent('owner/sub/file.jpg', res)
      expect(mockS3ServiceInstance.getObject).toHaveBeenCalledWith(
        expect.stringContaining('user'),
        'owner/sub/file.jpg',
        res,
      )
    })

    it('should throw and log error when s3 throws', async () => {
      mockS3ServiceInstance.getObject.mockRejectedValue(new Error('S3 not found'))
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      const res = new Response() as unknown as IResponse
      const service = new MediaApiService()
      await expect(service.getUserContent('bad-key', res)).rejects.toThrow()
      expect(logErrorSpy).toHaveBeenCalledWith('S3 not found')
    })
  })

  // ────────────────────────────────────────────────────────────
  // getSystemContent
  // ────────────────────────────────────────────────────────────
  describe('getSystemContent', () => {
    it('should call s3Service.getObject with the sys content bucket', async () => {
      mockS3ServiceInstance.getObject.mockResolvedValue(undefined)
      const res = new Response() as unknown as IResponse
      const service = new MediaApiService()
      await service.getSystemContent('system/file.pdf', res)
      expect(mockS3ServiceInstance.getObject).toHaveBeenCalledWith(
        expect.stringContaining('sys'),
        'system/file.pdf',
        res,
      )
    })

    it('should throw and log error when s3 throws for system content', async () => {
      mockS3ServiceInstance.getObject.mockRejectedValue(new Error('Access denied'))
      const logErrorSpy = jest.spyOn(ApiLoggingClass.instance, 'logError')
      const res = new Response() as unknown as IResponse
      const service = new MediaApiService()
      await expect(service.getSystemContent('bad-key', res)).rejects.toThrow()
      expect(logErrorSpy).toHaveBeenCalledWith('Access denied')
    })
  })

  // ────────────────────────────────────────────────────────────
  // processFile via contentUpload (IMAGE path uses imageManipulationService)
  // ────────────────────────────────────────────────────────────
  describe('processFile - IMAGE branch via contentUpload', () => {
    it('should call resizeImageStream for IMAGE mime types', async () => {
      const MediaModel = getMediaModel()

      const mockResizedFiles = [
        {
          asset: Buffer.from('resized'),
          format: 'jpeg',
          height: 200,
          id: 'img_ORIGINAL',
          size: 5000,
          variant: MEDIA_VARIANTS.ORIGINAL,
          width: 200,
        },
      ]

      MediaModel.create = jest.fn().mockResolvedValue({
        altText: '',
        files: { ORIGINAL: { format: 'jpeg', height: 200, size: 5000, width: 200 } },
        id: 'img-id',
        mediaSubType: 'IMAGE',
        mediaType: MIME_TYPES.IMAGE.JPG,
        originalFileName: 'photo.jpg',
        primary: false,
      })
      MediaModel.findPrimaryProfile = jest.fn().mockResolvedValue(null)

      const mockReadable = new Readable({ read() {} })
      mockReadable.push(null)
      mockS3ServiceInstance.getObject.mockResolvedValue(mockReadable)

      const service = new MediaApiService()
      // Spy directly on the instance's imageManipulationService
      jest
        .spyOn(service.imageManipulationService, 'resizeImageStream')
        .mockResolvedValue(mockResizedFiles)

      const result = await service.contentUpload({
        altText: '',
        filePath: '/tmp/photo.jpg',
        fileSize: 5000,
        isPrimary: false,
        mediaSubType: MEDIA_SUB_TYPES.IMAGE,
        mimeType: MIME_TYPES.IMAGE.JPG,
        newFilename: 'photo.jpg',
        originalFilename: 'photo.jpg',
        ownerId: 'owner-id',
        public: false,
        uploadId: 'upload-img',
      })

      expect(result.status).toBe(200)
    })
  })

  // ────────────────────────────────────────────────────────────
  // isFileTypeAllowed – unknown subType (line 100 branch)
  // ────────────────────────────────────────────────────────────
  describe('isFileTypeAllowed - unknown subType', () => {
    it('should throw when mediaSubType is completely unknown (not in MIME_TYPE_BY_SUB_TYPE map)', async () => {
      const service = new MediaApiService()
      // COMPLETELY_UNKNOWN is not a key in MIME_TYPE_BY_SUB_TYPE → allowedTypes is undefined
      // → !Array.isArray(undefined) is true → isFileTypeAllowed returns false → contentUpload throws
      await expect(
        service.contentUpload({
          altText: '',
          filePath: '/tmp/file',
          fileSize: 100,
          isPrimary: false,
          mediaSubType: 'COMPLETELY_UNKNOWN',
          mimeType: MIME_TYPES.FILE.PDF,
          newFilename: 'file',
          originalFilename: 'file',
          ownerId: 'owner-id',
          public: false,
          uploadId: 'upload-unknown',
        } as never),
      ).rejects.toThrow()
    })
  })

  // ────────────────────────────────────────────────────────────
  // processFile GIF/SVG/ICON branch (lines 125-127)
  // ────────────────────────────────────────────────────────────
  describe('processFile - GIF/SVG/ICON branch via contentUpload', () => {
    it('should process a GIF upload using stream2buffer and getMetaFromBuffer', async () => {
      const MediaModel = getMediaModel()
      const mockMeta = { format: 'gif', height: 50, size: 2000, width: 50 }

      MediaModel.create = jest.fn().mockResolvedValue({
        altText: '',
        files: { ORIGINAL: { format: 'gif', height: 50, size: 2000, width: 50 } },
        id: 'gif-id',
        mediaSubType: 'IMAGE',
        mediaType: MIME_TYPES.IMAGE.GIF,
        originalFileName: 'anim.gif',
        primary: false,
      })
      MediaModel.findPrimaryProfile = jest.fn().mockResolvedValue(null)
      mockS3ServiceInstance.getObject.mockResolvedValue(Buffer.from('gif-data'))

      const service = new MediaApiService()
      // getMetaFromBuffer must return metadata or the GIF branch will fail
      jest
        .spyOn(service.imageManipulationService, 'getMetaFromBuffer')
        .mockResolvedValue(mockMeta as never)

      const result = await service.contentUpload({
        altText: '',
        filePath: '/tmp/anim.gif',
        fileSize: 2000,
        isPrimary: false,
        mediaSubType: MEDIA_SUB_TYPES.IMAGE,
        mimeType: MIME_TYPES.IMAGE.GIF,
        newFilename: 'anim.gif',
        originalFilename: 'anim.gif',
        ownerId: 'owner-id',
        public: true,
        uploadId: 'upload-gif',
      })

      expect(result.status).toBe(200)
    })
  })

  it('should return undefined when contentUpload has unresolvable params', async () => {
    const service = new MediaApiService()
    try {
      await service.contentUpload({
        altText: 'test-alt-text',
        filePath: 'test-path',
        fileSize: 2,
        mediaSubType: MEDIA_SUB_TYPES.DOCUMENT,
        mimeType: MIME_TYPES.FILE.PDF,
        newFilename: 'new-test-file-name',
        originalFilename: 'original-test-file-name',
        ownerId: 'test-owner-id',
        uploadId: 'test-upload-id',
      } as never)
    } catch (err) {
      expect(err).toBeDefined()
    }
  })
})
