import { authActions, authInitialState, authReducer } from './auth-web.reducer'

// Mock jwt-decode to return a predictable payload
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn().mockReturnValue({ _id: 'user-123' }),
}))

describe('authReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = authReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(authInitialState)
  })

  it('should have correct initial state', () => {
    expect(authInitialState).toEqual({
      logoutResponse: false,
      password: '',
      token: null,
      userId: null,
      username: '',
    })
  })

  describe('tokenAdded', () => {
    it('should set the token and extract userId from JWT', () => {
      const fakeToken = 'header.payload.sig'
      const state = authReducer(authInitialState, authActions.tokenAdded(fakeToken))
      expect(state.token).toBe(fakeToken)
      expect(state.userId).toBe('user-123')
    })
  })

  describe('tokenRemoved', () => {
    it('should clear token and userId', () => {
      const loggedIn = { ...authInitialState, token: 'some.token.here', userId: 'user-123' }
      const state = authReducer(loggedIn, authActions.tokenRemoved())
      expect(state.token).toBeNull()
      expect(state.userId).toBeNull()
    })
  })

  describe('passwordUpdated', () => {
    it('should update password', () => {
      const state = authReducer(authInitialState, authActions.passwordUpdated('secret123'))
      expect(state.password).toBe('secret123')
    })

    it('should clear password when empty string', () => {
      const withPassword = { ...authInitialState, password: 'old' }
      const state = authReducer(withPassword, authActions.passwordUpdated(''))
      expect(state.password).toBe('')
    })
  })

  describe('usernameUpdated', () => {
    it('should update username', () => {
      const state = authReducer(authInitialState, authActions.usernameUpdated('johndoe'))
      expect(state.username).toBe('johndoe')
    })
  })

  describe('setLogoutResponse', () => {
    it('should set logoutResponse to true', () => {
      const state = authReducer(authInitialState, authActions.setLogoutResponse(true))
      expect(state.logoutResponse).toBe(true)
    })

    it('should set logoutResponse to false', () => {
      const state = authReducer(authInitialState, authActions.setLogoutResponse(false))
      expect(state.logoutResponse).toBe(false)
    })
  })
})
