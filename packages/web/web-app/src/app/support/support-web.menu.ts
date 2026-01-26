import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../i18n'
import { store } from '../store/store-web.redux'
import type { AppMenuType } from '../ui/menus/app-menu.types'
import { SUPPORT_ROUTES } from './support-web.consts'

/**
 * Support menu for authenticated users
 * Single item linking to the combined Support page (FAQ + Contact Us)
 */
export const supportMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: false,
    description: strings.SUPPORT,
    id: 'menu-support',
    items: [
      {
        icon: IconNames.SUPPORT,
        id: 'menu-item-support',
        routeKey: SUPPORT_ROUTES.MAIN,
        title: strings.SUPPORT,
        type: 'ROUTE',
      },
    ],
    title: strings.SUPPORT,
  }
}
