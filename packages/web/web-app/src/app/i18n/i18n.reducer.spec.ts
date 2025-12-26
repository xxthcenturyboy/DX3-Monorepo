/**
 * i18n Reducer Tests
 */

import { DEFAULT_LOCALE, DEFAULT_STRINGS } from './i18n.consts'
import { i18nActions, i18nInitialState, i18nReducer } from './i18n.reducer'
import type { StringKeys } from './i18n.types'

describe('i18nReducer', () => {
  describe('initial state', () => {
    it('should have correct initial state', () => {
      // arrange & act
      const state = i18nReducer(undefined, { type: '@@INIT' })

      // assert
      expect(state.currentLocale).toBe(DEFAULT_LOCALE)
      expect(state.defaultLocale).toBe(DEFAULT_LOCALE)
      expect(state.translations).toBeNull()
      expect(state.defaultTranslations).toEqual(DEFAULT_STRINGS)
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('should set loading to true', () => {
      // arrange & act
      const state = i18nReducer(i18nInitialState, i18nActions.setLoading(true))

      // assert
      expect(state.isLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set loading to false', () => {
      // arrange
      const loadingState = { ...i18nInitialState, isLoading: true }

      // act
      const state = i18nReducer(loadingState, i18nActions.setLoading(false))

      // assert
      expect(state.isLoading).toBe(false)
    })

    it('should clear error when loading starts', () => {
      // arrange
      const errorState = { ...i18nInitialState, error: 'Previous error' }

      // act
      const state = i18nReducer(errorState, i18nActions.setLoading(true))

      // assert
      expect(state.error).toBeNull()
    })
  })

  describe('setTranslations', () => {
    it('should set translations', () => {
      // arrange
      const mockTranslations: StringKeys = { ...DEFAULT_STRINGS, LOGIN: 'Custom Login' }

      // act
      const state = i18nReducer(i18nInitialState, i18nActions.setTranslations(mockTranslations))

      // assert
      expect(state.translations).toEqual(mockTranslations)
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(true)
      expect(state.error).toBeNull()
    })
  })

  describe('setCurrentLocale', () => {
    it('should set current locale', () => {
      // arrange & act
      const state = i18nReducer(i18nInitialState, i18nActions.setCurrentLocale('en'))

      // assert
      expect(state.currentLocale).toBe('en')
    })
  })

  describe('setError', () => {
    it('should set error and fallback to default translations', () => {
      // arrange
      const loadingState = { ...i18nInitialState, isLoading: true }

      // act
      const state = i18nReducer(loadingState, i18nActions.setError('Network error'))

      // assert
      expect(state.error).toBe('Network error')
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(true)
      expect(state.translations).toEqual(DEFAULT_STRINGS)
    })
  })

  describe('reset', () => {
    it('should reset state to defaults', () => {
      // arrange
      const modifiedState = {
        ...i18nInitialState,
        currentLocale: 'en' as const,
        error: 'Some error',
        isInitialized: true,
        isLoading: true,
        translations: DEFAULT_STRINGS,
      }

      // act
      const state = i18nReducer(modifiedState, i18nActions.reset())

      // assert
      expect(state.currentLocale).toBe(DEFAULT_LOCALE)
      expect(state.translations).toBeNull()
      expect(state.isLoading).toBe(false)
      expect(state.isInitialized).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setInitialized', () => {
    it('should set initialized to true', () => {
      // arrange & act
      const state = i18nReducer(i18nInitialState, i18nActions.setInitialized(true))

      // assert
      expect(state.isInitialized).toBe(true)
    })

    it('should set initialized to false', () => {
      // arrange
      const initializedState = { ...i18nInitialState, isInitialized: true }

      // act
      const state = i18nReducer(initializedState, i18nActions.setInitialized(false))

      // assert
      expect(state.isInitialized).toBe(false)
    })
  })
})
