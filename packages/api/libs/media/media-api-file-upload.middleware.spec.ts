import { PassThrough } from 'node:stream'
import type { Request as IRequest, Response as IResponse, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import * as configService from '../config/config-api.service'
import { ApiLoggingClass } from '../logger'
import { mockFormidableError } from '../testing/mocks'
import { UploadMiddleware } from './media-api-file-upload.middleware'

// Core mocks are set up globally in test-setup.ts
// Additional test-specific mocks can be added here if needed

describe('UploadMiddleware.multipleFiles', () => {
  let req: IRequest
  let res: IResponse
  let nxt: NextFunction

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    nxt = next
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('should exist upon import', () => {
    expect(UploadMiddleware.multipleFiles).toBeDefined()
  })

  it('should return an error when no user is present on the request object and not in debug mode', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    // Act
    await UploadMiddleware.multipleFiles(req, res, nxt)

    // Assert
    expect(nxt).toHaveBeenCalled()
    expect(req.uploads?.err?.httpCode).toEqual(StatusCodes.FORBIDDEN)
    expect(req.uploads?.err?.message).toEqual('User not allowed.')
  })

  it('should handle errors during upload', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    const request = {
      ...req,
      user: { id: 'test-user-id' },
    } as unknown as IRequest

    // Use helper to mock formidable error
    mockFormidableError('Upload failed')

    // Act
    await UploadMiddleware.multipleFiles(request, res, nxt)

    // Assert
    expect(request.uploads?.err?.httpCode).toEqual(StatusCodes.PRECONDITION_FAILED)
    expect(request.uploads?.err?.message).toBeDefined()
  })

  it('should handle maxFiles error', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    const request = {
      ...req,
      user: { id: 'test-user-id' },
    } as unknown as IRequest

    // Use helper to mock formidable maxFiles error
    mockFormidableError('maxFiles exceeded')

    // Act
    await UploadMiddleware.multipleFiles(request, res, nxt)

    // Assert
    expect(request.uploads?.err?.message).toEqual('200 File upload count exceeded.')
  })

  it('should handle maxTotalFileSize error', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    const request = {
      ...req,
      user: { id: 'test-user-id' },
    } as unknown as IRequest

    // Use helper to mock formidable maxTotalFileSize error
    mockFormidableError('maxTotalFileSize exceeded')

    // Act
    await UploadMiddleware.multipleFiles(request, res, nxt)

    // Assert
    expect(request.uploads?.err?.message).toEqual('201 File size limit exceeded.')
  })
})

describe('UploadMiddleware.singleFile', () => {
  let req: IRequest
  let res: IResponse
  let nxt: NextFunction

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    nxt = next
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  it('should exist upon import', () => {
    expect(UploadMiddleware.singleFile).toBeDefined()
  })

  it('should return an error when no user is present on the request object and not in debug mode', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    // Act
    await UploadMiddleware.singleFile(req, res, nxt)

    // Assert
    expect(nxt).toHaveBeenCalled()
    expect(req.uploads?.err?.httpCode).toEqual(StatusCodes.FORBIDDEN)
    expect(req.uploads?.err?.message).toEqual('User not allowed.')
  })

  it('should handle errors during upload', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    const request = {
      ...req,
      user: { id: 'test-user-id' },
    } as unknown as IRequest

    // Use helper to mock formidable error
    mockFormidableError('Upload failed')

    // Act
    await UploadMiddleware.singleFile(request, res, nxt)

    // Assert
    expect(nxt).toHaveBeenCalled()
    expect(request.uploads?.err?.httpCode).toEqual(StatusCodes.PRECONDITION_FAILED)
    expect(request.uploads?.err?.message).toBeDefined()
  })

  it('should handle maxFiles error', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    const request = {
      ...req,
      user: { id: 'test-user-id' },
    } as unknown as IRequest

    // Use helper to mock formidable maxFiles error
    mockFormidableError('maxFiles exceeded')

    // Act
    await UploadMiddleware.singleFile(request, res, nxt)

    // Assert
    expect(nxt).toHaveBeenCalled()
    expect(request.uploads?.err?.message).toEqual('200 File upload count exceeded.')
  })

  it('should handle maxTotalFileSize error', async () => {
    // Arrange
    jest.spyOn(configService, 'isDebug').mockReturnValue(false)

    const request = {
      ...req,
      user: { id: 'test-user-id' },
    } as unknown as IRequest

    // Use helper to mock formidable maxTotalFileSize error
    mockFormidableError('maxTotalFileSize exceeded')

    // Act
    await UploadMiddleware.singleFile(request, res, nxt)

    // Assert
    expect(nxt).toHaveBeenCalled()
    expect(request.uploads?.err?.message).toEqual('201 File size limit exceeded.')
  })
})

// ──────────────────────────────────────────────────────────────
// _sendToS3 – internal helper tests
// ──────────────────────────────────────────────────────────────
describe('UploadMiddleware._sendToS3', () => {
  let req: IRequest

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    req.url = '/api/test'
    jest.clearAllMocks()
  })

  it('should reject when formData is null', async () => {
    await expect(UploadMiddleware._sendToS3(null as never, [], req)).rejects.toBeDefined()
  })

  it('should resolve with fields and files when formidable parses successfully with "file" key', async () => {
    // Override formidable default mock to return a 'file' key
    const formidable = require('formidable')
    const mockFile = { mimetype: 'image/jpeg', originalFilename: 'photo.jpg' }
    formidable.default = jest.fn(() => ({
      parse: jest.fn(
        (_reqArg: IRequest, callback: (err: null, fields: object, files: object) => void) => {
          callback(null, { userId: ['owner'] }, { file: [mockFile] })
        },
      ),
    }))

    const formDataInstance = require('formidable').default()
    const result = await UploadMiddleware._sendToS3(formDataInstance, [], req)
    expect(result.files).toEqual([mockFile])
  })

  it('should resolve with "files" key when formidable returns files under that name', async () => {
    const formidable = require('formidable')
    const mockFile = { mimetype: 'image/png', originalFilename: 'img.png' }
    formidable.default = jest.fn(() => ({
      parse: jest.fn(
        (_reqArg: IRequest, callback: (err: null, fields: object, files: object) => void) => {
          callback(null, {}, { files: [mockFile] })
        },
      ),
    }))

    const formDataInstance = require('formidable').default()
    const result = await UploadMiddleware._sendToS3(formDataInstance, [], req)
    expect(result.files).toEqual([mockFile])
  })
})

// ──────────────────────────────────────────────────────────────
// _streamHandler – internal helper tests
// ──────────────────────────────────────────────────────────────
describe('UploadMiddleware._streamHandler', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
  })

  it('should return passThrough immediately when no file is provided', () => {
    const passThrough = new PassThrough()
    const result = UploadMiddleware._streamHandler(
      'bucket',
      'upload-id',
      [],
      passThrough,
      undefined,
    )
    expect(result).toBe(passThrough)
  })

  it('should push an upload promise and return passThrough when file has fileName and contentType', () => {
    jest.spyOn(configService, 'getEnvironment').mockReturnValue({
      S3_ACCESS_KEY_ID: 'key',
      S3_ENDPOINT: 'http://localhost:4566',
      S3_PROVIDER: 'aws',
      S3_REGION: 'us-east-1',
      S3_SECRET_ACCESS_KEY: 'secret',
    } as never)

    const passThrough = new PassThrough()
    const s3Uploads: Promise<void>[] = []
    const mockFile = {
      mimetype: 'image/jpeg',
      originalFilename: 'photo.jpg',
    }

    const result = UploadMiddleware._streamHandler(
      'test-bucket',
      'upload-123',
      s3Uploads,
      passThrough,
      mockFile as never,
    )

    expect(result).toBe(passThrough)
    expect(s3Uploads.length).toBeGreaterThan(0)
  })

  it('should return passThrough without adding upload when file has no fileName', () => {
    const passThrough = new PassThrough()
    const s3Uploads: Promise<void>[] = []
    const mockFile = {
      mimetype: null,
      originalFilename: null,
    }

    const result = UploadMiddleware._streamHandler(
      'test-bucket',
      'upload-123',
      s3Uploads,
      passThrough,
      mockFile as never,
    )

    expect(result).toBe(passThrough)
    expect(s3Uploads.length).toBe(0)
  })
})

// ──────────────────────────────────────────────────────────────
// Success paths for multipleFiles and singleFile
// ──────────────────────────────────────────────────────────────
describe('UploadMiddleware success paths', () => {
  let req: IRequest
  let res: IResponse
  let nxt: NextFunction

  beforeEach(() => {
    req = new Request() as unknown as IRequest
    res = new Response() as unknown as IResponse
    nxt = next
    jest.clearAllMocks()
  })

  it('multipleFiles should set req.uploads.uploadId when upload succeeds', async () => {
    jest.spyOn(configService, 'isDebug').mockReturnValue(true) // bypass user guard

    // Override formidable to return a successful parse with a 'file' key
    const formidable = require('formidable')
    formidable.default = jest.fn(() => ({
      parse: jest.fn(
        (_reqArg: IRequest, callback: (err: null, fields: object, files: object) => void) => {
          callback(
            null,
            { altText: ['desc'] },
            { file: [{ mimetype: 'image/jpeg', originalFilename: 'photo.jpg' }] },
          )
        },
      ),
    }))

    await UploadMiddleware.multipleFiles(req, res, nxt)

    expect(nxt).toHaveBeenCalled()
    expect(req.uploads?.uploadId).toBeDefined()
  })

  it('singleFile should set req.uploads.uploadId when upload succeeds', async () => {
    jest.spyOn(configService, 'isDebug').mockReturnValue(true) // bypass user guard

    const formidable = require('formidable')
    formidable.default = jest.fn(() => ({
      parse: jest.fn(
        (_reqArg: IRequest, callback: (err: null, fields: object, files: object) => void) => {
          callback(
            null,
            {},
            { file: [{ mimetype: 'application/pdf', originalFilename: 'doc.pdf' }] },
          )
        },
      ),
    }))

    await UploadMiddleware.singleFile(req, res, nxt)

    expect(nxt).toHaveBeenCalled()
    expect(req.uploads?.uploadId).toBeDefined()
  })
})
