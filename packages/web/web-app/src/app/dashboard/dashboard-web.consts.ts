import { IconNames } from '@dx3/web-libs/ui/icons'

import type { AppMenuType } from '../ui/menus/app-menu.types'

export const DASHBOARD_ENTITY_NAME = 'dashboard'

export const DASHBOARD_ROUTES = {
  MAIN: '/dashboard',
}

export const DASHBOARD_MENU: AppMenuType = {
  collapsible: false,
  description: '',
  id: 'menu-dashboard',
  items: [
    {
      icon: IconNames.DASHBOARD,
      id: 'menu-item-dashboard',
      routeKey: DASHBOARD_ROUTES.MAIN,
      title: 'Dashboard',
      type: 'ROUTE',
    },
  ],
  title: 'Dashboard',
}
