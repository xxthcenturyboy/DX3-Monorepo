import { IconNames } from '@dx3/web-libs/ui/system/icons'

import type { AppMenuType } from '../ui/menus/app-menu.types'

export const STATS_SUDO_WEB_ENTITY_NAME = 'stats'

export const STATS_SUDO_ROUTES = {
  HEALTH: `/sudo/stats/api-health`,
  USERS: '/sudo/stats/users',
}

export const STATS_SUDO_WEB_MENU: AppMenuType = {
  collapsible: true,
  description: '',
  icon: IconNames.STATS,
  id: 'menu-stats',
  items: [
    {
      icon: IconNames.HEALTHZ,
      id: 'menu-item-stats-healthz',
      restriction: 'SUPER_ADMIN',
      routeKey: STATS_SUDO_ROUTES.HEALTH,
      title: 'API Health',
      type: 'ROUTE',
    },
    {
      beta: true,
      icon: IconNames.PEOPLE_OUTLINE,
      id: 'menu-item-stats-users',
      restriction: 'SUPER_ADMIN',
      routeKey: STATS_SUDO_ROUTES.USERS,
      title: 'User Stats',
      type: 'ROUTE',
    },
  ],
  title: 'App Stats',
}
