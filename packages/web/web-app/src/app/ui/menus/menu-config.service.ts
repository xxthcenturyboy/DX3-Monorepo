import { USER_ROLE } from '@dx3/models-shared'

import { dashboardMenu } from '../../dashboard/dashboard.menu'
import { supportMenu } from '../../support/support-web.menu'
import { userProfileMenu } from '../../user/profile/user-profile.menu'
import { adminMenu } from './admin.menu'
import type { AppMenuItemType, AppMenuType } from './app-menu.types'
import { publicMenuAuthenticated } from './public.menu'

export class MenuConfigService {
  // Order to appear in sidebar menu (for authenticated users)
  // FAQ is moved to Support page, so we use publicMenuAuthenticated which excludes FAQ
  // Support appears as the last item before admin menu
  CARDINAL_MENU_SET: AppMenuType[] = [
    dashboardMenu(),
    publicMenuAuthenticated(),
    userProfileMenu(),
    supportMenu(),
    adminMenu(),
  ]

  private restrictSuperAdmin(menu: AppMenuType, includeBeta: boolean) {
    const items: AppMenuItemType[] = []

    for (const item of menu.items) {
      if (includeBeta) {
        if (!item.restriction) {
          items.push(item)
          continue
        }

        if (
          item.restriction &&
          (item.restriction === USER_ROLE.ADMIN || item.restriction === USER_ROLE.SUPER_ADMIN)
        ) {
          items.push(item)
          continue
        }
      }

      if (!includeBeta) {
        if (!item.restriction && !item.beta) {
          items.push(item)
          continue
        }

        if (
          item.restriction &&
          (item.restriction === USER_ROLE.ADMIN || item.restriction === USER_ROLE.SUPER_ADMIN) &&
          !item.beta
        ) {
          items.push(item)
        }
      }
    }

    if (items.length) {
      return {
        ...menu,
        items: items,
      }
    }

    return null
  }

  private restrictAdmin(menu: AppMenuType, includeBeta: boolean) {
    const items: AppMenuItemType[] = []

    for (const item of menu.items) {
      if (includeBeta) {
        if (!item.restriction) {
          items.push(item)
          continue
        }

        if (item.restriction && item.restriction === USER_ROLE.ADMIN) {
          items.push(item)
          continue
        }
      }

      if (!includeBeta) {
        if (!item.restriction && !item.beta) {
          items.push(item)
          continue
        }

        if (item.restriction && item.restriction === USER_ROLE.ADMIN && !item.beta) {
          items.push(item)
        }
      }
    }

    if (items.length) {
      return {
        ...menu,
        items: items,
      }
    }

    return null
  }

  private restrictStandard(menu: AppMenuType, includeBeta: boolean) {
    const items: AppMenuItemType[] = []

    for (const item of menu.items) {
      if (includeBeta) {
        if (!item.restriction) {
          items.push(item)
          continue
        }

        if (
          item.restriction &&
          item.restriction !== USER_ROLE.ADMIN &&
          item.restriction !== USER_ROLE.SUPER_ADMIN
        ) {
          items.push(item)
          continue
        }
      }

      if (!includeBeta) {
        if (!item.restriction && !item.beta) {
          items.push(item)
          continue
        }

        if (
          item.restriction &&
          item.restriction !== USER_ROLE.ADMIN &&
          item.restriction !== USER_ROLE.SUPER_ADMIN &&
          !item.beta
        ) {
          items.push(item)
        }
      }
    }

    if (items.length) {
      return {
        ...menu,
        items: items,
      }
    }

    return null
  }

  public getMenus(restriction?: string, includeBeta?: boolean) {
    const menus: AppMenuType[] = []

    if (restriction === USER_ROLE.SUPER_ADMIN) {
      for (const menu of this.CARDINAL_MENU_SET) {
        const menuItem = this.restrictSuperAdmin(menu, includeBeta || false)
        if (menuItem) {
          menus.push(menuItem)
        }
      }

      return menus
    }

    if (restriction === USER_ROLE.ADMIN) {
      for (const menu of this.CARDINAL_MENU_SET) {
        const menuItem = this.restrictAdmin(menu, includeBeta || false)
        if (menuItem) {
          menus.push(menuItem)
        }
      }

      return menus
    }

    for (const menu of this.CARDINAL_MENU_SET) {
      const menuItem = this.restrictStandard(menu, includeBeta || false)
      if (menuItem) {
        menus.push(menuItem)
      }
    }

    return menus
  }
}
