import { USER_ROLE } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'

import { FEATURE_FLAG_ADMIN_ROUTES } from '../../feature-flags/admin/feature-flag-admin-web.consts'
import { DEFAULT_STRINGS } from '../../i18n'
import { STATS_SUDO_ROUTES } from '../../stats/stats-web.consts'
import { store } from '../../store/store-web.redux'
import { SUPPORT_ADMIN_ROUTES } from '../../support/support-web.consts'
import { USER_ADMIN_ROUTES } from '../../user/admin/user-admin-web.consts'
import type { AppMenuType } from './app-menu.types'

export const adminMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: true,
    description: '',
    icon: IconNames.ADMIN_PANEL_SETTINGS,
    id: 'menu-admin',
    items: [
      {
        icon: IconNames.HEALTHZ,
        id: 'menu-item-admin-api-health',
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: STATS_SUDO_ROUTES.HEALTH,
        title: strings.API_HEALTH,
        type: 'ROUTE',
      },
      {
        icon: IconNames.HEALTHZ,
        id: 'menu-item-admin-ssr-health',
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: STATS_SUDO_ROUTES.SSR_HEALTH,
        title: strings.SSR_HEALTH,
        type: 'ROUTE',
      },
      {
        beta: true,
        icon: IconNames.PEOPLE_OUTLINE,
        id: 'menu-item-admin-user-stats',
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: STATS_SUDO_ROUTES.USERS,
        title: strings.USER_STATS,
        type: 'ROUTE',
      },
      {
        icon: IconNames.FLAG,
        id: 'menu-item-admin-feature-flags',
        pathMatches: [FEATURE_FLAG_ADMIN_ROUTES.MAIN],
        restriction: USER_ROLE.SUPER_ADMIN,
        routeKey: FEATURE_FLAG_ADMIN_ROUTES.LIST,
        title: strings.FEATURE_FLAGS,
        type: 'ROUTE',
      },
      {
        badge: true,
        badgeSelector: 'support',
        icon: IconNames.SUPPORT_AGENT,
        id: 'menu-item-admin-support-requests',
        pathMatches: [SUPPORT_ADMIN_ROUTES.MAIN],
        restriction: USER_ROLE.ADMIN,
        routeKey: SUPPORT_ADMIN_ROUTES.LIST,
        title: strings.SUPPORT_REQUESTS,
        type: 'ROUTE',
      },
      {
        icon: IconNames.PEOPLE,
        id: 'menu-item-admin-user-admin',
        pathMatches: [USER_ADMIN_ROUTES.MAIN],
        restriction: USER_ROLE.ADMIN,
        routeKey: USER_ADMIN_ROUTES.LIST,
        title: strings.USER_ADMIN,
        type: 'ROUTE',
      },
    ],
    title: strings.ADMIN,
  }
}
