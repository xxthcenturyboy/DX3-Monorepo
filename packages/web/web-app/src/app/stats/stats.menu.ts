import { USER_ROLE } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../i18n'
import { store } from '../store/store-web.redux'
import type { AppMenuType } from '../ui/menus/app-menu.types'
import { STATS_SUDO_ROUTES } from './stats-web.consts'

export const statsMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: true,
    description: '',
    icon: IconNames.STATS,
    id: 'menu-stats',
    items: [
      {
        icon: IconNames.HEALTHZ,
        id: 'menu-item-stats-healthz',
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: STATS_SUDO_ROUTES.HEALTH,
        title: strings.API_HEALTH,
        type: 'ROUTE',
      },
      {
        beta: true,
        icon: IconNames.PEOPLE_OUTLINE,
        id: 'menu-item-stats-users',
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: STATS_SUDO_ROUTES.USERS,
        title: strings.USER_STATS,
        type: 'ROUTE',
      },
    ],
    title: strings.APP_STATS,
  }
}
