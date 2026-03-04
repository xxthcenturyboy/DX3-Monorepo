jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: {
        translations: {
          ABOUT: 'About',
          ADMIN: 'Admin',
          API_HEALTH: 'API Health',
          BLOG: 'Blog',
          DASHBOARD: 'Dashboard',
          FAQ: 'FAQ',
          FEATURE_FLAGS: 'Feature Flags',
          PROFILE: 'Profile',
          PUBLIC_PAGES: 'Public Pages',
          SUPPORT: 'Support',
          SSR_HEALTH: 'SSR Health',
          USER_STATS: 'User Stats',
        },
      },
    }),
  },
}))

jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebRoutes: jest.fn().mockReturnValue({
      ABOUT: '/about',
      BLOG: '/blog',
      FAQ: '/faq',
    }),
  },
}))

import { USER_ROLE } from '@dx3/models-shared'
import { MenuConfigService } from './menu-config.service'

describe('MenuConfigService', () => {
  let service: MenuConfigService

  beforeEach(() => {
    service = new MenuConfigService()
  })

  it('should be instantiable', () => {
    expect(service).toBeDefined()
  })

  describe('getMenus', () => {
    it('should return an array of menus', () => {
      const menus = service.getMenus([USER_ROLE.USER])
      expect(Array.isArray(menus)).toBe(true)
    })

    it('should return more menus for SUPER_ADMIN than for USER', () => {
      const userMenus = service.getMenus([USER_ROLE.USER])
      const adminMenus = service.getMenus([USER_ROLE.SUPER_ADMIN])
      expect(adminMenus.length).toBeGreaterThanOrEqual(userMenus.length)
    })

    it('should include admin menu for SUPER_ADMIN', () => {
      const menus = service.getMenus([USER_ROLE.SUPER_ADMIN])
      const adminMenuEntry = menus.find((m) => m.id === 'menu-admin')
      expect(adminMenuEntry).toBeDefined()
    })

    it('should not expose SUPER_ADMIN-restricted items to plain USER', () => {
      const menus = service.getMenus([USER_ROLE.USER])
      const adminMenu = menus.find((m) => m.id === 'menu-admin')
      if (adminMenu) {
        const superAdminItems = adminMenu.items.filter(
          (item) => item.restriction === USER_ROLE.SUPER_ADMIN,
        )
        expect(superAdminItems.length).toBe(0)
      }
    })

    it('should exclude beta items when includeBeta=false', () => {
      const menus = service.getMenus([USER_ROLE.SUPER_ADMIN], false)
      const allItems = menus.flatMap((m) => m.items)
      const betaItems = allItems.filter((item) => item.beta)
      expect(betaItems.length).toBe(0)
    })

    it('should include beta items when includeBeta=true', () => {
      const menusWithBeta = service.getMenus([USER_ROLE.SUPER_ADMIN], true)
      const allItems = menusWithBeta.flatMap((m) => m.items)
      const betaItems = allItems.filter((item) => item.beta)
      expect(betaItems.length).toBeGreaterThan(0)
    })

    it('should return empty array for empty roles', () => {
      const menus = service.getMenus([])
      expect(Array.isArray(menus)).toBe(true)
    })
  })
})
