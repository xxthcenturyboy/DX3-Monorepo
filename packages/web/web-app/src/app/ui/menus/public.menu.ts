import { IconNames } from '@dx3/web-libs/ui/icons'

import { WebConfigService } from '../../config/config-web.service'
import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store/store-web.redux'
import type { AppMenuType } from '../../ui/menus/app-menu.types'

/**
 * Public menu for unauthenticated users
 * Includes FAQ, About, and Blog
 */
export const publicMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS
  const ROUTES = WebConfigService.getWebRoutes()

  return {
    collapsible: false,
    description: strings.PUBLIC_PAGES,
    id: 'menu-public',
    items: [
      {
        icon: IconNames.HELP_OUTLINE,
        id: 'menu-item-faq',
        routeKey: ROUTES.FAQ,
        title: strings.FAQ,
        type: 'ROUTE',
      },
      {
        icon: IconNames.INFO_OUTLINE,
        id: 'menu-item-about',
        routeKey: ROUTES.ABOUT,
        title: strings.ABOUT,
        type: 'ROUTE',
      },
      {
        icon: IconNames.ARTICLE,
        id: 'menu-item-blog',
        routeKey: ROUTES.BLOG,
        title: strings.BLOG,
        type: 'ROUTE',
      },
    ],
    title: strings.PUBLIC_PAGES,
  }
}

/**
 * Public menu for authenticated users
 * FAQ is included in the Support page, so it's excluded from this menu
 */
export const publicMenuAuthenticated = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS
  const ROUTES = WebConfigService.getWebRoutes()

  return {
    collapsible: false,
    description: strings.PUBLIC_PAGES,
    id: 'menu-public',
    items: [
      {
        icon: IconNames.INFO_OUTLINE,
        id: 'menu-item-about',
        routeKey: ROUTES.ABOUT,
        title: strings.ABOUT,
        type: 'ROUTE',
      },
      {
        icon: IconNames.ARTICLE,
        id: 'menu-item-blog',
        routeKey: ROUTES.BLOG,
        title: strings.BLOG,
        type: 'ROUTE',
      },
    ],
    title: strings.PUBLIC_PAGES,
  }
}
