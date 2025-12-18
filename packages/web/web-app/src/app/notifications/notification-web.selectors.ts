import { createSelector } from 'reselect'

import type { NotificationType } from '@dx3/models-shared'

import type { RootState } from '../store/store-web.redux'

const getSystemNotifications = (state: RootState): NotificationType[] => state.notification.system
const getUserNotifications = (state: RootState): NotificationType[] => state.notification.user

export const selectSystemNotificationCount = createSelector(
  [getSystemNotifications],
  (notifications) => notifications.length,
)

export const selectUserNotificationCount = createSelector(
  [getUserNotifications],
  (notifications) => notifications.length,
)

export const selectNotificationCount = createSelector(
  [selectSystemNotificationCount, selectUserNotificationCount],
  (systemCount, userCount) => systemCount + userCount,
)
