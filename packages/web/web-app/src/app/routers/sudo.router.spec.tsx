import { MemoryRouter } from 'react-router-dom'

import { renderWithProviders } from '../../../testing-render'
import { WebConfigService } from '../config/config-web.service'
import { SudoRouter, SudoWebRouterConfig } from './sudo.router'

jest.mock('../store')

describe('SudoRouter', () => {
  it('should exist', () => {
    // arrange
    // act
    //assert
    expect(SudoRouter).toBeDefined()
  })

  it('should render something', () => {
    // arrange
    // act
    const { baseElement } = renderWithProviders(<MemoryRouter>{SudoRouter()}</MemoryRouter>)
    //assert
    expect(baseElement).toBeTruthy()
  })
})

describe('SudoWebRouterConfig', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(SudoWebRouterConfig).toBeDefined()
  })

  it('should have public static method "getRouter"', () => {
    // arrange
    // act
    // assert
    expect(SudoWebRouterConfig.getRouter).toBeDefined()
  })

  it('should return something when invoked', () => {
    // arrange
    const ROUTES = WebConfigService.getWebRoutes()
    // act
    const router = SudoWebRouterConfig.getRouter()
    const routes = router[0].children
    // assert
    expect(router).toBeDefined()
    expect(Array.isArray(router)).toBe(true)
    expect(router[0].element).toBeTruthy()
    expect(router[0].errorElement).toBeTruthy()
    expect(Array.isArray(router[0].children)).toBe(true)
    expect(router[0].children?.length).toEqual(2)

    if (routes) {
      expect(routes[0].path).toEqual(ROUTES.SUDO.STATS.HEALTH)
      expect(routes[1].path).toEqual(ROUTES.SUDO.STATS.USERS)
    }
  })
})
