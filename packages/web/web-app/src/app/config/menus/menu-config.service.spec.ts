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
    const saMenus = service.getMenus('SUPER_ADMIN')
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
    const adminMenus = service.getMenus('ADMIN')
    // assert
    expect(adminMenus).toBeTruthy()
    expect(Array.isArray(adminMenus)).toBeTruthy()
    expect(adminMenus.length).toEqual(3)
    expect(adminMenus[0].id).toEqual('menu-dashboard')
    expect(adminMenus[1].id).toEqual('menu-user-profile')
    expect(adminMenus[2].id).toEqual('menu-user')
  })

  it('should get standard menus', () => {
    // arrange
    const service = new MenuConfigService()
    // act
    const standardMenus = service.getMenus()
    // assert
    expect(standardMenus).toBeTruthy()
    expect(Array.isArray(standardMenus)).toBeTruthy()
    expect(standardMenus.length).toEqual(2)
    expect(standardMenus[0].id).toEqual('menu-dashboard')
    expect(standardMenus[1].id).toEqual('menu-user-profile')
  })
})
