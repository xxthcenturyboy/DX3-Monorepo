import type { UiStateType } from '../ui-web.types'
import { uiInitialState } from './ui-web.reducer'
import {
  selectCurrentThemeMode,
  selectIsMobileWidth,
  selectToastThemeMode,
  selectWindowHeight,
  selectWindowWidth,
} from './ui-web.selector'

type MockRootState = {
  ui: UiStateType
}

const createMockState = (overrides: Partial<UiStateType> = {}): MockRootState => ({
  ui: { ...uiInitialState, ...overrides },
})

describe('ui selectors', () => {
  describe('selectWindowWidth', () => {
    it('should return windowWidth', () => {
      const state = createMockState({ windowWidth: 1280 })
      expect(selectWindowWidth(state as never)).toBe(1280)
    })
  })

  describe('selectWindowHeight', () => {
    it('should return windowHeight', () => {
      const state = createMockState({ windowHeight: 720 })
      expect(selectWindowHeight(state as never)).toBe(720)
    })
  })

  describe('selectCurrentThemeMode', () => {
    it('should return "light" for light theme', () => {
      const state = createMockState({ theme: 'light' })
      expect(selectCurrentThemeMode(state as never)).toBe('light')
    })

    it('should return "dark" for dark theme', () => {
      const state = createMockState({ theme: 'dark' })
      expect(selectCurrentThemeMode(state as never)).toBe('dark')
    })

    it('should fallback to "light" when theme is undefined', () => {
      const state = createMockState({ theme: undefined as never })
      expect(selectCurrentThemeMode(state as never)).toBe('light')
    })
  })

  describe('selectIsMobileWidth', () => {
    it('should return true for small viewport', () => {
      const state = createMockState({ windowWidth: 320 })
      expect(selectIsMobileWidth(state as never)).toBe(true)
    })

    it('should return false for wide viewport', () => {
      const state = createMockState({ windowWidth: 1280 })
      expect(selectIsMobileWidth(state as never)).toBe(false)
    })
  })

  describe('selectToastThemeMode', () => {
    it('should return "light" for light theme', () => {
      const state = createMockState({ theme: 'light' })
      const result = selectToastThemeMode(state as never)
      expect(result).toBe('light')
    })

    it('should return "dark" for dark theme', () => {
      const state = createMockState({ theme: 'dark' })
      const result = selectToastThemeMode(state as never)
      expect(result).toBe('dark')
    })
  })
})
