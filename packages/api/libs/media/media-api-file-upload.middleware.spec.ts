import type { Request as IRequest, Response as IResponse, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { next } from 'jest-express/lib/next'
import { Request } from 'jest-express/lib/request'
import { Response } from 'jest-express/lib/response'

import { UploadMiddleware } from './media-api-file-upload.middleware'

// Core mocks are set up globally in test-setup.ts
// Additional test-specific mocks can be added here if needed

import * as configService from '../config/config-api.service'
import { mockFormidableError } from '../testing/mocks'

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
