jest.mock('../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: {
        translations: {
          NOT_FOUND: 'Not Found',
          WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR: 'Not found',
        },
      },
    }),
  },
}))

import { AUTH_ROUTES } from './auth-web.consts'
import { AuthWebRouterConfig } from './auth-web.router'

describe('AuthWebRouterConfig', () => {
  it('should return a router config array', () => {
    const config = AuthWebRouterConfig.getRouter()
    expect(Array.isArray(config)).toBe(true)
    expect(config.length).toBeGreaterThan(0)
  })

  it('should include login and signup routes as children', () => {
    const config = AuthWebRouterConfig.getRouter()
    const children = config[0]?.children || []
    const paths = children.map((c) => c.path)
    expect(paths).toContain(AUTH_ROUTES.LOGIN)
    expect(paths).toContain(AUTH_ROUTES.SIGNUP)
  })

  it('should have an element for the root route', () => {
    const config = AuthWebRouterConfig.getRouter()
    expect(config[0].element).toBeDefined()
  })
})
