import { toast } from 'react-toastify'
import type { Socket } from 'socket.io-client'

import {
  SUPPORT_WEB_SOCKET_NS,
  type SupportSocketClientToServerEvents,
  type SupportSocketServerToClientEvents,
} from '@dx3/models-shared'

import { SocketWebConnection } from '../data/socket-io/socket-web.connection'
import { DEFAULT_STRINGS } from '../i18n'
import { store } from '../store/store-web.redux'
import { supportActions } from './store/support-web.reducer'

/**
 * Support WebSocket client for admin notifications
 * Listens for new support requests and updates
 */
export class SupportWebSockets {
  static #instance: SupportWebSocketsType | null = null
  socket: Socket<SupportSocketServerToClientEvents, SupportSocketClientToServerEvents> | null = null

  constructor() {
    void this.setupSocket()
  }

  async setupSocket() {
    this.socket = await SocketWebConnection.createSocket<
      SupportSocketClientToServerEvents,
      SupportSocketServerToClientEvents
    >(SUPPORT_WEB_SOCKET_NS)
    SupportWebSockets.#instance = this

    // Listen for new support requests
    this.socket.on('newSupportRequest', (request) => {
      const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

      // Add to store for badge count
      store.dispatch(supportActions.addNewRequest(request))

      // Show toast notification
      const toastMessage = strings.SUPPORT_NEW_REQUEST_TOAST.replace(
        '{category}',
        request.category,
      ).replace(
        '{subject}',
        request.subject.length > 40 ? `${request.subject.substring(0, 40)}...` : request.subject,
      )

      toast.info(toastMessage, {
        autoClose: 5000,
        closeButton: true,
        closeOnClick: false,
        onClick: () => {
          // Mark as viewed when clicking the toast
          store.dispatch(supportActions.markRequestViewed(request.id))
        },
        position: 'top-right',
        theme: 'colored',
      })
    })

    // Listen for support request updates
    this.socket.on('supportRequestUpdated', (_request) => {
      // Could be used for real-time updates in the future
    })

    // Handle reconnection - fetch missed notifications
    this.socket.on('connect', () => {
      // Silently reconnect - could fetch missed count here if needed
    })

    // Join admin room on connection
    this.socket.emit('joinAdminRoom')
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    SupportWebSockets.#instance = null
  }

  public static get instance() {
    return SupportWebSockets.#instance
  }

  public static connect() {
    if (!SupportWebSockets.#instance) {
      new SupportWebSockets()
    }
    return SupportWebSockets.#instance
  }
}

export type SupportWebSocketsType = typeof SupportWebSockets.prototype
