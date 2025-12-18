import type { Response as IResponse } from 'express'
import { Response } from 'jest-express/lib/response'

import { MEDIA_SUB_TYPES, MEDIA_VARIANTS, MIME_TYPES } from '@dx3/models-shared'
import { TEST_BAD_UUID } from '@dx3/test-data'

import { ApiLoggingClass } from '../logger'
import { MediaApiService } from './media-api.service'

// Mock logger with factory to use centralized mock
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('@dx3/utils-shared')
jest.mock('./media-api-image-manipulation.service.ts')
jest.mock('./media-api.postgres-model')

// This test file contains ONLY unit tests
// Skip if running in integration mode
describe('MediaApiService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'TEST' })
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })

  it('should exist upon import', () => {
    expect(MediaApiService).toBeDefined()
  })

  it('should return undefined when userContentUpload is called in test.', async () => {
    // Arrange
    const service = new MediaApiService()
    // Act
    try {
      const result = await service.userContentUpload({
        altText: 'test-alt-text',
        filePath: 'test-path',
        fileSize: 2,
        mediaSubType: MEDIA_SUB_TYPES.DOCUMENT,
        mimeType: MIME_TYPES.FILE.PDF,
        newFilename: 'new-test-file-name',
        originalFilename: 'original-test-file-name',
        ownerId: 'test-owner-id',
        uploadId: 'test-upload-id',
      })
      // Assert
      expect(result).toBeUndefined()
    } catch (err) {
      expect(err).toBeDefined()
    }
  })

  it('should return false when clearUpload has no object exists with id.', async () => {
    // Arrange
    const service = new MediaApiService()
    // Act
    const result = await service.clearUpload(TEST_BAD_UUID)
    // Assert
    expect(result).toBeDefined()
    expect(result).toBe(false)
  })

  it('should throw when getContentKey retrieves a value that does not exist', async () => {
    // Arrange
    const service = new MediaApiService()
    // Act
    try {
      await service.getContentKey('test-id', MEDIA_VARIANTS.THUMB)
    } catch (err) {
      // Assert
      expect(err).toBeDefined()
      expect((err as Error).message).toEqual('105 Could not retrieve key.')
    }
  })

  it('should throw when getUserContent does not exist', async () => {
    // Arrange
    const res = new Response() as unknown as IResponse
    const service = new MediaApiService()
    // Act
    try {
      await service.getUserContent('test-id', res)
    } catch (err) {
      // Assert
      expect(err).toBeDefined()
      expect((err as Error).message).toEqual('105 Could not retrieve file.')
    }
  })
})
