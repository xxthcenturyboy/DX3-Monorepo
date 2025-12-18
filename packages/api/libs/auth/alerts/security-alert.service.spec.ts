import type { DeviceAuthType } from '@dx3/models-shared'
import { MOCK_USERS, TEST_EXISTING_USER_ID } from '@dx3/test-data'

import { ApiLoggingClass } from '../../logger'
import { mockMailSendgridInstance } from '../../mail/mail-api-sendgrid.mock'
import {
  createMockUserInstance,
  type MockUserModel,
  mockMailSendgrid,
  mockUserModel,
} from '../../testing/mocks'
import { SecurityAlertSerivice } from './security-alert.service'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))

// Extended mock type with security alert methods
interface MockUserWithSecurityMethods extends MockUserModel {
  getVerifiedEmail: jest.Mock
  getDefaultEmail: jest.Mock
  getVerifiedPhone: jest.Mock
  getDefaultPhone: jest.Mock
  fetchConnectedDeviceBeforeToken: jest.Mock
}

// This test file contains ONLY unit tests
describe('SecurityAlertSerivice', () => {
  let mockUser: MockUserWithSecurityMethods

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
    // Setup centralized mocks
    mockMailSendgrid()
    mockUserModel()
  })

  beforeEach(() => {
    // Create a mock user instance with the required methods
    const baseUser = createMockUserInstance(MOCK_USERS[TEST_EXISTING_USER_ID])

    // Add additional methods needed for security alerts
    mockUser = {
      ...baseUser,
      fetchConnectedDeviceBeforeToken: jest.fn(),
      getDefaultEmail: jest.fn(),
      getDefaultPhone: jest.fn(),
      getVerifiedEmail: jest.fn(),
      getVerifiedPhone: jest.fn(),
    } as MockUserWithSecurityMethods
  })

  afterEach(() => {
    // Clear mock call history between tests
    mockMailSendgridInstance.sendAccountAlert.mockClear()
    mockMailSendgridInstance.sendConfirmation.mockClear()
    mockMailSendgridInstance.sendInvite.mockClear()
    mockMailSendgridInstance.sendOtp.mockClear()
  })

  it('should exist', () => {
    expect(SecurityAlertSerivice).toBeDefined()
  })

  describe('newDeviceNotification', () => {
    test('should exist', async () => {
      // arrange
      // act
      // assert
      expect(SecurityAlertSerivice.newDeviceNotification).toBeDefined()
    })

    test('should send email alert when user has verified email', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'Test Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockUser.getVerifiedEmail).toHaveBeenCalled()
      expect(mockUser.getDefaultEmail).not.toHaveBeenCalled()
      expect(mockUser.fetchConnectedDeviceBeforeToken).toHaveBeenCalledWith(token)
      expect(mockMailSendgridInstance.sendAccountAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('Test Device'),
          cta: 'Reject Device',
          ctaUrl: expect.stringContaining('confirm-device-rejection?token=test-token&dn='),
          ipPoolName: expect.any(String),
          subject: expect.stringContaining('Device Connection Request'),
          to: verifiedEmail,
          unsubscribeGroup: expect.any(String),
        }),
      )
    })

    test('should use default email when no verified email exists', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'Test Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const defaultEmail = 'default@example.com'

      mockUser.getVerifiedEmail.mockResolvedValue(null)
      mockUser.getDefaultEmail.mockResolvedValue(defaultEmail)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockUser.getVerifiedEmail).toHaveBeenCalled()
      expect(mockUser.getDefaultEmail).toHaveBeenCalled()
      expect(mockMailSendgridInstance.sendAccountAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          to: defaultEmail,
        }),
      )
    })

    test('should not send email when user has no email', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'Test Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'

      mockUser.getVerifiedEmail.mockResolvedValue(null)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockUser.getVerifiedEmail).toHaveBeenCalled()
      expect(mockUser.getDefaultEmail).toHaveBeenCalled()
      expect(mockMailSendgridInstance.sendAccountAlert).not.toHaveBeenCalled()
    })

    test('should handle device with missing properties', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: undefined,
        deviceCountry: undefined,
        name: undefined,
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockMailSendgridInstance.sendAccountAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('N/A'),
        }),
      )
    })

    test('should include current device name in rejection URL', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'New Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'
      const currentDevice = { name: 'Previous Device' }

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(currentDevice as never)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockUser.fetchConnectedDeviceBeforeToken).toHaveBeenCalledWith(token)
      expect(mockMailSendgridInstance.sendAccountAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          ctaUrl: expect.stringContaining('dn=Previous%20Device'),
        }),
      )
    })

    test('should handle null current device in rejection URL', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'New Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockMailSendgridInstance.sendAccountAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          ctaUrl: expect.stringContaining('dn='),
        }),
      )
    })

    test('should call phone methods but not send SMS', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'Test Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'
      const verifiedPhone = '+1234567890'

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(verifiedPhone)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockUser.getVerifiedPhone).toHaveBeenCalled()
      expect(mockUser.getDefaultPhone).not.toHaveBeenCalled()
      // SMS functionality is not yet implemented, so no SMS sending should occur
    })

    test('should use default phone when no verified phone exists', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'Test Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'
      const defaultPhone = '+0987654321'

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(defaultPhone)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockUser.getVerifiedPhone).toHaveBeenCalled()
      expect(mockUser.getDefaultPhone).toHaveBeenCalled()
      // SMS functionality is not yet implemented, so no SMS sending should occur
    })

    test('should format time correctly in email body', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'Test Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockMailSendgridInstance.sendAccountAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringMatching(/[A-Z][a-z]+, [A-Z][a-z]+ \d+ \d{4}, \d+:\d+:\d+ [ap]m/),
        }),
      )
    })

    test('should include proper email subject format', async () => {
      // arrange
      const device: DeviceAuthType = {
        carrier: 'Test Carrier',
        deviceCountry: 'US',
        name: 'Test Device',
        uniqueDeviceId: 'test-device-id',
      }
      const token = 'test-token'
      const verifiedEmail = 'verified@example.com'

      mockUser.getVerifiedEmail.mockResolvedValue(verifiedEmail)
      mockUser.getDefaultEmail.mockResolvedValue(null)
      mockUser.getVerifiedPhone.mockResolvedValue(null)
      mockUser.getDefaultPhone.mockResolvedValue(null)
      mockUser.fetchConnectedDeviceBeforeToken.mockResolvedValue(null)

      // act
      await SecurityAlertSerivice.newDeviceNotification(mockUser as never, device, token)

      // assert
      expect(mockMailSendgridInstance.sendAccountAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringMatching(
            /Device Connection Request \[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/,
          ),
        }),
      )
    })
  })
})
