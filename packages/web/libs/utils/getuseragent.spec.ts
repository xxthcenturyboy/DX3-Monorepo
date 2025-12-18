import { agents, getUserAgent } from './getuseragent'

describe('getUserAgent', () => {
  let originalUserAgent: string
  let originalVendor: string

  beforeEach(() => {
    // Save original values
    originalUserAgent = navigator.userAgent
    originalVendor = navigator.vendor
  })

  afterEach(() => {
    // Restore original values
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: originalUserAgent,
      writable: true,
    })
    Object.defineProperty(navigator, 'vendor', {
      configurable: true,
      value: originalVendor,
      writable: true,
    })
  })

  describe('agents enum', () => {
    it('should have ios value', () => {
      expect(agents.ios).toBe('ios')
    })

    it('should have android value', () => {
      expect(agents.android).toBe('android')
    })
  })

  describe('iOS detection', () => {
    it('should detect iPhone user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.ios)
    })

    it('should detect iPad user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.ios)
    })

    it('should detect iPod user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.ios)
    })

    it('should not detect iOS if MSStream is present', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
        writable: true,
      })
      ;(window as any).MSStream = true

      const result = getUserAgent()

      expect(result).not.toBe(agents.ios)

      // Cleanup
      delete (window as any).MSStream
    })
  })

  describe('Android detection', () => {
    it('should detect Android user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.android)
    })

    it('should detect Android with lowercase', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Linux; android 10) AppleWebKit/537.36',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.android)
    })

    it('should detect Android tablet', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Linux; Android 11; Pixel C) AppleWebKit/537.36',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.android)
    })
  })

  describe('Desktop/other platforms', () => {
    it('should return null for Windows user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBeNull()
    })

    it('should return null for Mac user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBeNull()
    })

    it('should return null for Linux desktop user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBeNull()
    })

    it('should return null for Chrome OS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (X11; CrOS x86_64 13904.97.0) AppleWebKit/537.36',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBeNull()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: '',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBeNull()
    })

    it('should prioritize Android over iOS if both are present', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Android iPhone iPad',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.android)
    })

    it('should check navigator.vendor if userAgent is not set', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: '',
        writable: true,
      })
      Object.defineProperty(navigator, 'vendor', {
        configurable: true,
        value: 'Android',
        writable: true,
      })

      const result = getUserAgent()

      expect(result).toBe(agents.android)
    })
  })
})
