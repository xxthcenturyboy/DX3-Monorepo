import { supportAdminRoutes } from './support-admin.routes'

describe('supportAdminRoutes', () => {
  it('should be an array', () => {
    expect(Array.isArray(supportAdminRoutes)).toBe(true)
  })

  it('should have 2 routes', () => {
    expect(supportAdminRoutes.length).toBe(2)
  })

  it('should have a list route', () => {
    const listRoute = supportAdminRoutes.find((r) => r.path?.includes('list'))
    expect(listRoute).toBeDefined()
  })

  it('should have a detail route', () => {
    const detailRoute = supportAdminRoutes.find((r) => r.path?.includes(':id'))
    expect(detailRoute).toBeDefined()
  })

  it('should have elements defined for each route', () => {
    for (const route of supportAdminRoutes) {
      expect(route.element).toBeDefined()
    }
  })
})
