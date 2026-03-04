import type { SupportWebState } from '../support.types'
import { supportInitialState } from './support-web.reducer'
import {
  selectHasUnviewedSupport,
  selectSupportLastToast,
  selectSupportUnviewedCount,
} from './support-web.selector'

type MockRootState = {
  support: SupportWebState
}

const createMockState = (overrides: Partial<SupportWebState> = {}): MockRootState => ({
  support: { ...supportInitialState, ...overrides },
})

describe('support-web selectors', () => {
  describe('selectSupportUnviewedCount', () => {
    it('should return 0 initially', () => {
      const state = createMockState()
      expect(selectSupportUnviewedCount(state as never)).toBe(0)
    })

    it('should return the unviewed count', () => {
      const state = createMockState({ unviewedCount: 5 })
      expect(selectSupportUnviewedCount(state as never)).toBe(5)
    })
  })

  describe('selectHasUnviewedSupport', () => {
    it('should return false when count is 0', () => {
      const state = createMockState({ unviewedCount: 0 })
      expect(selectHasUnviewedSupport(state as never)).toBe(false)
    })

    it('should return true when count > 0', () => {
      const state = createMockState({ unviewedCount: 3 })
      expect(selectHasUnviewedSupport(state as never)).toBe(true)
    })
  })

  describe('selectSupportLastToast', () => {
    it('should return null initially', () => {
      const state = createMockState()
      expect(selectSupportLastToast(state as never)).toBeNull()
    })

    it('should return the last toast when set', () => {
      const toast = { id: 'req-1' } as never
      const state = createMockState({ lastToast: toast })
      expect(selectSupportLastToast(state as never)).toEqual(toast)
    })
  })
})
