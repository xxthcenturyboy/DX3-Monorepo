import { renderWithProviders } from '../../../testing-render'
import { WebConfigService } from '../config/config-web.service'
import { AdminRouter, AdminWebRouterConfig } from './admin.router'

jest.mock('../store')

describe('AdminRouter', () => {
  it('should exist', () => {
    // arrange
    // act
    //assert
    expect(AdminRouter).toBeDefined()
  })

  it('should render something', () => {
    // arrange
    // act
    const { baseElement } = renderWithProviders(AdminRouter())
    //assert
    expect(baseElement).toBeTruthy()
  })
})

describe('AdminWebRouterConfig', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(AdminWebRouterConfig).toBeDefined()
  })

  it('should have public static method "getRouter"', () => {
    // arrange
    // act
    // assert
    expect(AdminWebRouterConfig.getRouter).toBeDefined()
  })

  it('should return something when invoked', () => {
    // arrange
    const ROUTES = WebConfigService.getWebRoutes()
    // act
    const router = AdminWebRouterConfig.getRouter()
    const routes = router[0].children
    // assert
    expect(router).toBeDefined()
    expect(Array.isArray(router)).toBe(true)
    expect(router[0].element).toBeTruthy()
    expect(router[0].errorElement).toBeTruthy()
    expect(Array.isArray(router[0].children)).toBe(true)
    expect(router[0].children?.length).toEqual(3)

    if (routes) {
      expect(routes[0].path).toEqual(ROUTES.ADMIN.USER.MAIN)
      expect(routes[1].path).toEqual(ROUTES.ADMIN.USER.LIST)
      expect(routes[2].path).toEqual(`${ROUTES.ADMIN.USER.DETAIL}/:id`)
    }
  })
})
