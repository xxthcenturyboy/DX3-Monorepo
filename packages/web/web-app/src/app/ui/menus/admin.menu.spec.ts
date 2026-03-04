jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: {
        translations: {
          ADMIN: 'Admin',
          ADMIN_LOGS_TITLE: 'System Logs',
          API_HEALTH: 'API Health',
          FEATURE_FLAGS: 'Feature Flags',
          METRICS_DASHBOARD: 'Metrics Dashboard',
          SSR_HEALTH: 'SSR Health',
          SUPPORT_REQUESTS: 'Support Requests',
          USER_ADMIN: 'User Admin',
          USER_STATS: 'User Stats',
        },
      },
    }),
  },
}))

import { adminMenu } from './admin.menu'

describe('adminMenu', () => {
  it('should return a menu object', () => {
    const menu = adminMenu()
    expect(menu).toBeDefined()
    expect(typeof menu).toBe('object')
  })

  it('should have id "menu-admin"', () => {
    const menu = adminMenu()
    expect(menu.id).toBe('menu-admin')
  })

  it('should have collapsible = true', () => {
    const menu = adminMenu()
    expect(menu.collapsible).toBe(true)
  })

  it('should have multiple items', () => {
    const menu = adminMenu()
    expect(menu.items.length).toBeGreaterThan(3)
  })

  it('should have role-restricted items', () => {
    const menu = adminMenu()
    const restrictedItems = menu.items.filter((item) => item.restriction)
    expect(restrictedItems.length).toBeGreaterThan(0)
  })

  it('should include a feature flags item', () => {
    const menu = adminMenu()
    const flagsItem = menu.items.find((i) => i.id === 'menu-item-admin-feature-flags')
    expect(flagsItem).toBeDefined()
  })

  it('should have badge = true for support notifications', () => {
    const menu = adminMenu()
    expect(menu.badge).toBe(true)
  })
})
