import { createSelector } from 'reselect'

import type { RootState } from '../store/store-web.redux'
import type { AuthStateType } from './auth-web.types'

const _selectAuthState = (state: RootState): AuthStateType => state.auth

// SSR-safe: auth reducer doesn't exist in SSR store
export const selectAuthToken = (state: RootState): string | null => {
  return state.auth?.token || null
}

export const selectIsAuthenticated = createSelector([selectAuthToken], (authToken): boolean => {
  return !!authToken
})
