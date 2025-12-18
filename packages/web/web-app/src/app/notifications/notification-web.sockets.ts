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
  static #instance: NotificationWebSocketsType
  socket: Socket<
    NotificationSocketServerToClientEvents,
    NotificationSocketClientToServerEvents
  > | null = null

  constructor() {
    void this.setupSocket()
  }

  async setupSocket() {
    this.socket = await SocketWebConnection.createSocket<
      NotificationSocketClientToServerEvents,
      NotificationSocketServerToClientEvents
    >(NOTIFICATION_WEB_SOCKET_NS)
    NotificationWebSockets.#instance = this

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

  public static get instance() {
    return NotificationWebSockets.#instance
  }
}

export type NotificationWebSocketsType = typeof NotificationWebSockets.prototype
