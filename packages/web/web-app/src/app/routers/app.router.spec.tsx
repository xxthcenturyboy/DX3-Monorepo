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
    expect(routes[0].children?.length).toEqual(8)

    if (routeChildren) {
      expect(routeChildren[0].path).toEqual(ROUTES.MAIN)
      expect(routeChildren[1].path).toEqual(ROUTES.AUTH.LOGIN)
      expect(routeChildren[2].path).toEqual(ROUTES.AUTH.MAIN)
      expect(routeChildren[3].path).toEqual(`${ROUTES.SHORTLINK.MAIN}/:token`)
      expect(routeChildren[4]).toHaveProperty('element')
      expect(routeChildren[4]).toHaveProperty('errorElement')
      expect(routeChildren[4]).toHaveProperty('children')
      expect(Array.isArray(routeChildren[4].children)).toBe(true)
      expect(routeChildren[4].children?.length).toEqual(4)
      expect(routeChildren[5].path).toEqual(ROUTES.NOT_FOUND)
      expect(routeChildren[6].path).toEqual('/cyberia')
      expect(routeChildren[7].path).toEqual('*')
    }
  })
})
