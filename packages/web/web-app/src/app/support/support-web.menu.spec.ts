jest.mock('../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: { translations: { SUPPORT: 'Support' } },
    }),
  },
}))

import { supportMenu } from './support-web.menu'

describe('supportMenu', () => {
  it('should return a menu object', () => {
    const menu = supportMenu()
    expect(menu).toBeDefined()
  })

  it('should have id "menu-support"', () => {
    const menu = supportMenu()
    expect(menu.id).toBe('menu-support')
  })

  it('should have exactly one item', () => {
    const menu = supportMenu()
    expect(menu.items).toHaveLength(1)
  })

  it('should have support route item', () => {
    const menu = supportMenu()
    const item = menu.items.find((i) => i.id === 'menu-item-support')
    expect(item).toBeDefined()
    expect(item?.routeKey).toBe('/support')
  })

  it('should have collapsible = false', () => {
    const menu = supportMenu()
    expect(menu.collapsible).toBe(false)
  })
})
