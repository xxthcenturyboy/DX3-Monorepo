import type { NotificationType } from '@dx3/models-shared'

export type NotificationStateType = {
  system: NotificationType[]
  user: NotificationType[]
}
