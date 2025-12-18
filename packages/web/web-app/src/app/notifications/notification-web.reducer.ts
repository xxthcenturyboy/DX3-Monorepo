import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { APP_PREFIX, type NotificationType } from '@dx3/models-shared'

import { NOTIFICATION_WEB_ENTITY_NAME } from './notification-web.consts'
import type { NotificationStateType } from './notification-web.types'

export const notificationInitialState: NotificationStateType = {
  system: [],
  user: [],
}

const notificationsSlice = createSlice({
  initialState: notificationInitialState,
  name: `${APP_PREFIX}:${NOTIFICATION_WEB_ENTITY_NAME}`,
  reducers: {
    addSystemNotification(state, action: PayloadAction<NotificationType>) {
      const nextNotifications = state.system
      nextNotifications.push(action.payload)
      state.system = nextNotifications
    },
    addUserNotification(state, action: PayloadAction<NotificationType>) {
      const nextNotifications = state.user
      nextNotifications.push(action.payload)
      state.user = nextNotifications
    },
    removeNotification(state, action: PayloadAction<string>) {
      const nextSystemNotifications = state.system.filter(
        (notification) => notification.id !== action.payload,
      )
      const nextUserNotifications = state.user.filter(
        (notification) => notification.id !== action.payload,
      )
      state.system = nextSystemNotifications
      state.user = nextUserNotifications
    },
    setSystemNotifications(state, action: PayloadAction<NotificationType[]>) {
      state.system = action.payload
    },
    setUserNotifications(state, action: PayloadAction<NotificationType[]>) {
      state.user = action.payload
    },
  },
})

export const notificationActions = notificationsSlice.actions

export const notificationReducer = notificationsSlice.reducer
