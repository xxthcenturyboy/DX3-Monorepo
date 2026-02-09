import { toast } from 'react-toastify'
import type { Socket } from 'socket.io-client'

import {
  ADMIN_LOGS_SOCKET_NS,
  type AdminLogsSocketClientToServerEvents,
  type AdminLogsSocketServerToClientEvents,
} from '@dx3/models-shared'
import { logger } from '@dx3/web-libs/logger'

import { SocketWebConnection } from '../data/socket-io/socket-web.connection'
import { DEFAULT_STRINGS } from '../i18n'
import { store } from '../store/store-web.redux'

/**
 * AdminLogsWebSockets
 *
 * Client-side socket connection for receiving security alerts.
 * Only users with LOGGING_ADMIN role can successfully connect (server-side enforced).
 *
 * Alert Types (threshold-based):
 * - auth_failure_warning: 3-9 failures in 5min window
 * - auth_failure_critical: 10+ failures in 5min window
 * - rate_limit_alert: Rate limit triggered
 * - security_alert: Custom security events
 *
 * Note: The API also supports real-time log streaming (new-log, error-log events)
 * which can be enabled in future implementations if needed.
 */
export class AdminLogsWebSockets {
  static #instance: AdminLogsWebSocketsType | null = null

  socket: Socket<AdminLogsSocketServerToClientEvents, AdminLogsSocketClientToServerEvents> | null =
    null

  constructor() {
    void this.setupSocket()
  }

  async setupSocket(): Promise<void> {
    try {
      this.socket = await SocketWebConnection.createSocket<
        AdminLogsSocketClientToServerEvents,
        AdminLogsSocketServerToClientEvents
      >(ADMIN_LOGS_SOCKET_NS)

      if (!this.socket) {
        logger.warn('AdminLogsWebSockets: Could not create socket connection')
        return
      }

      AdminLogsWebSockets.#instance = this

      // Listen for threshold-based alert events
      this.socket.on('auth_failure_warning', (payload) => {
        const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS
        const message = strings.ADMIN_LOGS_ALERT_AUTH_FAILURE_WARNING.replace(
          '{count}',
          String(payload.count),
        ).replace('{ipAddress}', payload.ipAddress)

        toast.warning(message, {
          autoClose: 8000,
          closeButton: true,
          closeOnClick: true,
          position: 'top-right',
          theme: 'colored',
        })
      })

      this.socket.on('auth_failure_critical', (payload) => {
        const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS
        const message = strings.ADMIN_LOGS_ALERT_AUTH_FAILURE_CRITICAL.replace(
          '{count}',
          String(payload.count),
        ).replace('{ipAddress}', payload.ipAddress)

        toast.error(message, {
          autoClose: false, // Don't auto-close critical alerts
          closeButton: true,
          closeOnClick: false,
          position: 'top-right',
          theme: 'colored',
        })
      })

      this.socket.on('rate_limit_alert', (payload) => {
        const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS
        const message = strings.ADMIN_LOGS_ALERT_RATE_LIMIT.replace(
          '{ipAddress}',
          payload.ipAddress,
        ).replace('{endpoint}', payload.endpoint)

        toast.warning(message, {
          autoClose: 8000,
          closeButton: true,
          closeOnClick: true,
          position: 'top-right',
          theme: 'colored',
        })
      })

      this.socket.on('security_alert', (payload) => {
        const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS
        const message = strings.ADMIN_LOGS_ALERT_SECURITY.replace('{alertType}', payload.alertType)

        toast.error(message, {
          autoClose: false, // Don't auto-close security alerts
          closeButton: true,
          closeOnClick: false,
          position: 'top-right',
          theme: 'colored',
        })
      })

      this.socket.on('connect', () => {
        logger.log('AdminLogsWebSockets: Connected to admin-logs namespace')
      })

      this.socket.on('disconnect', (reason) => {
        logger.log(`AdminLogsWebSockets: Disconnected - ${reason}`)
      })

      this.socket.on('connect_error', (error) => {
        // Expected if user doesn't have LOGGING_ADMIN role
        logger.warn(`AdminLogsWebSockets: Connection error - ${error.message}`)
      })
    } catch (error) {
      logger.error('AdminLogsWebSockets: Failed to setup socket', error)
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Disconnect from the socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    AdminLogsWebSockets.#instance = null
  }

  public static get instance(): AdminLogsWebSocketsType | null {
    return AdminLogsWebSockets.#instance
  }

  /**
   * Connect to admin logs socket (creates instance if needed)
   */
  public static connect(): AdminLogsWebSocketsType | null {
    if (!AdminLogsWebSockets.#instance) {
      new AdminLogsWebSockets()
    }
    return AdminLogsWebSockets.#instance
  }

  /**
   * Disconnect and cleanup the singleton instance
   */
  public static cleanup(): void {
    if (AdminLogsWebSockets.#instance) {
      AdminLogsWebSockets.#instance.disconnect()
    }
  }
}

export type AdminLogsWebSocketsType = typeof AdminLogsWebSockets.prototype
