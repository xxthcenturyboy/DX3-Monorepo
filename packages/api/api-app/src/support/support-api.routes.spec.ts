import { SupportRoutes } from './support-api.routes'

jest.mock('@dx3/api-libs/auth/middleware/ensure-logged-in.middleware')
jest.mock('@dx3/api-libs/auth/middleware/ensure-role.middleware')
jest.mock('../rate-limiters/rate-limiters.dx')
jest.mock('./support-api.controller')

describe('SupportRoutes', () => {
  it('should exist when imported', () => {
    expect(SupportRoutes).toBeDefined()
  })

  it('should have configure method', () => {
    expect(SupportRoutes.configure).toBeDefined()
    expect(typeof SupportRoutes.configure).toBe('function')
  })

  it('should return a router when configure is called', () => {
    const router = SupportRoutes.configure()
    expect(router).toBeDefined()
    expect(typeof router).toBe('function')
  })

  it('should have stack with routes', () => {
    const router = SupportRoutes.configure()
    // Router should have a stack of routes
    expect(router.stack).toBeDefined()
    expect(Array.isArray(router.stack)).toBe(true)
    expect(router.stack.length).toBeGreaterThan(0)
  })
})
