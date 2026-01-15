import type { Namespace } from 'socket.io'

import {
  FEATURE_FLAG_SOCKET_NS,
  type FeatureFlagSocketClientToServerEvents,
  type FeatureFlagSocketData,
  type FeatureFlagSocketInterServerEvents,
  type FeatureFlagSocketServerToClientEvents,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../logger'
import {
  ensureLoggedInSocket,
  getUserIdFromHandshake,
  SocketApiConnection,
  type SocketApiConnectionType,
} from '../socket-io-api'

type FeatureFlagNamespaceType = Namespace<
  FeatureFlagSocketClientToServerEvents,
  FeatureFlagSocketServerToClientEvents,
  FeatureFlagSocketInterServerEvents,
  FeatureFlagSocketData
>

const FEATURE_FLAG_UPDATES_ROOM = 'feature-flag-updates'

export class FeatureFlagSocketApiService {
  static #instance: FeatureFlagSocketApiServiceType
  socket: SocketApiConnectionType
  private logger: ApiLoggingClassType
  public ns: FeatureFlagNamespaceType

  constructor() {
    this.logger = ApiLoggingClass.instance
    this.socket = SocketApiConnection.instance
    // @ts-expect-error - type is fine
    this.ns = this.socket.io.of(FEATURE_FLAG_SOCKET_NS)
    FeatureFlagSocketApiService.#instance = this
  }

  public static get instance() {
    return FeatureFlagSocketApiService.#instance
  }

  public configureNamespace() {
    // Set up auth middleware
    this.ns.use((socket, next) => {
      const isLoggedIn = ensureLoggedInSocket(socket.handshake)
      if (isLoggedIn) {
        next()
      } else {
        next(new Error('Not logged in'))
      }
    })

    this.ns.on('connection', (socket) => {
      const userId = getUserIdFromHandshake(socket.handshake)
      this.logger.logInfo(`Feature flag socket connected: ${socket.id}, user: ${userId}`)

      // Store userId in socket data for later use
      if (userId) {
        socket.data.userId = userId
      }

      socket.on('subscribeToFeatureFlags', () => {
        socket.join(FEATURE_FLAG_UPDATES_ROOM)
        this.logger.logInfo(`Socket ${socket.id} subscribed to feature flag updates`)
      })

      socket.on('unsubscribeFromFeatureFlags', () => {
        socket.leave(FEATURE_FLAG_UPDATES_ROOM)
        this.logger.logInfo(`Socket ${socket.id} unsubscribed from feature flag updates`)
      })

      socket.on('disconnect', () => {
        this.logger.logInfo(`Feature flag socket disconnected: ${socket.id}`)
      })
    })
  }

  /**
   * Broadcast that flags have been updated to all subscribed clients
   * Clients will re-fetch their user-specific evaluations
   */
  public broadcastFlagsUpdated(): void {
    try {
      // Send empty array - clients will re-fetch from API for user-specific evaluations
      this.ns.to(FEATURE_FLAG_UPDATES_ROOM).emit('featureFlagsUpdated', [])
      this.logger.logInfo('Broadcasted feature flags update notification')
    } catch (err) {
      this.logger.logError(`Error broadcasting feature flags update: ${(err as Error).message}`)
    }
  }
}

export type FeatureFlagSocketApiServiceType = typeof FeatureFlagSocketApiService.prototype
