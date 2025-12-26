/**
 * i18n Hooks Tests
 */

import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import { DEFAULT_STRINGS } from './i18n.consts'
import { useI18n, useTranslation, useString, useStrings } from './i18n.hooks'
import { i18nInitialState, i18nReducer } from './i18n.reducer'
import type { I18nStateType } from './i18n.types'

// Create a mock store for testing
const createMockStore = (initialState: Partial<I18nStateType> = {}) => {
  return configureStore({
    preloadedState: {
      i18n: {
        ...i18nInitialState,
        ...initialState,
      },
    },
    reducer: {
      i18n: i18nReducer,
    },
  })
}

// Wrapper component for hooks
const createWrapper = (store: ReturnType<typeof createMockStore>) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store }, children)
  }
}

describe('i18n Hooks', () => {
  describe('useI18n', () => {
    it('should return translation function', () => {
      // arrange
      const store = createMockStore()
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useI18n(), { wrapper })

      // assert
      expect(result.current.t).toBeDefined()
      expect(typeof result.current.t).toBe('function')
    })

    it('should return current locale', () => {
      // arrange
      const store = createMockStore({ currentLocale: 'en' })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useI18n(), { wrapper })

      // assert
      expect(result.current.locale).toBe('en')
    })

    it('should return loading state', () => {
      // arrange
      const store = createMockStore({ isLoading: true })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useI18n(), { wrapper })

      // assert
      expect(result.current.isLoading).toBe(true)
    })

    it('should translate simple key', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useI18n(), { wrapper })

      // assert
      expect(result.current.t('LOGIN')).toBe('Login')
    })

    it('should translate with interpolation', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useI18n(), { wrapper })

      // assert
      expect(result.current.t('GREETING', { name: 'Dan' })).toBe('Hello, Dan!')
    })

    it('should fallback to default translations', () => {
      // arrange
      const store = createMockStore({ translations: null })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useI18n(), { wrapper })

      // assert
      expect(result.current.t('LOGIN')).toBe('Login')
    })

    it('should return key when translation missing', () => {
      // arrange
      const store = createMockStore({
        defaultTranslations: {} as typeof DEFAULT_STRINGS,
        translations: {} as typeof DEFAULT_STRINGS,
      })
      const wrapper = createWrapper(store)
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // act
      const { result } = renderHook(() => useI18n(), { wrapper })

      // assert
      expect(result.current.t('LOGIN')).toBe('LOGIN')

      consoleSpy.mockRestore()
    })
  })

  describe('useTranslation', () => {
    it('should return translation function only', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useTranslation(), { wrapper })

      // assert
      expect(typeof result.current).toBe('function')
      expect(result.current('LOGIN')).toBe('Login')
    })

    it('should handle interpolation', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useTranslation(), { wrapper })

      // assert
      expect(result.current('WELCOME_BACK', { name: 'User' })).toBe('Welcome back, User!')
    })
  })

  describe('useString', () => {
    it('should return single translated string', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useString('PASSWORD'), { wrapper })

      // assert
      expect(result.current).toBe('Password')
    })

    it('should support interpolation', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(() => useString('GREETING', { name: 'Test' }), { wrapper })

      // assert
      expect(result.current).toBe('Hello, Test!')
    })
  })

  describe('useStrings', () => {
    it('should return object with multiple translations', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(
        () => useStrings(['LOGIN', 'PASSWORD', 'USERNAME']),
        { wrapper }
      )

      // assert
      expect(result.current).toEqual({
        LOGIN: 'Login',
        PASSWORD: 'Password',
        USERNAME: 'Username',
      })
    })

    it('should be type-safe', () => {
      // arrange
      const store = createMockStore({ translations: DEFAULT_STRINGS })
      const wrapper = createWrapper(store)

      // act
      const { result } = renderHook(
        () => useStrings(['LOGIN', 'LOGOUT']),
        { wrapper }
      )

      // assert - TypeScript should enforce these keys exist
      expect(result.current.LOGIN).toBeDefined()
      expect(result.current.LOGOUT).toBeDefined()
    })
  })
})
