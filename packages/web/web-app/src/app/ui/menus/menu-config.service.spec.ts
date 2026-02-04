import { USER_ROLE } from '@dx3/models-shared'

import { MenuConfigService } from './menu-config.service'

describe('MenuConfigService', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(MenuConfigService).toBeDefined()
  })

  it('should have getMenus public method', () => {
    // arrange
    // act
    const service = new MenuConfigService()
    // assert
    expect(service.getMenus).toBeDefined()
  })

  it('should have CARDINAL_MENU_SET array', () => {
    // arrange
    // act
    const service = new MenuConfigService()
    // assert
    expect(service.CARDINAL_MENU_SET).toBeDefined()
    expect(Array.isArray(service.CARDINAL_MENU_SET)).toBe(true)
    expect(service.CARDINAL_MENU_SET.length).toEqual(4)
  })

  it('should get super admin menus', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const saMenus = service.getMenus([USER_ROLE.SUPER_ADMIN])
    // assert
    expect(saMenus).toBeTruthy()
    expect(Array.isArray(saMenus)).toBeTruthy()
    expect(saMenus.length).toEqual(4)
    expect(saMenus[0].id).toEqual('menu-dashboard')
    expect(saMenus[1].id).toEqual('menu-user-profile')
    expect(saMenus[2].id).toEqual('menu-user')
    expect(saMenus[3].id).toEqual('menu-stats')
  })

  it('should get admin menus', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const adminMenus = service.getMenus([USER_ROLE.ADMIN])
    // assert
    expect(adminMenus).toBeTruthy()
    expect(Array.isArray(adminMenus)).toBeTruthy()
    expect(adminMenus.length).toEqual(3)
    expect(adminMenus[0].id).toEqual('menu-dashboard')
    expect(adminMenus[1].id).toEqual('menu-user-profile')
    expect(adminMenus[2].id).toEqual('menu-user')
  })

  it('should get standard user menus', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const standardMenus = service.getMenus([USER_ROLE.USER])
    // assert
    expect(standardMenus).toBeTruthy()
    expect(Array.isArray(standardMenus)).toBeTruthy()
    expect(standardMenus.length).toEqual(2)
    expect(standardMenus[0].id).toEqual('menu-dashboard')
    expect(standardMenus[1].id).toEqual('menu-user-profile')
  })

  it('should get editor menus (between USER and ADMIN)', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const editorMenus = service.getMenus([USER_ROLE.EDITOR])
    // assert
    expect(editorMenus).toBeTruthy()
    expect(Array.isArray(editorMenus)).toBeTruthy()
    // EDITOR should see same as USER (no admin menus yet)
    expect(editorMenus.length).toEqual(2)
  })

  it('should get logging admin menus', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const loggingMenus = service.getMenus([USER_ROLE.LOGGING_ADMIN])
    // assert
    expect(loggingMenus).toBeTruthy()
    expect(Array.isArray(loggingMenus)).toBeTruthy()
    // LOGGING_ADMIN (order 5) should see ADMIN (order 3) menus
    expect(loggingMenus.length).toEqual(3)
  })

  it('should get metrics admin menus', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const metricsMenus = service.getMenus([USER_ROLE.METRICS_ADMIN])
    // assert
    expect(metricsMenus).toBeTruthy()
    expect(Array.isArray(metricsMenus)).toBeTruthy()
    // METRICS_ADMIN (order 4) should see ADMIN (order 3) menus
    expect(metricsMenus.length).toEqual(3)
  })

  it('should handle empty roles array as standard user', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const menus = service.getMenus([])
    // assert
    expect(menus).toBeTruthy()
    expect(Array.isArray(menus)).toBeTruthy()
    // Empty roles = no restricted items visible
    expect(menus.length).toEqual(2)
  })

  it('should handle multiple roles and use highest privilege', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const menus = service.getMenus([USER_ROLE.USER, USER_ROLE.ADMIN])
    // assert
    expect(menus).toBeTruthy()
    // User with both USER and ADMIN should see ADMIN menus
    expect(menus.length).toEqual(3)
  })
})
