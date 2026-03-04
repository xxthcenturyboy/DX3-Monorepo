jest.mock('../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: { translations: { DASHBOARD: 'Dashboard' } },
    }),
  },
}))

import { dashboardMenu } from './dashboard.menu'

describe('dashboardMenu', () => {
  it('should return a menu object', () => {
    const menu = dashboardMenu()
    expect(menu).toBeDefined()
    expect(typeof menu).toBe('object')
  })

  it('should have the correct id', () => {
    const menu = dashboardMenu()
    expect(menu.id).toBe('menu-dashboard')
  })

  it('should have at least one item', () => {
    const menu = dashboardMenu()
    expect(menu.items.length).toBeGreaterThan(0)
  })

  it('should include a dashboard route item', () => {
    const menu = dashboardMenu()
    const item = menu.items.find((i) => i.routeKey === '/dashboard')
    expect(item).toBeDefined()
  })

  it('should have collapsible = false', () => {
    const menu = dashboardMenu()
    expect(menu.collapsible).toBe(false)
  })
})
