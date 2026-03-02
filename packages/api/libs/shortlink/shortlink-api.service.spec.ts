import { ApiLoggingClass } from '../logger'
import { ShortlinkService } from './shortlink-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

// Inline mock to avoid hoisting reference issues
jest.mock('./shortlink-api.postgres-model', () => ({
  ShortLinkModel: { getShortLinkTarget: jest.fn() },
}))

import { ShortLinkModel } from './shortlink-api.postgres-model'

const mockGetShortLinkTarget = ShortLinkModel.getShortLinkTarget as jest.Mock

describe('ShortlinkService', () => {
  let service: ShortlinkService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ShortlinkService()
  })

  it('should exist when imported', () => {
    expect(ShortlinkService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    expect(service).toBeDefined()
  })

  it('should have all methods', () => {
    expect(service.getShortlinkTarget).toBeDefined()
  })

  describe('getShortlinkTarget', () => {
    it('should throw validation error when no id is provided', async () => {
      await expect(service.getShortlinkTarget('')).rejects.toThrow(/No value supplied/)
    })

    it('should return the path when ShortLinkModel resolves a path', async () => {
      mockGetShortLinkTarget.mockResolvedValue('/destination/path')
      const result = await service.getShortlinkTarget('abc123')
      expect(result).toBe('/destination/path')
      expect(mockGetShortLinkTarget).toHaveBeenCalledWith('abc123')
    })

    it('should return null when ShortLinkModel resolves null (not found)', async () => {
      mockGetShortLinkTarget.mockResolvedValue(null)
      const result = await service.getShortlinkTarget('not-found-id')
      expect(result).toBeNull()
    })

    it('should throw server error when ShortLinkModel rejects', async () => {
      mockGetShortLinkTarget.mockRejectedValue(new Error('DB connection failed'))
      await expect(service.getShortlinkTarget('abc123')).rejects.toThrow(/DB connection failed/)
    })
  })
})
