import { hasRoleOrHigher, USER_ROLE } from '@dx3/models-shared'

import { blogEditorMenu } from '../../blog/admin/blog-editor.menu'
import { dashboardMenu } from '../../dashboard/dashboard.menu'
import { supportMenu } from '../../support/support-web.menu'
import { userProfileMenu } from '../../user/profile/user-profile.menu'
import { adminMenu } from './admin.menu'
import type { AppMenuItemType, AppMenuType } from './app-menu.types'
import { publicMenuAuthenticated } from './public.menu'

/**
 * MenuConfigService
 *
 * Manages menu visibility based on user roles.
 * Supports multi-role filtering where users can have multiple roles.
 *
 * Role Hierarchy:
 * USER (1) → EDITOR (2) → ADMIN (3) → METRICS_ADMIN (4) → LOGGING_ADMIN (5) → SUPER_ADMIN (6)
 *
 * SUPER_ADMIN sees all menu items regardless of restriction.
 * Other users see items if they have the required role or higher.
 */
export class MenuConfigService {
  // Order to appear in sidebar menu (for authenticated users)
  // FAQ is moved to Support page, so we use publicMenuAuthenticated which excludes FAQ
  // Support appears as the last item before admin menu
  CARDINAL_MENU_SET: AppMenuType[] = [
    dashboardMenu(),
    publicMenuAuthenticated(),
    blogEditorMenu(),
    userProfileMenu(),
    supportMenu(),
    adminMenu(),
  ]

  /**
   * Filter menu items based on user roles and beta preference.
   *
   * @param menu - The menu to filter
   * @param userRoles - Array of roles the user has
   * @param isSuperAdmin - Whether the user is a super admin
   * @param includeBeta - Whether to include beta items
   * @returns Filtered menu or null if no items visible
   */
  private filterMenuByRoles(
    menu: AppMenuType,
    userRoles: string[],
    isSuperAdmin: boolean,
    includeBeta: boolean,
  ): AppMenuType | null {
    const items: AppMenuItemType[] = []

    for (const item of menu.items) {
      // Skip beta items if not enabled
      if (!includeBeta && item.beta) {
        continue
      }

      // No restriction = everyone sees it
      if (!item.restriction) {
        items.push(item)
        continue
      }

      // SUPER_ADMIN sees all restricted items
      if (isSuperAdmin) {
        items.push(item)
        continue
      }

      // Check if user has the required role or higher in hierarchy
      if (hasRoleOrHigher(userRoles, item.restriction)) {
        items.push(item)
      }
    }

    return items.length > 0 ? { ...menu, items } : null
  }

  /**
   * Get menus filtered by user roles.
   *
   * @param userRoles - Array of roles the user has
   * @param includeBeta - Whether to include beta items (default: false)
   * @returns Array of menus visible to the user
   *
   * @example
   * // User with single role
   * menuService.getMenus(['USER'], false)
   *
   * @example
   * // Admin with beta access
   * menuService.getMenus(['ADMIN'], true)
   *
   * @example
   * // Super admin sees everything
   * menuService.getMenus(['SUPER_ADMIN'], true)
   */
  public getMenus(userRoles: string[], includeBeta?: boolean): AppMenuType[] {
    const menus: AppMenuType[] = []

    // Check if user has SUPER_ADMIN role
    const isSuperAdmin = userRoles.includes(USER_ROLE.SUPER_ADMIN)

    for (const menu of this.CARDINAL_MENU_SET) {
      const menuItem = this.filterMenuByRoles(menu, userRoles, isSuperAdmin, includeBeta || false)
      if (menuItem) {
        menus.push(menuItem)
      }
    }

    return menus
  }
}
