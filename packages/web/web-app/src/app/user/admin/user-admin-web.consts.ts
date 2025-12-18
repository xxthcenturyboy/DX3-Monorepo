import { IconNames } from '@dx3/web-libs/ui/system/icons'

import type { AppMenuType } from '../../ui/menus/app-menu.types'

export const USER_ADMIN_ENTITY_NAME = 'userAdmin'

export const USER_ADMIN_ROUTES = {
  DETAIL: `/admin/user/detail`,
  LIST: `/admin/user/list`,
  MAIN: `/admin/user`,
}

export const USER_ADMIN_MENU: AppMenuType = {
  collapsible: false,
  description: '',
  id: 'menu-user',
  items: [
    {
      icon: IconNames.PEOPLE,
      id: 'menu-user-main',
      restriction: 'ADMIN',
      routeKey: USER_ADMIN_ROUTES.MAIN,
      title: 'User Admin',
      type: 'ROUTE',
    },
  ],
  title: 'User Admin',
}
