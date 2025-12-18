export type NotificationCreationParamTypes = {
  level: string
  message: string
  route?: string
  suppressPush?: boolean
  title?: string
  userId: string
}

export type NotificationType = {
  createdAt: Date
  deletedAt?: Date
  dismissedAt?: Date
  id: string
  lastReadDate?: Date
  level: string
  message: string
  route?: string
  suppressPush?: boolean
  title: string
  userId: string
  viewed: boolean
  viewedDate?: Date
}

export type NotificationSocketServerToClientEvents = {
  sendAppUpdateNotification: (message: string) => void
  sendNotification: (notification: NotificationType) => void
  sendSystemNotification: (notification: NotificationType) => void
  sendBasic: (message: string) => void
}

export type NotificationSocketClientToServerEvents = {
  hello: (message: string) => void
}

export type NotificationSocketInterServerEvents = {
  ping: () => void
}

export type NotificationSocketData = {
  notification: NotificationType
}
