import type { RouteObject } from 'react-router'

import { WebConfigService } from '../config/config-web.service'
import { AppRouter } from './app.router'

jest.mock('../store')

describe('AppRouter', () => {
  it('should exist', () => {
    // arrange
    // act
    //assert
    expect(AppRouter).toBeDefined()
  })

  it('should have public static method "getRouter"', () => {
    // arrange
    // act
    // assert
    expect(AppRouter.getRouter).toBeDefined()
  })

  it('should return something when invoked', () => {
    // arrange
    const ROUTES = WebConfigService.getWebRoutes()
    // act
    const router = AppRouter.getRouter()
    const routes = router.routes as RouteObject[]
    const routeChildren = routes[0].children
    // assert
    expect(router).toBeDefined()
    expect(routes).toBeDefined()
    expect(Array.isArray(routes)).toBe(true)
    expect(routes[0].element).toBeTruthy()
    expect(routes[0].errorElement).toBeTruthy()
    expect(Array.isArray(routes[0].children)).toBe(true)
    expect(routes[0].children?.length).toBeGreaterThan(0)

    if (routeChildren) {
      expect(routeChildren.some((r) => r.path === ROUTES.NOT_FOUND)).toBe(true)
      expect(routeChildren.some((r) => r.path === '*')).toBe(true)
      expect(
        routeChildren.some(
          (r) => r.path === ROUTES.FAQ || r.path === ROUTES.ABOUT || r.path === ROUTES.BLOG,
        ),
      ).toBe(true)
    }
  })
})
