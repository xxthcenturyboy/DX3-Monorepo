import type { RootState } from '../../store/store-web.redux'

/**
 * Select the unviewed support request count
 */
export const selectSupportUnviewedCount = (state: RootState): number => {
  return state.support.unviewedCount
}

/**
 * Select if there are unviewed support requests
 */
export const selectHasUnviewedSupport = (state: RootState): boolean => {
  return state.support.unviewedCount > 0
}

/**
 * Select the last toast payload for support
 */
export const selectSupportLastToast = (state: RootState) => {
  return state.support.lastToast
}
