import { toast } from 'react-toastify'
import type { Socket } from 'socket.io-client'

import {
  NOTIFICATION_WEB_SOCKET_NS,
  type NotificationSocketClientToServerEvents,
  type NotificationSocketServerToClientEvents,
} from '@dx3/models-shared'

import { SocketWebConnection } from '../data/socket-io/socket-web.connection'
import { store } from '../store/store-web.redux'
import { notificationActions } from './notification-web.reducer'

export class NotificationWebSockets {
  static #instance: NotificationWebSocketsType | null = null
  static #initializing = false

  socket: Socket<
    NotificationSocketServerToClientEvents,
    NotificationSocketClientToServerEvents
  > | null = null

  constructor() {
    NotificationWebSockets.#initializing = true
    void this.setupSocket()
  }

  async setupSocket() {
    this.socket = await SocketWebConnection.createSocket<
      NotificationSocketClientToServerEvents,
      NotificationSocketServerToClientEvents
    >(NOTIFICATION_WEB_SOCKET_NS)
    NotificationWebSockets.#instance = this
    NotificationWebSockets.#initializing = false

    this.socket.on('sendAppUpdateNotification', (message) => {
      toast.info(message, {
        autoClose: false,
        closeButton: true,
        closeOnClick: false,
        // onClose: () => {
        //   window && window.location.reload();
        // },
        position: 'top-center',
        theme: 'colored',
      })
    })

    this.socket.on('sendNotification', (notification) => {
      store.dispatch(notificationActions.addUserNotification(notification))
    })

    this.socket.on('sendSystemNotification', (notification) => {
      store.dispatch(notificationActions.addSystemNotification(notification))
    })
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    NotificationWebSockets.#instance = null
    NotificationWebSockets.#initializing = false
  }

  public static get instance(): NotificationWebSocketsType | null {
    return NotificationWebSockets.#instance
  }

  public static get isInitializing(): boolean {
    return NotificationWebSockets.#initializing
  }
}

export type NotificationWebSocketsType = typeof NotificationWebSockets.prototype
