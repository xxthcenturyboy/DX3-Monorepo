import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../i18n'
import { store } from '../store/store-web.redux'
import type { AppMenuType } from '../ui/menus/app-menu.types'
import { DASHBOARD_ROUTES } from './dashboard-web.consts'

export const dashboardMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: false,
    description: '',
    id: 'menu-dashboard',
    items: [
      {
        icon: IconNames.DASHBOARD,
        id: 'menu-item-dashboard',
        routeKey: DASHBOARD_ROUTES.MAIN,
        title: strings.DASHBOARD,
        type: 'ROUTE',
      },
    ],
    title: strings.DASHBOARD,
  }
}
