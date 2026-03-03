import { FingerprintWebService } from './fingerprint-web.service'

// Mock the logger to suppress console output in tests
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  },
}))

// Mock @fingerprintjs/fingerprintjs
const mockGet = jest.fn()
const mockAgent = { get: mockGet }
const mockLoad = jest.fn()

jest.mock('@fingerprintjs/fingerprintjs', () => ({
  __esModule: true,
  default: {
    load: (...args: unknown[]) => mockLoad(...args),
  },
}))

describe('FingerprintWebService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the private static singleton between tests by forcing a new instance
    mockLoad.mockResolvedValue(mockAgent)
    // Construct a fresh instance to clear the cached singleton
    new FingerprintWebService()
  })

  describe('instance getter (singleton pattern)', () => {
    it('should return the same instance on subsequent calls', () => {
      const first = FingerprintWebService.instance
      const second = FingerprintWebService.instance

      expect(first).toBe(second)
    })

    it('should return an instance when #instance is already set', () => {
      const instance = FingerprintWebService.instance

      expect(instance).toBeInstanceOf(FingerprintWebService)
    })

    it('should auto-construct when the getter is invoked before any explicit instantiation', () => {
      // jest.isolateModules re-executes the module in a fresh registry so the
      // private static #instance field starts as undefined — the only way to
      // reach line 17 (the if (!#instance) true branch) from outside the class.
      jest.isolateModules(() => {
        const { FingerprintWebService: IsolatedFPS } =
          require('./fingerprint-web.service') as typeof import('./fingerprint-web.service')

        const instance = IsolatedFPS.instance

        expect(instance).toBeInstanceOf(IsolatedFPS)
      })
    })
  })

  describe('constructor', () => {
    it('should call fingerprint.load() on construction', () => {
      new FingerprintWebService()

      expect(mockLoad).toHaveBeenCalled()
    })

    it('should initialise cachedFingerprint to null', () => {
      const instance = new FingerprintWebService()

      expect(instance.cachedFingerprint).toBeNull()
    })
  })

  describe('getFingerprint()', () => {
    it('should return cached fingerprint when cachedFingerprint is already set', async () => {
      const instance = new FingerprintWebService()
      instance.cachedFingerprint = 'cached-visitor-id'

      const result = await instance.getFingerprint()

      expect(result).toBe('cached-visitor-id')
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('should fetch fingerprint from fp.get(), cache it, and return visitorId', async () => {
      mockGet.mockResolvedValue({ visitorId: 'new-visitor-id' })
      const instance = new FingerprintWebService()

      const result = await instance.getFingerprint()

      expect(result).toBe('new-visitor-id')
      expect(instance.cachedFingerprint).toBe('new-visitor-id')
    })

    it('should return null and log error when fp.get() throws', async () => {
      const { logger } = jest.requireMock('../logger')
      mockGet.mockRejectedValue(new Error('fingerprint error'))
      const instance = new FingerprintWebService()

      const result = await instance.getFingerprint()

      expect(result).toBeNull()
      expect(logger.error).toHaveBeenCalledWith(
        'FingerprintWebService',
        'getFingerprint',
        'Error getting fingerprint',
        expect.any(Error),
      )
    })

    it('should return null when fpPromise resolves to a falsy value', async () => {
      // Simulate load() resolving to null/undefined
      mockLoad.mockResolvedValue(null)
      const instance = new FingerprintWebService()

      const result = await instance.getFingerprint()

      expect(result).toBeNull()
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('should return null when fpPromise itself rejects', async () => {
      mockLoad.mockRejectedValue(new Error('load error'))
      const instance = new FingerprintWebService()

      const result = await instance.getFingerprint()

      expect(result).toBeNull()
    })

    it('should return null when fpPromise has been cleared', async () => {
      const instance = new FingerprintWebService()
      // Forcibly nullify the promise field to exercise the `if (this.fpPromise)` false branch
      ;(instance as unknown as { fpPromise: null }).fpPromise = null

      const result = await instance.getFingerprint()

      expect(result).toBeNull()
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('should not re-fetch if called multiple times after caching', async () => {
      mockGet.mockResolvedValue({ visitorId: 'stable-id' })
      const instance = new FingerprintWebService()

      const first = await instance.getFingerprint()
      const second = await instance.getFingerprint()

      expect(first).toBe('stable-id')
      expect(second).toBe('stable-id')
      // fp.get() should only be called once; second call uses the cache
      expect(mockGet).toHaveBeenCalledTimes(1)
    })
  })
})
