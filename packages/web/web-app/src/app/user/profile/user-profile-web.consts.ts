import { IconNames } from '@dx3/web-libs/ui/system/icons'

import type { AppMenuType } from '../../ui/menus/app-menu.types'

export const USER_PROFILE_ENTITY_NAME = 'userProfile'

export const USER_PROFILE_ROUTES = {
  MAIN: `/profile`,
}

export const USER_PROFILE_MENU: AppMenuType = {
  collapsible: false,
  description: '',
  id: 'menu-user-profile',
  items: [
    {
      icon: IconNames.ACCESSIBLITY,
      id: 'menu-item-user-profile',
      routeKey: USER_PROFILE_ROUTES.MAIN,
      title: 'Profile',
      type: 'ROUTE',
    },
  ],
  title: 'Profile Menu',
}
