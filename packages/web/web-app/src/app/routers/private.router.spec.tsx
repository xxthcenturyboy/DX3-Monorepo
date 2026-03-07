import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { WebConfigService } from '../config/config-web.service'
import { PrivateRouter, PrivateWebRouterConfig } from './private.router'

jest.mock('../store/store-web.redux')

describe('PrivateRouter', () => {
  it('should exist', () => {
    // arrange
    // act
    //assert
    expect(PrivateRouter).toBeDefined()
  })

  it('should render something', () => {
    // arrange
    // act
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <PrivateRouter />
      </MemoryRouter>,
    )
    //assert
    expect(baseElement).toBeTruthy()
  })
})

describe('PrivateWebRouterConfig', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(PrivateWebRouterConfig).toBeDefined()
  })

  it('should have public static method "getRouter"', () => {
    // arrange
    // act
    // assert
    expect(PrivateWebRouterConfig.getRouter).toBeDefined()
  })

  it('should return something when invoked', () => {
    // arrange
    const ROUTES = WebConfigService.getWebRoutes()
    // act
    const router = PrivateWebRouterConfig.getRouter()
    const routes = router[0].children
    // assert
    expect(router).toBeDefined()
    expect(Array.isArray(router)).toBe(true)
    expect(router[0].element).toBeTruthy()
    expect(router[0].errorElement).toBeTruthy()
    expect(Array.isArray(router[0].children)).toBe(true)
    expect(router[0].children?.length ?? 0).toBeGreaterThanOrEqual(3)

    if (routes) {
      expect(routes[0].path).toEqual(ROUTES.DASHBOARD.MAIN)
      expect(routes.some((r) => r.path === ROUTES.USER_PROFILE.MAIN)).toBe(true)
    }
  })
})
