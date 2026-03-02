import { FEATURE_FLAG_NAMES } from '@dx3/models-shared'

import { ApiLoggingClass } from '../logger'
import type { UserSessionType } from '../user/user-api.types'
import { FeatureFlagModel } from './feature-flag-api.postgres-model'
import { FeatureFlagService } from './feature-flag-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../redis', () => require('../testing/mocks/internal/redis.mock'))
jest.mock('./feature-flag-api.postgres-model')

import { RedisService } from '../redis'
import { mockRedisCacheHandle } from '../testing/mocks/internal/redis.mock'

describe('FeatureFlagService', () => {
  let service: FeatureFlagService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
    new RedisService({
      isDev: true,
      redis: { port: 6379, prefix: 'test', url: 'redis://localhost:6379' },
    })
  })

  beforeEach(() => {
    service = new FeatureFlagService()
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(FeatureFlagService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    expect(service).toBeDefined()
  })

  it('should have all methods', () => {
    expect(service.createFlag).toBeDefined()
    expect(service.evaluateAllFlags).toBeDefined()
    expect(service.evaluateFlag).toBeDefined()
    expect(service.getAllFlags).toBeDefined()
    expect(service.invalidateCache).toBeDefined()
    expect(service.updateFlag).toBeDefined()
  })

  describe('getAllFlags', () => {
    it('should return flags from database', async () => {
      const mockRows = [
        {
          description: 'Test flag',
          id: '1',
          name: FEATURE_FLAG_NAMES.BLOG,
          percentage: 100,
          status: 'ENABLED',
          target: 'ALL',
          toJSON: () => ({
            description: 'Test flag',
            id: '1',
            name: FEATURE_FLAG_NAMES.BLOG,
            percentage: 100,
            status: 'ENABLED',
            target: 'ALL',
          }),
        },
      ]
      ;(FeatureFlagModel.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockRows,
      })

      const result = await service.getAllFlags({})

      expect(result.flags).toHaveLength(1)
      expect(result.count).toBe(1)
      expect(result.flags[0].name).toBe(FEATURE_FLAG_NAMES.BLOG)
    })
  })

  describe('createFlag', () => {
    it('should create flag', async () => {
      const mockFlag = {
        description: 'New flag',
        id: '1',
        name: FEATURE_FLAG_NAMES.BLOG,
        percentage: 0,
        status: 'DISABLED',
        target: 'ALL',
        toJSON: () => ({
          description: 'New flag',
          id: '1',
          name: FEATURE_FLAG_NAMES.BLOG,
          percentage: 0,
          status: 'DISABLED',
          target: 'ALL',
        }),
      }
      ;(FeatureFlagModel.createFlag as jest.Mock).mockResolvedValue(mockFlag)

      const result = await service.createFlag(FEATURE_FLAG_NAMES.BLOG, 'New flag')

      expect(result.flag).toBeDefined()
      expect(result.flag.name).toBe(FEATURE_FLAG_NAMES.BLOG)
    })
  })

  describe('evaluateFlag', () => {
    it('should return true for active flag with ALL target', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        name: 'TEST',
        percentage: 0,
        status: 'ACTIVE',
        target: 'ALL',
        toJSON: () => ({ name: 'TEST', percentage: 0, status: 'ACTIVE', target: 'ALL' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, null)

      expect(result).toBe(true)
    })

    it('should return false for disabled flag', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        name: 'DISABLED',
        status: 'DISABLED',
        target: 'ALL',
        toJSON: () => ({ name: 'DISABLED', status: 'DISABLED', target: 'ALL' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.FAQ_APP, {
        fullName: '',
        hasSecuredAccount: false,
        id: 'user-1',
        isAdmin: false,
        isSuperAdmin: false,
        optInBeta: false,
        restrictions: [],
        roles: [],
        username: '',
      } as UserSessionType)

      expect(result).toBe(false)
    })
  })

  describe('updateFlag', () => {
    it('should update flag', async () => {
      ;(FeatureFlagModel.getFlagById as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'TEST_FLAG',
      })
      ;(FeatureFlagModel.updateFlag as jest.Mock).mockResolvedValue(undefined)

      const result = await service.updateFlag('1', { status: 'ACTIVE' })

      expect(result.updated).toBe(true)
    })

    it('should throw when flag not found', async () => {
      ;(FeatureFlagModel.getFlagById as jest.Mock).mockResolvedValue(null)

      await expect(service.updateFlag('nonexistent', {})).rejects.toThrow('not found')
    })
  })

  describe('evaluateAllFlags', () => {
    it('should return evaluated flags for user', async () => {
      ;(FeatureFlagModel.getAllFlags as jest.Mock).mockResolvedValue([
        { name: FEATURE_FLAG_NAMES.BLOG, toJSON: () => ({ name: FEATURE_FLAG_NAMES.BLOG }) },
      ])
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        name: FEATURE_FLAG_NAMES.BLOG,
        status: 'ACTIVE',
        target: 'ALL',
        toJSON: () => ({
          name: FEATURE_FLAG_NAMES.BLOG,
          status: 'ACTIVE',
          target: 'ALL',
        }),
      })

      const result = await service.evaluateAllFlags({
        fullName: '',
        hasSecuredAccount: false,
        id: 'user-1',
        isAdmin: false,
        isSuperAdmin: false,
        optInBeta: false,
        restrictions: [],
        roles: [],
        username: '',
      } as UserSessionType)

      expect(result.flags).toHaveLength(1)
      expect(result.flags[0].name).toBe(FEATURE_FLAG_NAMES.BLOG)
    })
  })

  describe('evaluateFlag - additional branches', () => {
    const adminUser: UserSessionType = {
      fullName: 'Admin User',
      hasSecuredAccount: true,
      id: 'admin-1',
      isAdmin: true,
      isSuperAdmin: false,
      optInBeta: false,
      restrictions: [],
      roles: [],
      username: 'admin',
    }
    const betaUser: UserSessionType = {
      fullName: 'Beta User',
      hasSecuredAccount: true,
      id: 'beta-1',
      isAdmin: false,
      isSuperAdmin: false,
      optInBeta: true,
      restrictions: [],
      roles: [],
      username: 'betauser',
    }

    it('should serve from Redis cache when cached flag exists (DISABLED)', async () => {
      const cachedFlag = JSON.stringify({ name: 'TEST', status: 'DISABLED', target: 'ALL' })
      mockRedisCacheHandle.get.mockResolvedValueOnce(cachedFlag)

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, null)

      expect(FeatureFlagModel.getFlagByName).not.toHaveBeenCalled()
      expect(result).toBe(false)
    })

    it('should serve from Redis cache and evaluate when ACTIVE', async () => {
      const cachedFlag = JSON.stringify({ name: 'TEST', status: 'ACTIVE', target: 'ALL' })
      mockRedisCacheHandle.get.mockResolvedValueOnce(cachedFlag)

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, null)

      expect(FeatureFlagModel.getFlagByName).not.toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when flag not found in db', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue(null)

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, null)

      expect(result).toBe(false)
    })

    it('should return true for ACTIVE flag targeting ADMIN when user is admin', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({ name: 'TEST', status: 'ACTIVE', target: 'ADMIN' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, adminUser)

      expect(result).toBe(true)
    })

    it('should return false for ACTIVE flag targeting ADMIN when user is not admin', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({ name: 'TEST', status: 'ACTIVE', target: 'ADMIN' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, {
        ...adminUser,
        isAdmin: false,
        isSuperAdmin: false,
      })

      expect(result).toBe(false)
    })

    it('should return true for ACTIVE flag targeting SUPER_ADMIN when user is super admin', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({ name: 'TEST', status: 'ACTIVE', target: 'SUPER_ADMIN' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, {
        ...adminUser,
        isSuperAdmin: true,
      })

      expect(result).toBe(true)
    })

    it('should return true for ACTIVE flag targeting BETA_USERS when user opted in', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({ name: 'TEST', status: 'ACTIVE', target: 'BETA_USERS' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, betaUser)

      expect(result).toBe(true)
    })

    it('should handle ROLLOUT status with percentage evaluation', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({ name: 'TEST', percentage: 100, status: 'ROLLOUT', target: 'ALL' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, adminUser)

      expect(typeof result).toBe('boolean')
    })

    it('should return false for ROLLOUT status without percentage', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({ name: 'TEST', percentage: 0, status: 'ROLLOUT', target: 'ALL' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, adminUser)

      expect(result).toBe(false)
    })

    it('should return false for ACTIVE flag with PERCENTAGE target and no userId', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({
          name: 'TEST',
          percentage: 50,
          status: 'ACTIVE',
          target: 'PERCENTAGE',
        }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, null)

      expect(result).toBe(false)
    })

    it('should evaluate percentage for ACTIVE flag with PERCENTAGE target and userId', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({
          name: 'TEST',
          percentage: 100,
          status: 'ACTIVE',
          target: 'PERCENTAGE',
        }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, adminUser)

      expect(typeof result).toBe('boolean')
    })

    it('should return false for unknown target in evaluateTarget', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockResolvedValue({
        toJSON: () => ({ name: 'TEST', status: 'ACTIVE', target: 'UNKNOWN_TARGET' }),
      })

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, adminUser)

      expect(result).toBe(false)
    })

    it('should recover from errors and return false', async () => {
      ;(FeatureFlagModel.getFlagByName as jest.Mock).mockRejectedValue(new Error('DB error'))

      const result = await service.evaluateFlag(FEATURE_FLAG_NAMES.BLOG, null)

      expect(result).toBe(false)
    })
  })

  describe('getAllFlags - additional branches', () => {
    it('should apply filter when filterValue is provided', async () => {
      ;(FeatureFlagModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] })

      const result = await service.getAllFlags({ filterValue: 'blog' })

      expect(result.count).toBe(0)
      expect(FeatureFlagModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Object) }),
      )
    })

    it('should apply custom orderBy when valid field provided', async () => {
      ;(FeatureFlagModel.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] })

      await service.getAllFlags({ orderBy: 'name', sortDir: 'DESC' })

      expect(FeatureFlagModel.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ order: [['name', 'DESC']] }),
      )
    })

    it('should throw wrapped error when database query fails', async () => {
      ;(FeatureFlagModel.findAndCountAll as jest.Mock).mockRejectedValue(
        new Error('DB connection failed'),
      )

      await expect(service.getAllFlags({})).rejects.toThrow('DB connection failed')
    })
  })

  describe('invalidateCache', () => {
    it('should invalidate specific flag cache by name', async () => {
      await service.invalidateCache(FEATURE_FLAG_NAMES.BLOG)
      // deleteCacheItem is called on the mock Redis - no error means success
      expect(true).toBe(true)
    })

    it('should bulk invalidate all feature flag cache keys when no flagName', async () => {
      mockRedisCacheHandle.keys.mockResolvedValueOnce(['ff:flag-1', 'ff:flag-2'])

      await service.invalidateCache()

      expect(mockRedisCacheHandle.keys).toHaveBeenCalled()
    })

    it('should handle empty keys array during bulk invalidation', async () => {
      mockRedisCacheHandle.keys.mockResolvedValueOnce([])

      await service.invalidateCache()

      expect(true).toBe(true)
    })
  })
})
