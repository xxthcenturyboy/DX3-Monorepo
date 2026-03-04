jest.mock('../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: {
        translations: {
          COULD_NOT_LOG_YOU_IN: 'Could not log you in.',
        },
      },
    }),
  },
}))

jest.mock('../i18n', () => ({
  selectTranslations: jest.fn().mockReturnValue({
    COULD_NOT_LOG_YOU_IN: 'Could not log you in.',
  }),
}))

import { getAuthApiErrors } from './auth-web-api-errors'

describe('getAuthApiErrors', () => {
  it('should return a record with error codes', () => {
    const errors = getAuthApiErrors()
    expect(errors).toBeDefined()
    expect(typeof errors).toBe('object')
  })

  it('should include error code 100', () => {
    const errors = getAuthApiErrors()
    expect(errors).toHaveProperty('100')
  })

  it('should map error 100 to the localized login error message', () => {
    const errors = getAuthApiErrors()
    expect(errors['100']).toBe('Could not log you in.')
  })
})
