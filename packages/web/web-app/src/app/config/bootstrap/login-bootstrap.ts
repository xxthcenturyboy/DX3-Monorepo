import type { UserProfileStateType } from '@dx3/models-shared'
import { USER_ROLE } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'

import { fetchFeatureFlags } from '../../feature-flags/feature-flag-web.api'
import { featureFlagsActions } from '../../feature-flags/feature-flag-web.reducer'
import { fetchNotifications } from '../../notifications/notification-web.api'
import { notificationActions } from '../../notifications/notification-web.reducer'
import { store } from '../../store/store-web.redux'
import { supportActions } from '../../support/store/support-web.reducer'
import { fetchSupportUnviewedCount } from '../../support/support-web.api'
import type { AppMenuType } from '../../ui/menus/app-menu.types'
import { MenuConfigService } from '../../ui/menus/menu-config.service'
import { uiActions } from '../../ui/store/ui-web.reducer'

function setUpMenus(userProfile: UserProfileStateType, mobileBreak: boolean) {
  const menuService = new MenuConfigService()
  let menus: AppMenuType[] = []
  if (userProfile.role.includes(USER_ROLE.SUPER_ADMIN)) {
    menus = menuService.getMenus(USER_ROLE.SUPER_ADMIN, userProfile.b)
  } else if (userProfile.role.includes(USER_ROLE.ADMIN)) {
    menus = menuService.getMenus(USER_ROLE.ADMIN, userProfile.b)
  } else {
    menus = menuService.getMenus(undefined, userProfile.b)
  }

  store.dispatch(uiActions.menusSet({ menus }))
  if (!mobileBreak) {
    store.dispatch(uiActions.toggleMenuSet(true))
  }
}

async function getNotifications(userId: string) {
  try {
    const fetchResult = (await store.dispatch(fetchNotifications.initiate({ userId }))).data
    if (fetchResult && Array.isArray(fetchResult.system)) {
      store.dispatch(notificationActions.setSystemNotifications(fetchResult.system))
    }
    if (fetchResult && Array.isArray(fetchResult.user)) {
      store.dispatch(notificationActions.setUserNotifications(fetchResult.user))
    }
  } catch (err) {
    logger.error(`Error fetching notifications: ${(err as Error).message}`)
  }
}

async function getFeatureFlags() {
  try {
    store.dispatch(featureFlagsActions.featureFlagsLoading())
    const fetchResult = (await store.dispatch(fetchFeatureFlags.initiate())).data
    if (fetchResult?.flags) {
      store.dispatch(featureFlagsActions.featureFlagsFetched(fetchResult.flags))
    }
  } catch (err) {
    logger.error(`Error fetching feature flags: ${(err as Error).message}`)
  }
}

async function connectToSockets(isAdmin: boolean) {
  // Only connect sockets in browser environment (not during SSR)
  if (typeof window === 'undefined') {
    return
  }

  try {
    // Dynamically import Socket.IO classes to prevent SSR bundle errors
    const [{ NotificationWebSockets }, { FeatureFlagWebSockets }] = await Promise.all([
      import('../../notifications/notification-web.sockets'),
      import('../../feature-flags/feature-flag-web.sockets'),
    ])

    // Connect to notification sockets
    if (!NotificationWebSockets.instance) {
      new NotificationWebSockets()
    } else if (
      NotificationWebSockets.instance.socket &&
      !NotificationWebSockets.instance.socket.connected
    ) {
      NotificationWebSockets.instance.socket.connect()
    }

    // Connect to feature flag sockets for real-time updates
    if (!FeatureFlagWebSockets.instance) {
      new FeatureFlagWebSockets()
    } else if (
      FeatureFlagWebSockets.instance.socket &&
      !FeatureFlagWebSockets.instance.socket.connected
    ) {
      FeatureFlagWebSockets.instance.socket.connect()
    }

    // Connect to support sockets for admin notifications
    if (isAdmin) {
      const { SupportWebSockets } = await import('../../support/support-web.sockets')
      if (!SupportWebSockets.instance) {
        SupportWebSockets.connect()
      } else if (
        SupportWebSockets.instance.socket &&
        !SupportWebSockets.instance.socket.connected
      ) {
        SupportWebSockets.instance.socket.connect()
      }
    }
  } catch (err) {
    logger.error(`Error connecting to sockets: ${(err as Error).message}`)
  }
}

async function getSupportUnviewedCount() {
  try {
    const fetchResult = (await store.dispatch(fetchSupportUnviewedCount.initiate())).data
    if (fetchResult) {
      store.dispatch(supportActions.setUnviewedCount(fetchResult.count))
    }
  } catch (err) {
    logger.error(`Error fetching support unviewed count: ${(err as Error).message}`)
  }
}

export function loginBootstrap(userProfile: UserProfileStateType, mobileBreak: boolean) {
  const isAdmin = userProfile.a || userProfile.sa

  setUpMenus(userProfile, mobileBreak)
  void getNotifications(userProfile?.id)
  void getFeatureFlags()
  void connectToSockets(isAdmin)

  // Fetch unviewed support request count for admins
  if (isAdmin) {
    void getSupportUnviewedCount()
  }
}
