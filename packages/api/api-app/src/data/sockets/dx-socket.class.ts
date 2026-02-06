import type { Server } from 'node:http'

import { FeatureFlagSocketApiService } from '@dx3/api-libs/feature-flags/feature-flag-api.socket'
import { ApiLoggingClass } from '@dx3/api-libs/logger'
import { NotificationSocketApiService } from '@dx3/api-libs/notifications/notification-api.socket'
import { SocketApiConnection } from '@dx3/api-libs/socket-io-api'
import { SupportSocketApiService } from '@dx3/api-libs/support'
import { AdminLogsSocketService } from '@dx3/api-libs/timescale'

import { webUrl } from '../../config/config-api.service'

export class DxSocketClass {
  public static startSockets(httpServer: Server) {
    const logger = ApiLoggingClass.instance
    if (!httpServer) {
      logger.logError('No Server provided to socket connector. Sockets not initiated.')
      return false
    }

    try {
      const socket = new SocketApiConnection({
        httpServer,
        webUrl: webUrl(),
      })
      if (!SocketApiConnection.instance || !socket.io) {
        logger.logError('Sockets did not instantiate correctly. Sockets unavailable')
        return false
      }

      new AdminLogsSocketService()
      new FeatureFlagSocketApiService()
      new NotificationSocketApiService()
      new SupportSocketApiService()

      if (AdminLogsSocketService.instance) {
        AdminLogsSocketService.instance.configureNamespace()
      } else {
        logger.logInfo('Admin logs sockets not instantiated (TimescaleDB may not be configured).')
      }

      if (FeatureFlagSocketApiService.instance) {
        FeatureFlagSocketApiService.instance.configureNamespace()
      } else {
        logger.logError('Feature flag sockets not instantiated.')
      }

      if (NotificationSocketApiService.instance) {
        NotificationSocketApiService.instance.configureNamespace()
      } else {
        logger.logError('Notification sockets not instantiated.')
      }

      if (SupportSocketApiService.instance) {
        SupportSocketApiService.instance.configureNamespace()
      } else {
        logger.logError('Support sockets not instantiated.')
      }

      logger.logInfo('Sockets started successfully')
      return true
    } catch (err) {
      logger.logError((err as Error).message, err)
      return false
    }
  }
}
