import { ApiLoggingClass } from '../logger'
import { UserPrivilegeSetModel } from './user-privilege-api.postgres-model'
import { UserPrivilegeService } from './user-privilege-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./user-privilege-api.postgres-model', () => ({
  UserPrivilegeSetModel: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}))
jest.mock('./user-privilege-api.redis-cache', () => ({
  UserPrivilegeSetCache: jest.fn().mockImplementation(() => ({
    getAllPrivilegeSets: jest.fn().mockResolvedValue([]),
    setCache: jest.fn().mockResolvedValue(undefined),
  })),
}))

describe('UserPrivilegeService', () => {
  let service: UserPrivilegeService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    service = new UserPrivilegeService()
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(UserPrivilegeService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    expect(service).toBeDefined()
  })

  it('should have all methods', () => {
    expect(service.getAllPrivilegeSets).toBeDefined()
    expect(service.updatePrivilegeSet).toBeDefined()
  })

  describe('getAllPrivilegeSets', () => {
    it('should return privilege sets from database when cache is empty', async () => {
      const mockSets = [
        { description: 'User role', name: 'USER', order: 100, toJSON: () => ({}) },
      ] as unknown as (typeof UserPrivilegeSetModel)[]
      ;(UserPrivilegeSetModel.findAll as jest.Mock).mockResolvedValue(mockSets)

      const result = await service.getAllPrivilegeSets()

      expect(result).toEqual(mockSets)
      expect(UserPrivilegeSetModel.findAll).toHaveBeenCalledWith({
        order: [['order', 'ASC']],
      })
    })

    it('should return sets from cache when cache is populated', async () => {
      const { UserPrivilegeSetCache } = require('./user-privilege-api.redis-cache')
      const cachedSets = [
        { description: 'Admin role', name: 'ADMIN', order: 300 },
        { description: 'User role', name: 'USER', order: 100 },
      ]
      ;(UserPrivilegeSetCache as jest.Mock).mockImplementationOnce(() => ({
        getAllPrivilegeSets: jest.fn().mockResolvedValue(cachedSets),
        setCache: jest.fn().mockResolvedValue(undefined),
      }))

      const result = await service.getAllPrivilegeSets()

      expect(result).toEqual(cachedSets)
      expect(UserPrivilegeSetModel.findAll).not.toHaveBeenCalled()
    })

    it('should throw server error when findAll fails', async () => {
      ;(UserPrivilegeSetModel.findAll as jest.Mock).mockRejectedValue(new Error('DB down'))

      await expect(service.getAllPrivilegeSets()).rejects.toThrow('DB down')
    })

    it('should use fallback error message when findAll rejects with non-Error', async () => {
      // Covers the `|| 'Error getting privilege sets'` branch at line 55
      ;(UserPrivilegeSetModel.findAll as jest.Mock).mockRejectedValue('raw string error')

      await expect(service.getAllPrivilegeSets()).rejects.toThrow('Error getting privilege sets')
    })

    it('should log error and continue when cache getAllPrivilegeSets throws', async () => {
      const { UserPrivilegeSetCache } = require('./user-privilege-api.redis-cache')
      ;(UserPrivilegeSetCache as jest.Mock).mockImplementationOnce(() => ({
        getAllPrivilegeSets: jest.fn().mockRejectedValue(new Error('Redis down')),
        setCache: jest.fn(),
      }))

      const mockSets = [{ description: 'User role', name: 'USER', order: 100, toJSON: () => ({}) }]
      ;(UserPrivilegeSetModel.findAll as jest.Mock).mockResolvedValue(mockSets)

      // Should fall through to DB query when cache fails
      const result = await service.getAllPrivilegeSets()
      expect(result).toEqual(mockSets)
    })

    it('should log error when setAllToCache fails due to toJSON throwing', async () => {
      // Covers the setAllToCache catch block by causing toJSON to throw synchronously
      const { UserPrivilegeSetCache } = require('./user-privilege-api.redis-cache')
      ;(UserPrivilegeSetCache as jest.Mock).mockImplementation(() => ({
        getAllPrivilegeSets: jest.fn().mockResolvedValue([]),
        setCache: jest.fn().mockResolvedValue(true),
      }))

      const mockSets = [
        {
          description: 'User role',
          name: 'USER',
          order: 100,
          // Throw a non-Error to cover the `|| 'failed to write all...'` fallback branch
          toJSON: () => {
            throw 'serialization failed'
          },
        },
      ]
      ;(UserPrivilegeSetModel.findAll as jest.Mock).mockResolvedValue(mockSets)

      // The main getAllPrivilegeSets call should succeed (setAllToCache is fire-and-forget)
      const result = await service.getAllPrivilegeSets()
      // Give the async setAllToCache time to complete and log the error
      await new Promise((resolve) => setImmediate(resolve))
      expect(result).toEqual(mockSets)
    })
  })

  describe('updatePrivilegeSet', () => {
    it('should throw when id is empty', async () => {
      await expect(service.updatePrivilegeSet('', {})).rejects.toThrow('No id supplied')
    })

    it('should throw when privilege set not found', async () => {
      ;(UserPrivilegeSetModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(
        service.updatePrivilegeSet('non-existent-id', { description: 'Updated' }),
      ).rejects.toThrow('No Privilege Set Found!')
    })

    it('should update and save privilege set when found', async () => {
      const mockSet = {
        name: 'USER',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
        toJSON: () => ({}),
      }
      ;(UserPrivilegeSetModel.findByPk as jest.Mock).mockResolvedValue(mockSet)

      const result = await service.updatePrivilegeSet('id-1', {
        description: 'Updated description',
      })

      expect(result).toEqual(mockSet)
      expect(mockSet.setDataValue).toHaveBeenCalledWith('description', 'Updated description')
      expect(mockSet.save).toHaveBeenCalled()
    })

    it('should update name and order when provided', async () => {
      const mockSet = {
        name: 'USER',
        save: jest.fn().mockResolvedValue(undefined),
        setDataValue: jest.fn(),
        toJSON: () => ({}),
      }
      ;(UserPrivilegeSetModel.findByPk as jest.Mock).mockResolvedValue(mockSet)

      await service.updatePrivilegeSet('id-1', {
        name: 'ADMIN',
        order: 200,
      })

      expect(mockSet.setDataValue).toHaveBeenCalledWith('name', 'ADMIN')
      expect(mockSet.setDataValue).toHaveBeenCalledWith('order', 200)
    })

    it('should throw server error when save fails', async () => {
      const mockSet = {
        name: 'USER',
        save: jest.fn().mockRejectedValue(new Error('Save failed')),
        setDataValue: jest.fn(),
        toJSON: () => ({}),
      }
      ;(UserPrivilegeSetModel.findByPk as jest.Mock).mockResolvedValue(mockSet)

      await expect(service.updatePrivilegeSet('id-1', { description: 'Updated' })).rejects.toThrow(
        'Save failed',
      )
    })

    it('should use fallback error message when save rejects with non-Error', async () => {
      // Covers the `|| 'Error updating privilege set'` branch at line 93
      const mockSet = {
        name: 'USER',
        save: jest.fn().mockRejectedValue('raw error'),
        setDataValue: jest.fn(),
        toJSON: () => ({}),
      }
      ;(UserPrivilegeSetModel.findByPk as jest.Mock).mockResolvedValue(mockSet)

      await expect(service.updatePrivilegeSet('id-1', { description: 'Updated' })).rejects.toThrow(
        'Error updating privilege set',
      )
    })
  })
})
