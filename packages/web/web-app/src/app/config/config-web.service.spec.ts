import { WebConfigService } from './config-web.service'

jest.mock('../store/store-web.redux')

describe('WebConfigService', () => {
  it('should exist', () => {
    expect(WebConfigService).toBeDefined()
  })

  it('should have public methods', () => {
    expect(WebConfigService.getNoRedirectRoutes).toBeDefined()
    expect(WebConfigService.getWebRoutes).toBeDefined()
    expect(WebConfigService.getWebUrls).toBeDefined()
    expect(WebConfigService.isDev).toBeDefined()
  })

  describe('getNoRedirectRoutes', () => {
    it('should return an array', () => {
      const noRedirectRoutes = WebConfigService.getNoRedirectRoutes()
      expect(Array.isArray(noRedirectRoutes)).toBe(true)
    })

    it('should return routes including login and main', () => {
      const noRedirectRoutes = WebConfigService.getNoRedirectRoutes()
      expect(noRedirectRoutes.length).toBeGreaterThan(0)
      expect(noRedirectRoutes).toContain('/')
    })
  })

  describe('getWebRoutes', () => {
    it('should return an object', () => {
      const webRoutes = WebConfigService.getWebRoutes()
      expect(webRoutes).toBeTruthy()
      expect(typeof webRoutes).toBe('object')
    })

    it('should include AUTH routes', () => {
      const webRoutes = WebConfigService.getWebRoutes()
      expect(webRoutes.AUTH).toBeDefined()
    })

    it('should include ADMIN routes', () => {
      const webRoutes = WebConfigService.getWebRoutes()
      expect(webRoutes.ADMIN).toBeDefined()
    })

    it('should include DASHBOARD routes', () => {
      const webRoutes = WebConfigService.getWebRoutes()
      expect(webRoutes.DASHBOARD).toBeDefined()
    })

    it('should include MAIN route', () => {
      const webRoutes = WebConfigService.getWebRoutes()
      expect(webRoutes.MAIN).toBe('/')
    })

    it('should include NOT_FOUND route', () => {
      const webRoutes = WebConfigService.getWebRoutes()
      expect(webRoutes.NOT_FOUND).toBeDefined()
    })
  })

  describe('getWebUrls', () => {
    it('should return an object with API_URL', () => {
      const webUrls = WebConfigService.getWebUrls()
      expect(webUrls).toBeTruthy()
      expect(webUrls.API_URL).toBeDefined()
    })

    it('should return an object with WEB_APP_URL', () => {
      const webUrls = WebConfigService.getWebUrls()
      expect(webUrls.WEB_APP_URL).toBeDefined()
    })
  })

  describe('isDev', () => {
    it('should return a boolean', () => {
      const result = WebConfigService.isDev()
      expect(typeof result).toBe('boolean')
    })
  })
})
