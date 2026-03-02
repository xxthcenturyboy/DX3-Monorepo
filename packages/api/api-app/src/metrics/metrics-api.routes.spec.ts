import { MetricsRoutes } from './metrics-api.routes'

jest.mock('@dx3/api-libs/auth/middleware/ensure-logged-in.middleware', () => ({
  ensureLoggedIn: jest.fn((_req: unknown, _res: unknown, next: () => void) => next()),
}))
jest.mock('@dx3/api-libs/auth/middleware/ensure-role.middleware', () => ({
  hasMetricsAdminRole: jest.fn((_req: unknown, _res: unknown, next: () => void) => next()),
}))

describe('MetricsRoutes', () => {
  it('should exist when imported', () => {
    expect(MetricsRoutes).toBeDefined()
  })

  it('should have static configure method', () => {
    expect(MetricsRoutes.configure).toBeDefined()
  })

  it('should return a router when configure is invoked', () => {
    // arrange
    // act
    const router = MetricsRoutes.configure()
    // assert
    expect(router).toBeDefined()
    expect(typeof router).toBe('function')
  })
})
