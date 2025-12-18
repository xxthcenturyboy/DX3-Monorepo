import { store } from '../store/store-web.redux'

export const getAuthApiErrors = (): Record<string, string> => {
  const { strings } = store.getState().ui

  if (strings) {
    return {
      '100': strings.COULD_NOT_LOG_YOU_IN,
    }
  }

  return {}
}
