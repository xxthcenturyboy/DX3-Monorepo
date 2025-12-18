import * as isMobileModule from './is-mobile'
import { testAllMediaInputs, testCameraInputs } from './test-media-inputs'

// Mock the isMobile function
jest.mock('./is-mobile', () => ({
  isMobile: jest.fn(),
}))

describe('test-media-inputs', () => {
  let mockEnumerateDevices: jest.Mock
  let mockGetUserMedia: jest.Mock
  const mockIsMobile = isMobileModule.isMobile as jest.MockedFunction<
    typeof isMobileModule.isMobile
  >
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    mockIsMobile.mockReturnValue(false)

    // Suppress console.log output
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    // Mock navigator.mediaDevices
    mockEnumerateDevices = jest.fn()
    mockGetUserMedia = jest.fn()

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        enumerateDevices: mockEnumerateDevices,
        getUserMedia: mockGetUserMedia,
      },
      writable: true,
    })

    // Mock window.navigator.userAgent
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
    })
  })

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore()
  })

  describe('testAllMediaInputs', () => {
    it('should return all media input information when everything is available', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera 1' },
        { deviceId: '2', kind: 'audioinput', label: 'Mic 1' },
      ])

      mockGetUserMedia.mockResolvedValue({ active: true })

      const result = await testAllMediaInputs()

      expect(result.hasCamera).toBe(true)
      expect(result.cameraEnabled).toBe(true)
      expect(result.audio).toBe(true)
      expect(result.isMobile).toBe(false)
      expect(result.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    })

    it('should detect when device is mobile', async () => {
      mockIsMobile.mockReturnValue(true)
      mockEnumerateDevices.mockResolvedValue([])
      mockGetUserMedia.mockRejectedValue(new Error('Permission denied'))

      const result = await testAllMediaInputs()

      expect(result.isMobile).toBe(true)
    })

    it('should return false for hasCamera when no video devices', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'audioinput', label: 'Mic 1' },
      ])
      mockGetUserMedia.mockResolvedValue({ active: true })

      const result = await testAllMediaInputs()

      expect(result.hasCamera).toBe(false)
    })

    it('should handle camera permission denied', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera 1' },
      ])
      mockGetUserMedia.mockRejectedValueOnce(new Error('NotAllowedError'))
      mockGetUserMedia.mockResolvedValueOnce({ active: true })

      const result = await testAllMediaInputs()

      expect(result.hasCamera).toBe(true)
      expect(result.cameraEnabled).toBe(false)
      expect(result.audio).toBe(true)
    })

    it('should handle both camera and audio permission denied', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera 1' },
      ])
      mockGetUserMedia.mockRejectedValue(new Error('NotAllowedError'))

      const result = await testAllMediaInputs()

      expect(result.hasCamera).toBe(true)
      expect(result.cameraEnabled).toBe(false)
      expect(result.audio).toBe(false)
    })

    it('should handle Internet Explorer user agent', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko MSIE ',
        writable: true,
      })

      const result = await testAllMediaInputs()

      expect(result.hasCamera).toBe(false)
    })

    it('should handle missing mediaDevices API', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: undefined,
        writable: true,
      })

      const result = await testAllMediaInputs()

      expect(result.hasCamera).toBe(false)
      expect(result.cameraEnabled).toBe(false)
      expect(result.audio).toBe(false)
    })

    it('should handle missing enumerateDevices function', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {},
        writable: true,
      })

      const result = await testAllMediaInputs()

      expect(result.hasCamera).toBe(false)
    })

    it('should include user agent in result', async () => {
      mockEnumerateDevices.mockResolvedValue([])
      mockGetUserMedia.mockRejectedValue(new Error('Error'))

      const result = await testAllMediaInputs()

      expect(result.userAgent).toBeDefined()
      expect(typeof result.userAgent).toBe('string')
    })
  })

  describe('testCameraInputs', () => {
    it('should return camera information when camera is available', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera 1' },
      ])
      mockGetUserMedia.mockResolvedValue({ active: true })

      const result = await testCameraInputs()

      expect(result.hasCamera).toBe(true)
      expect(result.cameraEnabled).toBe(true)
      expect(result.isMobile).toBe(false)
      expect(result.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    })

    it('should not test audio', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera 1' },
      ])
      mockGetUserMedia.mockResolvedValue({ active: true })

      const result = await testCameraInputs()

      expect(result).not.toHaveProperty('audio')
    })

    it('should handle camera permission denied', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera 1' },
      ])
      mockGetUserMedia.mockRejectedValue(new Error('NotAllowedError'))

      const result = await testCameraInputs()

      expect(result.hasCamera).toBe(true)
      expect(result.cameraEnabled).toBe(false)
    })

    it('should return false for hasCamera when no video devices', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'audioinput', label: 'Mic 1' },
      ])
      mockGetUserMedia.mockRejectedValue(new Error('Error'))

      const result = await testCameraInputs()

      expect(result.hasCamera).toBe(false)
      expect(result.cameraEnabled).toBe(false)
    })

    it('should detect mobile device', async () => {
      mockIsMobile.mockReturnValue(true)
      mockEnumerateDevices.mockResolvedValue([])
      mockGetUserMedia.mockRejectedValue(new Error('Error'))

      const result = await testCameraInputs()

      expect(result.isMobile).toBe(true)
    })

    it('should handle IE user agent', async () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
        writable: true,
      })

      const result = await testCameraInputs()

      expect(result.hasCamera).toBe(false)
    })

    it('should handle missing mediaDevices API', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: undefined,
        writable: true,
      })

      const result = await testCameraInputs()

      expect(result.hasCamera).toBe(false)
      expect(result.cameraEnabled).toBe(false)
    })

    it('should handle enumerateDevices errors', async () => {
      mockEnumerateDevices.mockRejectedValue(new Error('Device error'))
      mockGetUserMedia.mockRejectedValue(new Error('Permission error'))

      const result = await testCameraInputs()

      expect(result.hasCamera).toBe(false)
      expect(result.cameraEnabled).toBe(false)
    })

    it('should handle getUserMedia returning inactive media', async () => {
      mockEnumerateDevices.mockResolvedValue([
        { deviceId: '1', kind: 'videoinput', label: 'Camera 1' },
      ])
      mockGetUserMedia.mockResolvedValue({ active: false })

      const result = await testCameraInputs()

      expect(result.hasCamera).toBe(true)
      expect(result.cameraEnabled).toBe(false)
    })
  })
})
