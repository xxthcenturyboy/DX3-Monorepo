import type { Namespace } from 'socket.io'

import {
  ADMIN_LOGS_SOCKET_NS,
  type AdminLogsSocketClientToServerEvents,
  type AdminLogsSocketData,
  type AdminLogsSocketInterServerEvents,
  type AdminLogsSocketServerToClientEvents,
  type AuthFailureAlertPayload,
  hasRoleOrHigher,
  type LogEntryType,
  type RateLimitAlertPayload,
  type SecurityAlertPayload,
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

type AdminLogsNamespaceType = Namespace<
  AdminLogsSocketClientToServerEvents,
  AdminLogsSocketServerToClientEvents,
  AdminLogsSocketInterServerEvents,
  AdminLogsSocketData
>

/**
 * Room names for different log streams
 */
const LOG_ROOMS = {
  ALL_LOGS: 'all-logs',
  ERROR_LOGS: 'error-logs',
} as const

/**
 * AdminLogsSocketService
 *
 * Handles WebSocket connections for real-time log streaming.
 * Only users with LOGGING_ADMIN role or higher can connect.
 */
export class AdminLogsSocketService {
  static #instance: AdminLogsSocketServiceType | null = null
  socket: SocketApiConnectionType
  private logger: ApiLoggingClassType
  public ns: AdminLogsNamespaceType | null = null

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.socket = SocketApiConnection.instance

    if (!this.socket?.io) {
      this.logger.logError('AdminLogsSocketService: Socket.IO instance not available')
      return
    }

    // @ts-expect-error - type is fine
    this.ns = this.socket.io.of(ADMIN_LOGS_SOCKET_NS)
    AdminLogsSocketService.#instance = this
  }

  public static get instance(): AdminLogsSocketServiceType | null {
    return AdminLogsSocketService.#instance
  }

  /**
   * Configure namespace with authentication and role-based access.
   * Only LOGGING_ADMIN and SUPER_ADMIN users can connect.
   */
  public configureNamespace(): void {
    if (!this.ns) {
      this.logger.logError('AdminLogsSocketService: Namespace not initialized')
      return
    }

    // Authentication middleware
    this.ns.use(async (socket, next) => {
      const isLoggedIn = ensureLoggedInSocket(socket.handshake)
      if (!isLoggedIn) {
        next(new Error('Not logged in'))
        return
      }

      // Check for LOGGING_ADMIN role or higher
      const roles = await getUserRolesFromHandshake(socket.handshake)
      const hasAccess = hasRoleOrHigher(roles, USER_ROLE.LOGGING_ADMIN)

      if (!hasAccess) {
        next(new Error('Logging admin access required'))
        return
      }

      next()
    })

    // Connection handler
    this.ns.on('connection', async (socket) => {
      const userId = getUserIdFromHandshake(socket.handshake)
      const roles = await getUserRolesFromHandshake(socket.handshake)

      if (userId) {
        // Auto-join the all-logs room on connection
        socket.join(LOG_ROOMS.ALL_LOGS)
        this.logger.logInfo(
          `AdminLogs socket: User ${userId} connected (roles: ${roles.join(', ')})`,
        )
      }

      // Handle subscription to error-only logs
      socket.on('subscribe-errors', () => {
        socket.join(LOG_ROOMS.ERROR_LOGS)
        this.logger.logInfo(`AdminLogs socket: User ${userId} subscribed to error logs`)
      })

      // Handle unsubscription from error-only logs
      socket.on('unsubscribe-errors', () => {
        socket.leave(LOG_ROOMS.ERROR_LOGS)
        this.logger.logInfo(`AdminLogs socket: User ${userId} unsubscribed from error logs`)
      })

      socket.on('disconnect', () => {
        this.logger.logInfo(`AdminLogs socket: User ${userId} disconnected`)
      })
    })
  }

  /**
   * Broadcast a new log entry to all connected admins.
   * Also broadcasts to error-logs room if it's an error.
   */
  public broadcastNewLog(log: LogEntryType): void {
    try {
      if (!this.ns) {
        return // Silently fail - logging is optional
      }

      // Broadcast to all-logs room
      this.ns.to(LOG_ROOMS.ALL_LOGS).emit('new-log', log)

      // If it's an error, also broadcast to error-logs room
      if (!log.success) {
        this.ns.to(LOG_ROOMS.ERROR_LOGS).emit('error-log', log)
      }
    } catch (err) {
      this.logger.logError(
        `AdminLogs socket: Error broadcasting log: ${(err as Error).message}`,
      )
    }
  }

  /**
   * Broadcast an error log entry specifically.
   */
  public broadcastErrorLog(log: LogEntryType): void {
    try {
      if (!this.ns) {
        return // Silently fail - logging is optional
      }

      this.ns.to(LOG_ROOMS.ERROR_LOGS).emit('error-log', log)
    } catch (err) {
      this.logger.logError(
        `AdminLogs socket: Error broadcasting error log: ${(err as Error).message}`,
      )
    }
  }

  /**
   * Get count of connected admins
   */
  public async getConnectedCount(): Promise<number> {
    if (!this.ns) {
      return 0
    }

    const sockets = await this.ns.in(LOG_ROOMS.ALL_LOGS).fetchSockets()
    return sockets.length
  }

  // ==========================================================================
  // Alert Emission Methods (Phase 8)
  // ==========================================================================

  /**
   * Emit an auth failure warning alert (3-9 failures in 5 min window)
   */
  public emitAuthFailureWarning(payload: AuthFailureAlertPayload): void {
    try {
      if (!this.ns) {
        return
      }
      this.ns.to(LOG_ROOMS.ALL_LOGS).emit('auth_failure_warning', payload)
      this.logger.logInfo(
        `AdminLogs alert: Auth failure WARNING sent (IP: ${payload.ipAddress}, count: ${payload.count})`,
      )
    } catch (err) {
      this.logger.logError(
        `AdminLogs socket: Error emitting auth_failure_warning: ${(err as Error).message}`,
      )
    }
  }

  /**
   * Emit an auth failure critical alert (10+ failures in 5 min window)
   */
  public emitAuthFailureCritical(payload: AuthFailureAlertPayload): void {
    try {
      if (!this.ns) {
        return
      }
      this.ns.to(LOG_ROOMS.ALL_LOGS).emit('auth_failure_critical', payload)
      this.logger.logWarn(
        `AdminLogs alert: Auth failure CRITICAL sent (IP: ${payload.ipAddress}, count: ${payload.count})`,
      )
    } catch (err) {
      this.logger.logError(
        `AdminLogs socket: Error emitting auth_failure_critical: ${(err as Error).message}`,
      )
    }
  }

  /**
   * Emit a rate limit alert
   */
  public emitRateLimitAlert(payload: RateLimitAlertPayload): void {
    try {
      if (!this.ns) {
        return
      }
      this.ns.to(LOG_ROOMS.ALL_LOGS).emit('rate_limit_alert', payload)
      this.logger.logInfo(
        `AdminLogs alert: Rate limit alert sent (IP: ${payload.ipAddress}, endpoint: ${payload.endpoint})`,
      )
    } catch (err) {
      this.logger.logError(
        `AdminLogs socket: Error emitting rate_limit_alert: ${(err as Error).message}`,
      )
    }
  }

  /**
   * Emit a generic security alert
   */
  public emitSecurityAlert(payload: SecurityAlertPayload): void {
    try {
      if (!this.ns) {
        return
      }
      this.ns.to(LOG_ROOMS.ALL_LOGS).emit('security_alert', payload)
      this.logger.logWarn(
        `AdminLogs alert: Security alert sent (type: ${payload.alertType})`,
      )
    } catch (err) {
      this.logger.logError(
        `AdminLogs socket: Error emitting security_alert: ${(err as Error).message}`,
      )
    }
  }
}

export type AdminLogsSocketServiceType = typeof AdminLogsSocketService.prototype
