import { isMobile } from './is-mobile'

describe('isMobile', () => {
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

  describe('Mobile device detection', () => {
    it('should detect Android mobile', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should detect iPhone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should NOT detect iPad (tablets are not considered mobile by this function)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1',
        writable: true,
      })

      expect(isMobile()).toBe(false)
    })

    it('should detect iPod', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should detect BlackBerry', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11+',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should detect Windows Phone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia 950) AppleWebKit/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should detect Opera Mobile', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Opera/9.80 (Android; Opera Mini/7.5.33361/31.1448; U; en) Presto/2.8.119 Version/11.1010',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should detect Mobile Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should detect Kindle', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (Linux; U; Android 4.4.3; KFTHWI Build/KTU84M) AppleWebKit/537.36 (KHTML, like Gecko) Silk/47.1.79 like Chrome/47.0.2526.80 Mobile Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should detect Samsung mobile browser', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.2 Chrome/67.0.3396.87 Mobile Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })
  })

  describe('Desktop/non-mobile detection', () => {
    it('should return false for Windows desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(false)
    })

    it('should return false for macOS desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(false)
    })

    it('should return false for Linux desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(false)
    })

    it('should return false for Chrome OS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (X11; CrOS x86_64 13904.97.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.167 Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should return false for empty user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: '',
        writable: true,
      })

      expect(isMobile()).toBe(false)
    })

    it('should handle undefined user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: undefined,
        writable: true,
      })

      expect(isMobile()).toBe(false)
    })

    it('should detect mobile from first 4 characters of user agent', () => {
      // Testing the substr(0,4) check
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: '1207 some other stuff',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should be case insensitive', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'ANDROID mobile device',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })
  })

  describe('Tablet detection', () => {
    it('should detect Android tablet with mobile in user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (Linux; Android 11; Pixel C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36',
        writable: true,
      })

      expect(isMobile()).toBe(true)
    })

    it('should NOT detect iPad (tablets are not phones)', () => {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value:
          'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        writable: true,
      })

      // iPad is not detected as "mobile" by this function
      // The regex looks for ip(hone|od) but not ipad
      expect(isMobile()).toBe(false)
    })
  })
})
