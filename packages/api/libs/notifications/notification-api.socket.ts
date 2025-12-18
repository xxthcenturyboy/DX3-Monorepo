import type { Namespace } from 'socket.io'

import {
  NOTIFICATION_WEB_SOCKET_NS,
  type NotificationSocketClientToServerEvents,
  type NotificationSocketData,
  type NotificationSocketInterServerEvents,
  type NotificationSocketServerToClientEvents,
  type NotificationType,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import {
  ensureLoggedInSocket,
  getUserIdFromHandshake,
  SocketApiConnection,
  type SocketApiConnectionType,
} from '../socket-io-api'

type NotificationNamespaceType = Namespace<
  NotificationSocketClientToServerEvents,
  NotificationSocketServerToClientEvents,
  NotificationSocketInterServerEvents,
  NotificationSocketData
>

export class NotificationSocketApiService {
  static #instance: NotificationSocketApiServiceType
  socket: SocketApiConnectionType
  private logger: ApiLoggingClassType
  public ns: NotificationNamespaceType

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.socket = SocketApiConnection.instance
    // @ts-expect-error - type is fine
    this.ns = this.socket.io.of(NOTIFICATION_WEB_SOCKET_NS)
    NotificationSocketApiService.#instance = this
  }

  public static get instance() {
    return NotificationSocketApiService.#instance
  }

  public configureNamespace() {
    // set up auth middleware
    this.ns.use((socket, next) => {
      const isLoggedIn = ensureLoggedInSocket(socket.handshake)
      if (isLoggedIn) {
        next()
      } else {
        next(new Error(`Not logged in`))
      }
    })

    this.ns.on('connection', (socket) => {
      const userId = getUserIdFromHandshake(socket.handshake)
      if (userId) {
        socket.join(userId)
        this.logger.logInfo(`notify socket user: ${userId}`)
      }
    })
  }

  public sendNotificationToUser(notification: NotificationType) {
    try {
      if (notification.userId) {
        this.ns.to(notification.userId).emit('sendNotification', notification)
      }
    } catch (err) {
      this.logger.logError(`Error sending notification socket: ${err.message}`)
    }
  }

  public sendNotificationToAll(notification: NotificationType) {
    try {
      this.ns.emit('sendSystemNotification', notification)
    } catch (err) {
      this.logger.logError(`Error sending notification socket: ${err.message}`)
    }
  }

  public sendAppUpdateNotification(message: string) {
    try {
      this.ns.emit('sendAppUpdateNotification', message)
    } catch (err) {
      this.logger.logError(`Error sending app update notification socket: ${err.message}`)
    }
  }
}

export type NotificationSocketApiServiceType = typeof NotificationSocketApiService.prototype
