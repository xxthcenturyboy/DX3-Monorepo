import type { UserProfileStateType } from '@dx3/models-shared'
import { USER_ROLE } from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'

import { fetchFeatureFlags } from '../../feature-flags/feature-flag-web.api'
import { featureFlagsActions } from '../../feature-flags/feature-flag-web.reducer'
import { FeatureFlagWebSockets } from '../../feature-flags/feature-flag-web.sockets'
import { fetchNotifications } from '../../notifications/notification-web.api'
import { notificationActions } from '../../notifications/notification-web.reducer'
import { NotificationWebSockets } from '../../notifications/notification-web.sockets'
import { store } from '../../store/store-web.redux'
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

function connectToSockets() {
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
}

export function loginBootstrap(userProfile: UserProfileStateType, mobileBreak: boolean) {
  setUpMenus(userProfile, mobileBreak)
  void getNotifications(userProfile?.id)
  void getFeatureFlags()
  connectToSockets()
}
