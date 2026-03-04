import { authInitialState } from './auth-web.reducer'
import { selectAuthToken, selectIsAuthenticated } from './auth-web.selector'
import type { AuthStateType } from './auth-web.types'

type MockRootState = {
  auth: AuthStateType
}

const createMockState = (overrides: Partial<AuthStateType> = {}): MockRootState => ({
  auth: { ...authInitialState, ...overrides },
})

describe('auth selectors', () => {
  describe('selectAuthToken', () => {
    it('should return null when no token', () => {
      const state = createMockState({ token: null })
      expect(selectAuthToken(state as never)).toBeNull()
    })

    it('should return token when set', () => {
      const state = createMockState({ token: 'test.jwt.token' })
      expect(selectAuthToken(state as never)).toBe('test.jwt.token')
    })

    it('should return null when auth slice is missing', () => {
      expect(selectAuthToken({} as never)).toBeNull()
    })
  })

  describe('selectIsAuthenticated', () => {
    it('should return false when no token', () => {
      const state = createMockState({ token: null })
      expect(selectIsAuthenticated(state as never)).toBe(false)
    })

    it('should return true when token is present', () => {
      const state = createMockState({ token: 'valid.jwt.token' })
      expect(selectIsAuthenticated(state as never)).toBe(true)
    })
  })
})
