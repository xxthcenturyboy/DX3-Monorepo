import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store/store-web.redux'
import type { AppMenuType } from '../../ui/menus/app-menu.types'
import { USER_PROFILE_ROUTES } from './user-profile-web.consts'

export const userProfileMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: false,
    description: '',
    id: 'menu-user-profile',
    items: [
      {
        icon: IconNames.ACCESSIBLITY,
        id: 'menu-item-user-profile',
        routeKey: USER_PROFILE_ROUTES.MAIN,
        title: strings.PROFILE,
        type: 'ROUTE',
      },
    ],
    title: strings.PROFILE,
  }
}
