/**
 * i18n Selectors Tests
 */

import { DEFAULT_STRINGS } from './i18n.consts'
import { i18nInitialState } from './i18n.reducer'
import {
  makeSelectTranslation,
  selectCurrentLocale,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectTranslations,
} from './i18n.selectors'
import type { I18nStateType } from './i18n.types'

// Mock RootState type for testing
type MockRootState = {
  i18n: I18nStateType
}

describe('i18n Selectors', () => {
  const createMockState = (i18nOverrides: Partial<I18nStateType> = {}): MockRootState => ({
    i18n: {
      ...i18nInitialState,
      ...i18nOverrides,
    },
  })

  describe('selectCurrentLocale', () => {
    it('should return current locale', () => {
      // arrange
      const state = createMockState({ currentLocale: 'en' })

      // act
      const result = selectCurrentLocale(state as never)

      // assert
      expect(result).toBe('en')
    })
  })

  describe('selectIsLoading', () => {
    it('should return loading state', () => {
      // arrange
      const state = createMockState({ isLoading: true })

      // act
      const result = selectIsLoading(state as never)

      // assert
      expect(result).toBe(true)
    })
  })

  describe('selectIsInitialized', () => {
    it('should return initialized state', () => {
      // arrange
      const state = createMockState({ isInitialized: true })

      // act
      const result = selectIsInitialized(state as never)

      // assert
      expect(result).toBe(true)
    })
  })

  describe('selectError', () => {
    it('should return error', () => {
      // arrange
      const state = createMockState({ error: 'Test error' })

      // act
      const result = selectError(state as never)

      // assert
      expect(result).toBe('Test error')
    })

    it('should return null when no error', () => {
      // arrange
      const state = createMockState({ error: null })

      // act
      const result = selectError(state as never)

      // assert
      expect(result).toBeNull()
    })
  })

  describe('selectTranslations', () => {
    it('should return loaded translations when available', () => {
      // arrange
      const customTranslations = { ...DEFAULT_STRINGS, LOGIN: 'Custom' }
      const state = createMockState({ translations: customTranslations })

      // act
      const result = selectTranslations(state as never)

      // assert
      expect(result.LOGIN).toBe('Custom')
    })

    it('should fallback to default translations when translations null', () => {
      // arrange
      const state = createMockState({ translations: null })

      // act
      const result = selectTranslations(state as never)

      // assert
      expect(result).toEqual(DEFAULT_STRINGS)
    })
  })

  describe('makeSelectTranslation', () => {
    it('should select specific translation', () => {
      // arrange
      const state = createMockState({ translations: DEFAULT_STRINGS })
      const selector = makeSelectTranslation('LOGIN')

      // act
      const result = selector(state as never)

      // assert
      expect(result).toBe('Login')
    })

    it('should apply interpolation', () => {
      // arrange
      const state = createMockState({ translations: DEFAULT_STRINGS })
      const selector = makeSelectTranslation('GREETING', { name: 'World' })

      // act
      const result = selector(state as never)

      // assert
      expect(result).toBe('Hello, World!')
    })

    it('should fallback to default when translation missing', () => {
      // arrange
      const partialTranslations = { ...DEFAULT_STRINGS }
      // @ts-expect-error - Testing fallback behavior
      delete partialTranslations.LOGIN
      const state = createMockState({ translations: partialTranslations })
      const selector = makeSelectTranslation('LOGIN')

      // act
      const result = selector(state as never)

      // assert
      expect(result).toBe('Login')
    })

    it('should return key when no translation found', () => {
      // arrange
      const state = createMockState({
        defaultTranslations: {} as typeof DEFAULT_STRINGS,
        translations: {} as typeof DEFAULT_STRINGS,
      })
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const selector = makeSelectTranslation('LOGIN')

      // act
      const result = selector(state as never)

      // assert
      expect(result).toBe('LOGIN')

      consoleSpy.mockRestore()
    })

    it('should preserve placeholder when param missing', () => {
      // arrange
      const state = createMockState({ translations: DEFAULT_STRINGS })
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const selector = makeSelectTranslation('GREETING', {})

      // act
      const result = selector(state as never)

      // assert
      expect(result).toBe('Hello, {name}!')

      consoleSpy.mockRestore()
    })
  })
})
