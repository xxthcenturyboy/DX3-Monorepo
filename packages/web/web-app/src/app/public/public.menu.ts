import { IconNames } from '@dx3/web-libs/ui/icons'

import { WebConfigService } from '../config/config-web.service'
import { DEFAULT_STRINGS } from '../i18n'
import { store } from '../store/store-web.redux'
import type { AppMenuType } from '../ui/menus/app-menu.types'

export const publicMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS
  const ROUTES = WebConfigService.getWebRoutes()

  return {
    collapsible: false,
    description: strings.PUBLIC_PAGES,
    id: 'menu-public',
    items: [
      {
        icon: IconNames.HELP,
        id: 'menu-item-faq',
        routeKey: ROUTES.FAQ,
        title: strings.FAQ,
        type: 'ROUTE',
      },
      {
        icon: IconNames.INFO,
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
