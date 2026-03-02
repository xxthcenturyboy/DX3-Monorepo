import { SecurityAlertSerivice } from '../auth/alerts/security-alert.service'
import { ApiLoggingClass } from '../logger'
import { UserModel } from '../user/user-api.postgres-model'
import { DeviceModel } from './device-api.postgres-model'
import { DevicesService } from './devices-api.service'

jest.mock('../auth/alerts/security-alert.service', () => ({
  SecurityAlertSerivice: { newDeviceNotification: jest.fn() },
}))
jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./device-api.postgres-model', () => ({
  DeviceModel: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByFcmTokenNotCurrentUser: jest.fn(),
    findByVerificationToken: jest.fn(),
    findOne: jest.fn(),
    markDeleted: jest.fn(),
  },
}))
jest.mock('../user/user-api.postgres-model', () => ({
  UserModel: {
    findByPk: jest.fn(),
  },
}))

describe('DevicesService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(DevicesService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const devicesService = new DevicesService()
    // assert
    expect(devicesService).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new DevicesService()
    // assert
    expect(service.handleDevice).toBeDefined()
    expect(service.disconnectDevice).toBeDefined()
    expect(service.rejectDevice).toBeDefined()
    expect(service.updateFcmToken).toBeDefined()
    expect(service.updatePublicKey).toBeDefined()
  })

  describe('disconnectDevice', () => {
    it('should throw when deviceId is empty', async () => {
      const service = new DevicesService()
      await expect(service.disconnectDevice('')).rejects.toThrow(
        'DisconnectDevice: Not enough data to execute',
      )
    })

    it('should return message when device disconnected', async () => {
      const { DeviceModel } = require('./device-api.postgres-model')
      ;(DeviceModel.markDeleted as jest.Mock).mockResolvedValue(true)

      const service = new DevicesService()
      const result = await service.disconnectDevice('device-1')

      expect(result).toEqual({ message: 'Device disconnected.' })
    })

    it('should throw when device not found', async () => {
      const { DeviceModel } = require('./device-api.postgres-model')
      ;(DeviceModel.markDeleted as jest.Mock).mockResolvedValue(false)

      const service = new DevicesService()
      await expect(service.disconnectDevice('nonexistent')).rejects.toThrow('Device not found')
    })
  })

  describe('updatePublicKey', () => {
    it('should throw when uniqueDeviceId or biometricPublicKey missing', async () => {
      const service = new DevicesService()
      await expect(service.updatePublicKey('', 'key')).rejects.toThrow(
        'Update Public Key: Insufficient data',
      )
      await expect(service.updatePublicKey('device-id', '')).rejects.toThrow(
        'Update Public Key: Insufficient data',
      )
    })

    it('should update public key when device found', async () => {
      const mockDevice = {
        biomAuthPubKey: '',
        save: jest.fn().mockResolvedValue(undefined),
      }
      ;(DeviceModel.findOne as jest.Mock).mockResolvedValue(mockDevice)

      const service = new DevicesService()
      const result = await service.updatePublicKey('device-id', 'new-public-key')

      expect(result).toBe(mockDevice)
      expect(mockDevice.biomAuthPubKey).toBe('new-public-key')
    })

    it('should throw when device not found', async () => {
      ;(DeviceModel.findOne as jest.Mock).mockResolvedValue(null)

      const service = new DevicesService()
      await expect(service.updatePublicKey('nonexistent', 'key')).rejects.toThrow(
        'Could not find the device to update',
      )
    })
  })

  describe('handleDevice', () => {
    const baseDevice = {
      carrier: 'Verizon',
      deviceCountry: 'US',
      deviceId: 'device-abc',
      name: 'iPhone 15',
      uniqueDeviceId: 'unique-abc',
    }
    const mockCreatedDevice = {
      facialAuthState: 'NOT_APPLICABLE',
      id: 'created-1',
      uniqueDeviceId: 'unique-abc',
      verificationToken: 'token-123',
      verifiedAt: new Date(),
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create device when no existing device and no user device', async () => {
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(null),
        getVerifiedPhone: jest.fn().mockResolvedValue(null),
        id: 'user-1',
      }
      ;(DeviceModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(DeviceModel.create as jest.Mock).mockResolvedValue(mockCreatedDevice)

      const service = new DevicesService()
      const result = await service.handleDevice(baseDevice as never, mockUser as never)

      expect(result).toBe(mockCreatedDevice)
      expect(DeviceModel.create).toHaveBeenCalled()
    })

    it('should handle new device when user already has a different connected device', async () => {
      const existingUserDevice = {
        deletedAt: null,
        fcmToken: 'old-fcm',
        save: jest.fn().mockResolvedValue(undefined),
        uniqueDeviceId: 'different-unique-id',
      }
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(existingUserDevice),
        getVerifiedPhone: jest.fn().mockResolvedValue('555-1234'),
        id: 'user-1',
      }
      ;(DeviceModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(DeviceModel.create as jest.Mock).mockResolvedValue(mockCreatedDevice)
      ;(SecurityAlertSerivice.newDeviceNotification as jest.Mock).mockResolvedValue(undefined)

      const service = new DevicesService()
      const result = await service.handleDevice(baseDevice as never, mockUser as never)

      expect(existingUserDevice.save).toHaveBeenCalled()
      expect(result).toBe(mockCreatedDevice)
    })

    it('should handle bypass flag when user has a different device', async () => {
      const addedDevice = {
        facialAuthState: 'CHALLENGE',
        save: jest.fn().mockResolvedValue(undefined),
        verificationToken: 'token-bypass',
        verifiedAt: null as Date | null,
      }
      const existingUserDevice = {
        deletedAt: null,
        fcmToken: 'old-fcm',
        save: jest.fn().mockResolvedValue(undefined),
        uniqueDeviceId: 'different-id',
      }
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(existingUserDevice),
        getVerifiedPhone: jest.fn().mockResolvedValue('555-1234'),
        id: 'user-1',
      }
      ;(DeviceModel.findOne as jest.Mock).mockResolvedValue(null)
      ;(DeviceModel.create as jest.Mock).mockResolvedValue(addedDevice)

      const service = new DevicesService()
      const result = await service.handleDevice(baseDevice as never, mockUser as never, true)

      expect(addedDevice.save).toHaveBeenCalled()
      expect(result).toBe(addedDevice)
    })

    it('should transfer device from another user when existing device belongs to different user', async () => {
      const existingDevice = {
        deletedAt: null,
        id: 'existing-device-1',
        save: jest.fn().mockResolvedValue(undefined),
        userId: 'other-user',
      }
      const anotherUserDevice = {
        deletedAt: null,
        id: 'another-device',
        save: jest.fn().mockResolvedValue(undefined),
      }
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(null),
        getVerifiedPhone: jest.fn().mockResolvedValue(null),
        id: 'user-1',
      }
      ;(DeviceModel.findOne as jest.Mock).mockResolvedValue(existingDevice)
      ;(DeviceModel.findAll as jest.Mock).mockResolvedValue([anotherUserDevice])
      ;(DeviceModel.create as jest.Mock).mockResolvedValue(mockCreatedDevice)
      ;(SecurityAlertSerivice.newDeviceNotification as jest.Mock).mockResolvedValue(undefined)

      const service = new DevicesService()
      const result = await service.handleDevice(baseDevice as never, mockUser as never)

      expect(existingDevice.save).toHaveBeenCalled()
      expect(anotherUserDevice.save).toHaveBeenCalled()
      expect(result).toBe(mockCreatedDevice)
    })

    it('should catch errors and rethrow with error code', async () => {
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockRejectedValue(new Error('DB failure')),
        getVerifiedPhone: jest.fn().mockResolvedValue(null),
        id: 'user-1',
      }
      ;(DeviceModel.findOne as jest.Mock).mockResolvedValue(null)

      const service = new DevicesService()
      await expect(service.handleDevice(baseDevice as never, mockUser as never)).rejects.toThrow()
    })
  })

  describe('rejectDevice', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should throw when token is empty', async () => {
      const service = new DevicesService()
      await expect(service.rejectDevice('')).rejects.toThrow('Token is required')
    })

    it('should throw when device not found by token', async () => {
      ;(DeviceModel.findByVerificationToken as jest.Mock).mockResolvedValue(null)

      const service = new DevicesService()
      await expect(service.rejectDevice('invalid-token')).rejects.toThrow('Invalid Token')
    })

    it('should throw when device has no attached user', async () => {
      ;(DeviceModel.findByVerificationToken as jest.Mock).mockResolvedValue({
        user: null,
      })

      const service = new DevicesService()
      await expect(service.rejectDevice('token-123')).rejects.toThrow('User not attached')
    })

    it('should throw when no previous device exists', async () => {
      const mockDevice = {
        user: {
          fetchConnectedDeviceBeforeToken: jest.fn().mockResolvedValue(null),
          id: 'user-1',
        },
      }
      ;(DeviceModel.findByVerificationToken as jest.Mock).mockResolvedValue(mockDevice)

      const service = new DevicesService()
      await expect(service.rejectDevice('token-123')).rejects.toThrow('No previous device exists')
    })

    it('should reject device and restore previous device', async () => {
      const previousDevice = {
        deletedAt: new Date(),
        save: jest.fn().mockResolvedValue(undefined),
      }
      const mockDevice = {
        destroy: jest.fn().mockResolvedValue(undefined),
        user: {
          fetchConnectedDeviceBeforeToken: jest.fn().mockResolvedValue(previousDevice),
          id: 'user-1',
        },
      }
      ;(DeviceModel.findByVerificationToken as jest.Mock).mockResolvedValue(mockDevice)

      const service = new DevicesService()
      const result = await service.rejectDevice('valid-token')

      expect(mockDevice.destroy).toHaveBeenCalled()
      expect(previousDevice.deletedAt).toBeNull()
      expect(previousDevice.save).toHaveBeenCalled()
      expect(result).toBe(previousDevice)
    })
  })

  describe('updateFcmToken', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should throw when fcmToken is empty', async () => {
      const service = new DevicesService()
      await expect(service.updateFcmToken('user-1', '')).rejects.toThrow(
        'Update FCM Token: Insufficient data',
      )
    })

    it('should throw when user not found', async () => {
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(null)

      const service = new DevicesService()
      await expect(service.updateFcmToken('nonexistent', 'fcm-token')).rejects.toThrow(
        'User not found',
      )
    })

    it('should throw when no connected device', async () => {
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(null),
        id: 'user-1',
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const service = new DevicesService()
      await expect(service.updateFcmToken('user-1', 'fcm-token')).rejects.toThrow(
        'No device connected',
      )
    })

    it('should update fcm token when it is different', async () => {
      const connectedDevice = {
        fcmToken: 'old-fcm-token',
        save: jest.fn().mockResolvedValue(undefined),
      }
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(connectedDevice),
        id: 'user-1',
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)
      ;(DeviceModel.findByFcmTokenNotCurrentUser as jest.Mock).mockResolvedValue(null)

      const service = new DevicesService()
      const result = await service.updateFcmToken('user-1', 'new-fcm-token')

      expect(connectedDevice.fcmToken).toBe('new-fcm-token')
      expect(connectedDevice.save).toHaveBeenCalled()
      expect(result).toBe(connectedDevice)
    })

    it('should not update when fcm token is the same', async () => {
      const connectedDevice = {
        fcmToken: 'same-fcm-token',
        save: jest.fn().mockResolvedValue(undefined),
      }
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(connectedDevice),
        id: 'user-1',
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)

      const service = new DevicesService()
      const result = await service.updateFcmToken('user-1', 'same-fcm-token')

      expect(connectedDevice.save).not.toHaveBeenCalled()
      expect(result).toBe(connectedDevice)
    })

    it('should throw when fcm token is already in use by another user', async () => {
      const connectedDevice = { fcmToken: 'old-token' }
      const mockUser = {
        fetchConnectedDevice: jest.fn().mockResolvedValue(connectedDevice),
        id: 'user-1',
      }
      ;(UserModel.findByPk as jest.Mock).mockResolvedValue(mockUser)
      ;(DeviceModel.findByFcmTokenNotCurrentUser as jest.Mock).mockResolvedValue({
        id: 'other-device',
      })

      const service = new DevicesService()
      await expect(service.updateFcmToken('user-1', 'taken-fcm-token')).rejects.toThrow(
        'Token in use by another user',
      )
    })
  })
})
