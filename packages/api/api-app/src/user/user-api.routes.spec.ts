import { UserRoutes } from './user-api.routes'

jest.mock('../rate-limiters/rate-limiters.dx', () => ({
  DxRateLimiters: {
    accountCreation: jest.fn(() =>
      jest.fn((_req: unknown, _res: unknown, next: () => void) => next()),
    ),
    authLookup: jest.fn(() => jest.fn((_req: unknown, _res: unknown, next: () => void) => next())),
    login: jest.fn(() => jest.fn((_req: unknown, _res: unknown, next: () => void) => next())),
    standard: jest.fn(() => jest.fn((_req: unknown, _res: unknown, next: () => void) => next())),
    strict: jest.fn(() => jest.fn((_req: unknown, _res: unknown, next: () => void) => next())),
    veryStrict: jest.fn(() => jest.fn((_req: unknown, _res: unknown, next: () => void) => next())),
  },
}))

describe('UserRoutes', () => {
  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(UserRoutes).toBeDefined()
  })

  it('should have static configure method without being instantiated', () => {
    // arrange
    // act
    // assert
    expect(UserRoutes.configure).toBeDefined()
  })

  it('should get routes when invoked', () => {
    // arrange
    // act
    const routes = UserRoutes.configure()
    // assert
    expect(routes).toBeDefined()
  })
})
