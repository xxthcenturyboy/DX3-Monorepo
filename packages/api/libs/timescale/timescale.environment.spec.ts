import { getTimescaleUriForEnvironment, isTimescaleEnabled } from './timescale.environment'

// Mock the config service
jest.mock('../config/config-api.service', () => ({
  isRunningInContainer: jest.fn(),
}))

import { isRunningInContainer } from '../config/config-api.service'

const mockIsRunningInContainer = isRunningInContainer as jest.MockedFunction<typeof isRunningInContainer>

describe('timescale.environment', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('isTimescaleEnabled', () => {
    it('should return true when TIMESCALE_ENABLED is "true"', () => {
      process.env.TIMESCALE_ENABLED = 'true'
      expect(isTimescaleEnabled()).toBe(true)
    })

    it('should return false when TIMESCALE_ENABLED is "false"', () => {
      process.env.TIMESCALE_ENABLED = 'false'
      expect(isTimescaleEnabled()).toBe(false)
    })

    it('should return false when TIMESCALE_ENABLED is not set', () => {
      delete process.env.TIMESCALE_ENABLED
      expect(isTimescaleEnabled()).toBe(false)
    })

    it('should return false when TIMESCALE_ENABLED is any other value', () => {
      process.env.TIMESCALE_ENABLED = '1'
      expect(isTimescaleEnabled()).toBe(false)

      process.env.TIMESCALE_ENABLED = 'yes'
      expect(isTimescaleEnabled()).toBe(false)
    })
  })

  describe('getTimescaleUriForEnvironment', () => {
    beforeEach(() => {
      mockIsRunningInContainer.mockReset()
    })

    it('should return null when TIMESCALE_URI is not set', () => {
      delete process.env.TIMESCALE_URI
      expect(getTimescaleUriForEnvironment()).toBeNull()
    })

    it('should return URI as-is when running in container', () => {
      const uri = 'postgresql://axuser:axpassword@ax-timescaledb:5432/ax_logs'
      process.env.TIMESCALE_URI = uri
      mockIsRunningInContainer.mockReturnValue(true)

      expect(getTimescaleUriForEnvironment()).toBe(uri)
    })

    it('should swap hostname to localhost and port to 5434 when running on host', () => {
      process.env.TIMESCALE_URI = 'postgresql://axuser:axpassword@ax-timescaledb:5432/ax_logs'
      mockIsRunningInContainer.mockReturnValue(false)

      const result = getTimescaleUriForEnvironment()

      expect(result).toBe('postgresql://axuser:axpassword@localhost:5434/ax_logs')
    })

    it('should use custom env var when provided', () => {
      process.env.CUSTOM_TIMESCALE_URI = 'postgresql://user:pass@custom-host:5432/db'
      mockIsRunningInContainer.mockReturnValue(true)

      const result = getTimescaleUriForEnvironment({ envVar: 'CUSTOM_TIMESCALE_URI' })

      expect(result).toBe('postgresql://user:pass@custom-host:5432/db')
    })

    it('should return null for invalid URI', () => {
      process.env.TIMESCALE_URI = 'not-a-valid-uri'
      mockIsRunningInContainer.mockReturnValue(false)

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const result = getTimescaleUriForEnvironment()

      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })
  })
})
