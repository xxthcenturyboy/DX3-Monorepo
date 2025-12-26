/**
 * i18n Service Tests
 */

import { DEFAULT_LOCALE, DEFAULT_STRINGS, LOCALES_BASE_PATH } from './i18n.consts'
import { I18nService, i18nService } from './i18n.service'

describe('I18nService', () => {
  let service: I18nService

  beforeEach(() => {
    // Get fresh instance for each test
    service = I18nService.getInstance()
    service.clearCache()

    // Mock fetch globally
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      // arrange
      const instance1 = I18nService.getInstance()
      const instance2 = I18nService.getInstance()

      // assert
      expect(instance1).toBe(instance2)
    })

    it('should export singleton as i18nService', () => {
      // assert
      expect(i18nService).toBeDefined()
      expect(i18nService).toBeInstanceOf(Object)
    })
  })

  describe('loadLocale', () => {
    it('should fetch translations from server', async () => {
      // arrange
      const mockTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Server Login' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockTranslations),
        ok: true,
      })

      // act
      const translations = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(global.fetch).toHaveBeenCalledWith(`${LOCALES_BASE_PATH}/${DEFAULT_LOCALE}.json`)
      expect(translations.LOGIN).toBe('Server Login')
    })

    it('should merge fetched translations with defaults', async () => {
      // arrange
      const partialTranslations = { LOGIN: 'Custom Login' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(partialTranslations),
        ok: true,
      })

      // act
      const translations = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(translations.LOGIN).toBe('Custom Login')
      expect(translations.PASSWORD).toBe(DEFAULT_STRINGS.PASSWORD)
    })

    it('should return cached translations on subsequent calls', async () => {
      // arrange
      const mockTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Cached Login' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockTranslations),
        ok: true,
      })

      // act
      await service.loadLocale(DEFAULT_LOCALE)
      ;(global.fetch as jest.Mock).mockClear()
      const cachedResult = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(global.fetch).not.toHaveBeenCalled()
      expect(cachedResult.LOGIN).toBe('Cached Login')
    })

    it('should fallback to default strings on fetch error', async () => {
      // arrange
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      // Mock console.error to suppress output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      // act
      const translations = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(translations).toEqual(DEFAULT_STRINGS)

      consoleSpy.mockRestore()
      warnSpy.mockRestore()
    })

    it('should handle non-ok response', async () => {
      // arrange
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

      // act
      const translations = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(translations).toEqual(DEFAULT_STRINGS)

      consoleSpy.mockRestore()
      warnSpy.mockRestore()
    })
  })

  describe('reloadLocale', () => {
    it('should bypass cache and fetch fresh translations', async () => {
      // arrange
      const initialTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Initial' }
      const updatedTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Updated' }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: () => Promise.resolve(initialTranslations),
          ok: true,
        })
        .mockResolvedValueOnce({
          json: () => Promise.resolve(updatedTranslations),
          ok: true,
        })

      // Load initial
      await service.loadLocale(DEFAULT_LOCALE)
      expect((await service.loadLocale(DEFAULT_LOCALE)).LOGIN).toBe('Initial')

      // act - force reload
      const freshTranslations = await service.reloadLocale(DEFAULT_LOCALE)

      // assert
      expect(freshTranslations.LOGIN).toBe('Updated')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('loadManifest', () => {
    it('should fetch manifest from server', async () => {
      // arrange
      const mockManifest = {
        availableLocales: [{ code: 'en', isRTL: false, name: 'English', nativeName: 'English' }],
        defaultLocale: 'en',
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockManifest),
        ok: true,
      })

      // act
      const manifest = await service.loadManifest()

      // assert
      expect(global.fetch).toHaveBeenCalledWith(`${LOCALES_BASE_PATH}/manifest.json`)
      expect(manifest).toEqual(mockManifest)
    })

    it('should return default manifest on error', async () => {
      // arrange
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // act
      const manifest = await service.loadManifest()

      // assert
      expect(manifest.defaultLocale).toBe(DEFAULT_LOCALE)
      expect(manifest.availableLocales).toHaveLength(1)
      expect(manifest.availableLocales[0].code).toBe(DEFAULT_LOCALE)

      consoleSpy.mockRestore()
    })
  })

  describe('clearCache', () => {
    it('should clear cache forcing next load to fetch from server', async () => {
      // arrange
      const mockTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Cached' }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockTranslations),
        ok: true,
      })

      await service.loadLocale(DEFAULT_LOCALE)
      ;(global.fetch as jest.Mock).mockClear()

      // act
      service.clearCache()
      await service.loadLocale(DEFAULT_LOCALE)

      // assert - should have fetched again after cache clear
      expect(global.fetch).toHaveBeenCalledWith(`${LOCALES_BASE_PATH}/${DEFAULT_LOCALE}.json`)
    })

    it('should also clear manifest cache', async () => {
      // arrange
      const mockManifest = {
        availableLocales: [{ code: 'en', isRTL: false, name: 'English', nativeName: 'English' }],
        defaultLocale: 'en',
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockManifest),
        ok: true,
      })

      await service.loadManifest()
      ;(global.fetch as jest.Mock).mockClear()

      // act
      service.clearCache()
      await service.loadManifest()

      // assert - should have fetched manifest again
      expect(global.fetch).toHaveBeenCalledWith(`${LOCALES_BASE_PATH}/manifest.json`)
    })
  })

  describe('getPreferredLocale', () => {
    const originalNavigator = global.navigator

    beforeEach(() => {
      // Mock manifest fetch
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () =>
          Promise.resolve({
            availableLocales: [
              { code: 'en', isRTL: false, name: 'English', nativeName: 'English' },
            ],
            defaultLocale: 'en',
          }),
        ok: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(global, 'navigator', {
        configurable: true,
        value: originalNavigator,
        writable: true,
      })
    })

    it('should return default locale when browser locale not available', async () => {
      // arrange
      Object.defineProperty(global, 'navigator', {
        configurable: true,
        value: { language: 'fr-FR', languages: ['fr-FR', 'fr'] },
        writable: true,
      })

      // act
      const locale = await service.getPreferredLocale()

      // assert
      expect(locale).toBe(DEFAULT_LOCALE)
    })

    it('should return exact match when available', async () => {
      // arrange
      Object.defineProperty(global, 'navigator', {
        configurable: true,
        value: { language: 'en', languages: ['en'] },
        writable: true,
      })

      // act
      const locale = await service.getPreferredLocale()

      // assert
      expect(locale).toBe('en')
    })
  })
})
