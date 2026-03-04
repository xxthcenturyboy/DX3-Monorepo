jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: { translations: { PROFILE: 'Profile' } },
    }),
  },
}))

import { userProfileMenu } from './user-profile.menu'

describe('userProfileMenu', () => {
  it('should return a menu object', () => {
    const menu = userProfileMenu()
    expect(menu).toBeDefined()
  })

  it('should have the correct id', () => {
    const menu = userProfileMenu()
    expect(menu.id).toBe('menu-user-profile')
  })

  it('should have at least one item', () => {
    const menu = userProfileMenu()
    expect(menu.items.length).toBeGreaterThan(0)
  })

  it('should include a profile route item', () => {
    const menu = userProfileMenu()
    const item = menu.items.find((i) => i.routeKey === '/profile')
    expect(item).toBeDefined()
  })

  it('should have collapsible = false', () => {
    const menu = userProfileMenu()
    expect(menu.collapsible).toBe(false)
  })
})
