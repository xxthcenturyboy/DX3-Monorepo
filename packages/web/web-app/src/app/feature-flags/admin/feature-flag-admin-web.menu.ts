import { USER_ROLE } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store/store-web.redux'
import type { AppMenuType } from '../../ui/menus/app-menu.types'
import { FEATURE_FLAG_ADMIN_ROUTES } from './feature-flag-admin-web.consts'

export const featureFlagAdminMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: false,
    description: '',
    id: 'menu-feature-flags',
    items: [
      {
        icon: IconNames.FLAG,
        id: 'menu-feature-flags-main',
        pathMatches: [FEATURE_FLAG_ADMIN_ROUTES.MAIN],
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: FEATURE_FLAG_ADMIN_ROUTES.LIST,
        title: strings.FEATURE_FLAGS,
        type: 'ROUTE',
      },
    ],
    title: strings.FEATURE_FLAGS,
  }
}
