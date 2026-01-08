import { USER_ROLE } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store/store-web.redux'
import type { AppMenuType } from '../../ui/menus/app-menu.types'
import { USER_ADMIN_ROUTES } from './user-admin-web.consts'

export const userAdminMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: false,
    description: '',
    id: 'menu-user',
    items: [
      {
        icon: IconNames.PEOPLE,
        id: 'menu-user-main',
        pathMatches: [USER_ADMIN_ROUTES.MAIN],
        restriction: USER_ROLE.ADMIN,
        routeKey: USER_ADMIN_ROUTES.LIST,
        title: strings.USER_ADMIN,
        type: 'ROUTE',
      },
    ],
    title: strings.USER_ADMIN,
  }
}
