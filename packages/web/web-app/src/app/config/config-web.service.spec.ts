import { WebConfigService } from './config-web.service'

jest.mock('../store')

describe('WebConfigService', () => {
  it('should exist', () => {
    // arrange
    // act
    // assert
    expect(WebConfigService).toBeDefined()
  })

  it('should have 3 public methods', () => {
    // arrange
    // act
    // assert
    expect(WebConfigService.getNoRedirectRoutes).toBeDefined()
    expect(WebConfigService.getWebRoutes).toBeDefined()
    expect(WebConfigService.getWebUrls).toBeDefined()
  })

  it('should getNoRedirectRoutes', () => {
    // arrange
    // act
    const noRedirectUrls = WebConfigService.getNoRedirectRoutes()
    // assert
    expect(noRedirectUrls).toBeTruthy()
    expect(Array.isArray(noRedirectUrls)).toBeTruthy()
    expect(noRedirectUrls.length).toEqual(3)
    expect(noRedirectUrls[0]).toEqual('/')
    expect(noRedirectUrls[1]).toEqual('/login')
    expect(noRedirectUrls[2]).toEqual('/l')
  })

  it('should getWebRoutes', () => {
    // arrange
    // act
    const webRoutes = WebConfigService.getWebRoutes()
    const routeKeys = Object.keys(webRoutes)
    // assert
    expect(webRoutes).toBeTruthy()
    expect(routeKeys.length).toEqual(9)
    expect(routeKeys[0]).toEqual('ADMIN')
    expect(routeKeys[1]).toEqual('AUTH')
    expect(routeKeys[2]).toEqual('DASHBOARD')
    expect(routeKeys[3]).toEqual('LIMITED')
    expect(routeKeys[4]).toEqual('MAIN')
    expect(routeKeys[5]).toEqual('NOT_FOUND')
    expect(routeKeys[6]).toEqual('SHORTLINK')
    expect(routeKeys[7]).toEqual('SUDO')
    expect(routeKeys[8]).toEqual('USER_PROFILE')
  })

  it('should get standard menus', () => {
    // arrange
    // act
    const webUrls = WebConfigService.getWebUrls()
    const urlKeys = Object.keys(webUrls)
    // assert
    expect(webUrls).toBeTruthy()
    expect(urlKeys.length).toEqual(2)
    expect(urlKeys[0]).toEqual('API_URL')
    expect(urlKeys[1]).toEqual('WEB_APP_URL')
  })
})
