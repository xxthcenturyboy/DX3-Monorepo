import { createSelector } from 'reselect'

import type { RootState } from '../store/store-web.redux'
import type { AuthStateType } from './auth-web.types'

const _selectAuthState = (state: RootState): AuthStateType => state.auth
export const selectAuthToken = (state: RootState): string | null => state.auth.token

export const selectIsAuthenticated = createSelector([selectAuthToken], (authToken): boolean => {
  return !!authToken
})
