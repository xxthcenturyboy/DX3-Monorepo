jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: {
        translations: {
          ABOUT: 'About',
          BLOG: 'Blog',
          FAQ: 'FAQ',
          PUBLIC_PAGES: 'Public Pages',
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

import { publicMenu, publicMenuAuthenticated } from './public.menu'

describe('publicMenu', () => {
  it('should return a menu object', () => {
    const menu = publicMenu()
    expect(menu).toBeDefined()
  })

  it('should have id "menu-public"', () => {
    const menu = publicMenu()
    expect(menu.id).toBe('menu-public')
  })

  it('should have 3 items including FAQ, About, Blog', () => {
    const menu = publicMenu()
    expect(menu.items).toHaveLength(3)
    const ids = menu.items.map((i) => i.id)
    expect(ids).toContain('menu-item-faq')
    expect(ids).toContain('menu-item-about')
    expect(ids).toContain('menu-item-blog')
  })

  it('should have collapsible = false', () => {
    const menu = publicMenu()
    expect(menu.collapsible).toBe(false)
  })
})

describe('publicMenuAuthenticated', () => {
  it('should return a menu object', () => {
    const menu = publicMenuAuthenticated()
    expect(menu).toBeDefined()
  })

  it('should not include FAQ item (FAQ is in Support for authenticated users)', () => {
    const menu = publicMenuAuthenticated()
    const ids = menu.items.map((i) => i.id)
    expect(ids).not.toContain('menu-item-faq')
  })

  it('should include About and Blog items', () => {
    const menu = publicMenuAuthenticated()
    const ids = menu.items.map((i) => i.id)
    expect(ids).toContain('menu-item-about')
    expect(ids).toContain('menu-item-blog')
  })
})
