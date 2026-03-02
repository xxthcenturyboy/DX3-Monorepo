import type { Server } from 'node:http'

import { AdminLogsSocketService } from '@dx3/api-libs/timescale/timescale.logging.socket'
import { FeatureFlagSocketApiService } from '@dx3/api-libs/feature-flags/feature-flag-api.socket'
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { NotificationSocketApiService } from '@dx3/api-libs/notifications/notification-api.socket'
import { SocketApiConnection } from '@dx3/api-libs/socket-io-api'
import { SupportSocketApiService } from '@dx3/api-libs/support/support-api.socket'

import { DxSocketClass } from './dx-socket.class'

jest.mock('@dx3/api-libs/logger', () => require('@dx3/api-libs/testing/mocks/internal/logger.mock'))

// SocketApiConnection: constructor returns { io: {} } by default so socket.io is truthy.
// The static .instance property is set per-test to control the success/failure branch.
jest.mock('@dx3/api-libs/socket-io-api', () => ({
  SocketApiConnection: jest.fn().mockImplementation(() => ({ io: {} })),
}))

// Socket service mocks — constructors are no-ops; static .instance is set per-test
jest.mock('@dx3/api-libs/feature-flags/feature-flag-api.socket', () => ({
  FeatureFlagSocketApiService: jest.fn(),
}))
jest.mock('@dx3/api-libs/notifications/notification-api.socket', () => ({
  NotificationSocketApiService: jest.fn(),
}))
jest.mock('@dx3/api-libs/support/support-api.socket', () => ({
  SupportSocketApiService: jest.fn(),
}))
jest.mock('@dx3/api-libs/timescale/timescale.logging.socket', () => ({
  AdminLogsSocketService: jest.fn(),
}))

// webUrl is called inside startSockets to configure SocketApiConnection
jest.mock('../../config/config-api.service', () => ({
  webUrl: jest.fn().mockReturnValue('http://localhost:3000'),
}))

// Helper type for the configureNamespace mock on each service instance
type MockServiceInstance = { configureNamespace: jest.Mock }

/**
 * Sets the static .instance properties on all socket service classes.
 * The static .instance check in startSockets() determines whether to configure namespaces.
 * Defaults all services to a valid instance; pass null to simulate an uninitialised service.
 */
function setServiceInstances(opts: {
  adminLogs?: MockServiceInstance | null
  featureFlag?: MockServiceInstance | null
  notification?: MockServiceInstance | null
  socket?: { io: object } | null
  support?: MockServiceInstance | null
}) {
  const { adminLogs, featureFlag, notification, socket, support } = {
    adminLogs: { configureNamespace: jest.fn() },
    featureFlag: { configureNamespace: jest.fn() },
    notification: { configureNamespace: jest.fn() },
    socket: { io: {} },
    support: { configureNamespace: jest.fn() },
    ...opts,
  }
  ;(SocketApiConnection as unknown as Record<string, unknown>).instance = socket
  ;(AdminLogsSocketService as unknown as Record<string, unknown>).instance = adminLogs
  ;(FeatureFlagSocketApiService as unknown as Record<string, unknown>).instance = featureFlag
  ;(NotificationSocketApiService as unknown as Record<string, unknown>).instance = notification
  ;(SupportSocketApiService as unknown as Record<string, unknown>).instance = support
}

describe('DxSocketClass', () => {
  // A minimal HTTP Server stub — only the object reference matters for these tests
  const mockServer = {} as Server

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    // Reset all static .instance properties to undefined between tests so each
    // test starts from a clean slate. jest.clearAllMocks() only clears call
    // history and does not remove plain object properties.
    ;(SocketApiConnection as unknown as Record<string, unknown>).instance = undefined
    ;(AdminLogsSocketService as unknown as Record<string, unknown>).instance = undefined
    ;(FeatureFlagSocketApiService as unknown as Record<string, unknown>).instance = undefined
    ;(NotificationSocketApiService as unknown as Record<string, unknown>).instance = undefined
    ;(SupportSocketApiService as unknown as Record<string, unknown>).instance = undefined
  })

  it('should exist', () => {
    // arrange / act / assert
    expect(DxSocketClass).toBeDefined()
  })

  it('should have a public static method of startSockets', () => {
    // arrange / act / assert
    expect(DxSocketClass.startSockets).toBeDefined()
  })

  describe('startSockets', () => {
    it('should log an error and return false when no httpServer is provided', () => {
      // act
      const result = DxSocketClass.startSockets(null as unknown as Server)
      // assert
      expect(result).toBe(false)
    })

    it('should log an error and return false when SocketApiConnection does not initialise (instance is null)', () => {
      // arrange — SocketApiConnection.instance remains undefined (default state from beforeEach)
      // act
      const result = DxSocketClass.startSockets(mockServer)
      // assert — !SocketApiConnection.instance is true → error path
      expect(result).toBe(false)
    })

    it('should log an error and return false when socket.io is falsy after construction', () => {
      // arrange — constructor returns object WITHOUT io property for this call only.
      // Cast bypasses the strict SocketApiConnection return type to simulate a failed init.
      jest.mocked(SocketApiConnection).mockImplementationOnce(
        () => ({}) as unknown as SocketApiConnection,
      )
      // SocketApiConnection.instance must be truthy so we reach the socket.io check
      setServiceInstances({ adminLogs: null, featureFlag: null, notification: null, support: null })
      // act
      const result = DxSocketClass.startSockets(mockServer)
      // assert — !socket.io is true → error path
      expect(result).toBe(false)
    })

    it('should configure namespaces on all services and return true when all instances are available', () => {
      // arrange — all service instances present
      const configureNamespace = jest.fn()
      setServiceInstances({
        adminLogs: { configureNamespace },
        featureFlag: { configureNamespace },
        notification: { configureNamespace },
        support: { configureNamespace },
      })
      // act
      const result = DxSocketClass.startSockets(mockServer)
      // assert — configureNamespace called once per service (4 total)
      expect(result).toBe(true)
      expect(configureNamespace).toHaveBeenCalledTimes(4)
    })

    it('should log info (not configure namespace) when AdminLogsSocketService has no instance', () => {
      // arrange — AdminLogs has no instance; the others do
      const configureNamespace = jest.fn()
      setServiceInstances({
        adminLogs: null,
        featureFlag: { configureNamespace },
        notification: { configureNamespace },
        support: { configureNamespace },
      })
      // act
      const result = DxSocketClass.startSockets(mockServer)
      // assert — only 3 services called configureNamespace; adminLogs path logs info instead
      expect(result).toBe(true)
      expect(configureNamespace).toHaveBeenCalledTimes(3)
    })

    it('should return false and log the error when an exception is thrown during setup', () => {
      // arrange — make SocketApiConnection constructor throw
      jest.mocked(SocketApiConnection).mockImplementationOnce(() => {
        throw new Error('Socket setup failed')
      })
      // act
      const result = DxSocketClass.startSockets(mockServer)
      // assert
      expect(result).toBe(false)
    })
  })
})
