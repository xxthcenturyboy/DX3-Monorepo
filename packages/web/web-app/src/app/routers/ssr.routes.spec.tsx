jest.mock('../config/config-web.service', () => ({
  WebConfigService: {
    getWebRoutes: jest.fn().mockReturnValue({
      ABOUT: '/about',
      AUTH: { LOGIN: '/login', SIGNUP: '/signup' },
      BLOG: '/blog',
      DASHBOARD: { MAIN: '/dashboard' },
      FAQ: '/faq',
      LIMITED: '/limited',
      MAIN: '/',
      NOT_FOUND: '/not-found',
      SHORTLINK: { MAIN: '/s' },
    }),
    getWebUrls: jest.fn().mockReturnValue({ API_URL: 'http://localhost:4000' }),
  },
}))

jest.mock('../ui/menus/app-nav-bar-ssr.menu', () => ({
  AppNavBarSsr: () => <div data-testid="nav-bar-ssr">NavBar SSR</div>,
}))

import { createClientOnlyRoutes, createPublicRoutes } from './ssr.routes'

const mockStrings = {
  BACK: 'Back',
  NOT_FOUND: 'Not Found',
  TIMEOUT_TURBO: 'Too many requests',
  WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR: 'Not found',
  YOU_HAVE_MADE_TOO_MANY_REQUESTS: 'Too many requests',
}

describe('ssr.routes', () => {
  describe('createPublicRoutes', () => {
    it('should return route objects array', () => {
      const routes = createPublicRoutes(mockStrings)
      expect(Array.isArray(routes)).toBe(true)
      expect(routes.length).toBeGreaterThan(0)
    })

    it('should return a root route with children', () => {
      const routes = createPublicRoutes(mockStrings)
      const rootRoute = routes[0]
      expect(rootRoute).toBeDefined()
      expect(Array.isArray(rootRoute.children)).toBe(true)
    })

    it('should include home, faq, about, blog routes in children', () => {
      const routes = createPublicRoutes(mockStrings)
      const rootRoute = routes[0]
      const children = rootRoute.children || []

      const paths = children.map((c) => c.path).filter(Boolean)
      expect(paths).toContain('/')
      expect(paths).toContain('/faq')
      expect(paths).toContain('/about')
      expect(paths).toContain('/blog')
    })
  })

  describe('createClientOnlyRoutes', () => {
    it('should return route objects array', () => {
      const routes = createClientOnlyRoutes(mockStrings)
      expect(Array.isArray(routes)).toBe(true)
      expect(routes.length).toBeGreaterThan(0)
    })

    it('should include not-found and limited routes', () => {
      const routes = createClientOnlyRoutes(mockStrings)
      const paths = routes.map((r) => r.path)
      expect(paths).toContain('/not-found')
      expect(paths).toContain('/limited')
      expect(paths).toContain('*')
    })
  })
})
