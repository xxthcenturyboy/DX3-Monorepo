import { AuthRoutes } from './auth-api.routes'

jest.mock('../rate-limiters/rate-limiters.dx.ts', () => {
  const noop = (_req: unknown, _res: unknown, next: (err?: unknown) => void) => next()
  return {
    DxRateLimiters: {
      accountCreation: () => noop,
      authLookup: () => noop,
      login: () => noop,
      standard: () => noop,
      strict: () => noop,
      veryStrict: () => noop,
    },
  }
})

describe('AuthRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(AuthRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(AuthRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = AuthRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
