import type { Namespace } from 'socket.io'

import {
  SUPPORT_WEB_SOCKET_NS,
  type SupportRequestType,
  type SupportSocketClientToServerEvents,
  type SupportSocketData,
  type SupportSocketInterServerEvents,
  type SupportSocketServerToClientEvents,
  USER_ROLE,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import {
  ensureLoggedInSocket,
  getUserIdFromHandshake,
  getUserRolesFromHandshake,
  SocketApiConnection,
  type SocketApiConnectionType,
} from '../socket-io-api'

type SupportNamespaceType = Namespace<
  SupportSocketClientToServerEvents,
  SupportSocketServerToClientEvents,
  SupportSocketInterServerEvents,
  SupportSocketData
>

/**
 * Room name for admin users to receive support notifications
 */
const ADMIN_ROOM = 'support-admins'

/**
 * SupportSocketApiService
 *
 * Handles WebSocket connections for real-time support request notifications.
 * Only Admin and SuperAdmin users can connect to receive notifications.
 */
export class SupportSocketApiService {
  static #instance: SupportSocketApiServiceType
  socket: SocketApiConnectionType
  private logger: ApiLoggingClassType
  public ns: SupportNamespaceType

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.socket = SocketApiConnection.instance

    if (!this.socket?.io) {
      this.logger.logError('SupportSocketApiService: Socket.IO instance not available')
      return
    }

    // @ts-expect-error - type is fine
    this.ns = this.socket.io.of(SUPPORT_WEB_SOCKET_NS)
    SupportSocketApiService.#instance = this
  }

  public static get instance() {
    return SupportSocketApiService.#instance
  }

  /**
   * Configure namespace with authentication and role-based access
   * Only Admin and SuperAdmin users can connect
   */
  public configureNamespace() {
    if (!this.ns) {
      this.logger.logError('SupportSocketApiService: Namespace not initialized')
      return
    }

    // Authentication middleware
    this.ns.use(async (socket, next) => {
      const isLoggedIn = ensureLoggedInSocket(socket.handshake)
      if (!isLoggedIn) {
        next(new Error('Not logged in'))
        return
      }

      // Check for admin role
      const roles = await getUserRolesFromHandshake(socket.handshake)
      const isAdmin = roles.includes(USER_ROLE.ADMIN) || roles.includes(USER_ROLE.SUPER_ADMIN)

      if (!isAdmin) {
        next(new Error('Admin access required'))
        return
      }

      next()
    })

    // Connection handler
    this.ns.on('connection', async (socket) => {
      const userId = getUserIdFromHandshake(socket.handshake)
      const roles = await getUserRolesFromHandshake(socket.handshake)

      if (userId) {
        // Join the admin room for broadcast notifications
        socket.join(ADMIN_ROOM)
        this.logger.logInfo(
          `Support socket: Admin ${userId} connected (roles: ${roles.join(', ')})`,
        )
      }

      // Handle explicit room join
      socket.on('joinAdminRoom', () => {
        socket.join(ADMIN_ROOM)
        this.logger.logInfo(`Support socket: User ${userId} joined admin room`)
      })

      socket.on('disconnect', () => {
        this.logger.logInfo(`Support socket: Admin ${userId} disconnected`)
      })
    })
  }

  /**
   * Send notification of new support request to all connected admins
   */
  public sendNewRequestNotification(request: SupportRequestType) {
    try {
      if (!this.ns) {
        this.logger.logError(
          'SupportSocketApiService: Cannot send notification - namespace not initialized',
        )
        return
      }

      this.ns.to(ADMIN_ROOM).emit('newSupportRequest', request)
      this.logger.logInfo(`Support socket: Sent new request notification for ${request.id}`)
    } catch (err) {
      this.logger.logError(
        `Support socket: Error sending new request notification: ${(err as Error).message}`,
      )
    }
  }

  /**
   * Send notification of support request update to all connected admins
   */
  public sendRequestUpdatedNotification(request: SupportRequestType) {
    try {
      if (!this.ns) {
        this.logger.logError(
          'SupportSocketApiService: Cannot send notification - namespace not initialized',
        )
        return
      }

      this.ns.to(ADMIN_ROOM).emit('supportRequestUpdated', request)
      this.logger.logInfo(`Support socket: Sent update notification for ${request.id}`)
    } catch (err) {
      this.logger.logError(
        `Support socket: Error sending update notification: ${(err as Error).message}`,
      )
    }
  }
}

export type SupportSocketApiServiceType = typeof SupportSocketApiService.prototype
