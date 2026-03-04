/**
 * i18n Service Tests
 *
 * Jest runs in Node.js, so the service will use the 'node:fs/promises' path.
 * We mock that module to avoid requiring real locale files on disk.
 */

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}))

jest.mock('node:path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
}))

import * as fsPromises from 'node:fs/promises'

import { DEFAULT_LOCALE, DEFAULT_STRINGS } from './i18n.consts'
import { I18nService, i18nService } from './i18n.service'

describe('I18nService', () => {
  let service: I18nService
  const mockReadFile = fsPromises.readFile as jest.Mock

  beforeEach(() => {
    // Get fresh instance for each test
    service = I18nService.getInstance()
    service.clearCache()

    // Default mock: return valid JSON with all default strings
    mockReadFile.mockResolvedValue(JSON.stringify(DEFAULT_STRINGS))

    // Mock fetch globally for browser-path tests
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
    it('should load translations via filesystem in Node.js environment', async () => {
      // arrange - Jest runs in Node.js so uses fs
      const mockTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Server Login' }
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockTranslations))

      // act
      const translations = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(mockReadFile).toHaveBeenCalled()
      expect(translations.LOGIN).toBe('Server Login')
    })

    it('should merge loaded translations with defaults', async () => {
      // arrange
      const partialTranslations = { LOGIN: 'Custom Login' }
      mockReadFile.mockResolvedValueOnce(JSON.stringify(partialTranslations))

      // act
      const translations = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(translations.LOGIN).toBe('Custom Login')
      expect(translations.PASSWORD).toBe(DEFAULT_STRINGS.PASSWORD)
    })

    it('should return cached translations on subsequent calls', async () => {
      // arrange
      const mockTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Cached Login' }
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockTranslations))

      // act
      await service.loadLocale(DEFAULT_LOCALE)
      mockReadFile.mockClear()
      const cachedResult = await service.loadLocale(DEFAULT_LOCALE)

      // assert
      expect(mockReadFile).not.toHaveBeenCalled()
      expect(cachedResult.LOGIN).toBe('Cached Login')
    })

    it('should fallback to default strings on read error', async () => {
      // arrange
      mockReadFile.mockRejectedValueOnce(new Error('File not found'))

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
    it('should bypass cache and load fresh translations', async () => {
      // arrange
      const initialTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Initial' }
      const updatedTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Updated' }

      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(initialTranslations))
        .mockResolvedValueOnce(JSON.stringify(updatedTranslations))

      // Load initial
      await service.loadLocale(DEFAULT_LOCALE)
      expect((await service.loadLocale(DEFAULT_LOCALE)).LOGIN).toBe('Initial')

      // act - force reload
      const freshTranslations = await service.reloadLocale(DEFAULT_LOCALE)

      // assert
      expect(freshTranslations.LOGIN).toBe('Updated')
      expect(mockReadFile).toHaveBeenCalledTimes(2)
    })
  })

  describe('loadManifest', () => {
    it('should load manifest from filesystem in Node.js environment', async () => {
      // arrange - uses second readFile call (first is for locale)
      const mockManifest = {
        availableLocales: [{ code: 'en', isRTL: false, name: 'English', nativeName: 'English' }],
        defaultLocale: 'en',
      }
      mockReadFile.mockResolvedValueOnce(JSON.stringify(mockManifest))

      // act
      const manifest = await service.loadManifest()

      // assert
      expect(mockReadFile).toHaveBeenCalled()
      expect(manifest.defaultLocale).toBe('en')
    })

    it('should return default manifest on error', async () => {
      // arrange
      mockReadFile.mockRejectedValueOnce(new Error('File not found'))
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
    it('should clear cache forcing next load to read from filesystem again', async () => {
      // arrange
      const mockTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Cached' }
      mockReadFile.mockResolvedValue(JSON.stringify(mockTranslations))

      await service.loadLocale(DEFAULT_LOCALE)
      mockReadFile.mockClear()

      // act
      service.clearCache()
      await service.loadLocale(DEFAULT_LOCALE)

      // assert - should have read again after cache clear
      expect(mockReadFile).toHaveBeenCalled()
    })

    it('should also clear manifest cache', async () => {
      // arrange
      const mockManifest = {
        availableLocales: [{ code: 'en', isRTL: false, name: 'English', nativeName: 'English' }],
        defaultLocale: 'en',
      }
      mockReadFile.mockResolvedValue(JSON.stringify(mockManifest))

      await service.loadManifest()
      mockReadFile.mockClear()

      // act
      service.clearCache()
      await service.loadManifest()

      // assert - should have read manifest again
      expect(mockReadFile).toHaveBeenCalled()
    })
  })

  describe('getPreferredLocale', () => {
    const originalNavigator = global.navigator

    beforeEach(() => {
      // Mock manifest file read
      const mockManifest = {
        availableLocales: [
          { code: 'en', isRTL: false, name: 'English', nativeName: 'English' },
        ],
        defaultLocale: 'en',
      }
      mockReadFile.mockResolvedValue(JSON.stringify(mockManifest))
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
