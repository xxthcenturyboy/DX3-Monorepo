import type { Socket } from 'socket.io-client'

import {
  FEATURE_FLAG_SOCKET_NS,
  type FeatureFlagSocketClientToServerEvents,
  type FeatureFlagSocketServerToClientEvents,
} from '@dx3/models-shared'

import { SocketWebConnection } from '../data/socket-io/socket-web.connection'
import { store } from '../store/store-web.redux'
import { featureFlagsApi } from './feature-flag-web.api'
import { featureFlagsActions } from './feature-flag-web.reducer'

export class FeatureFlagWebSockets {
  static #instance: FeatureFlagWebSocketsType
  socket: Socket<
    FeatureFlagSocketServerToClientEvents,
    FeatureFlagSocketClientToServerEvents
  > | null = null

  constructor() {
    void this.setupSocket()
  }

  async setupSocket() {
    this.socket = await SocketWebConnection.createSocket<
      FeatureFlagSocketClientToServerEvents,
      FeatureFlagSocketServerToClientEvents
    >(FEATURE_FLAG_SOCKET_NS)
    FeatureFlagWebSockets.#instance = this

    // Subscribe to feature flag updates
    this.socket.emit('subscribeToFeatureFlags')

    // Listen for flag updates and re-fetch
    // Server broadcasts empty array as notification; client re-fetches for user-specific evaluations
    this.socket.on('featureFlagsUpdated', async () => {
      try {
        const result = await store
          .dispatch(
            featureFlagsApi.endpoints.getFeatureFlags.initiate(undefined, {
              forceRefetch: true,
            }),
          )
          .unwrap()

        store.dispatch(featureFlagsActions.featureFlagsFetched(result.flags))
      } catch (error) {
        console.error('Failed to refresh feature flags:', error)
      }
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit('unsubscribeFromFeatureFlags')
      this.socket.disconnect()
    }
  }

  public static get instance() {
    return FeatureFlagWebSockets.#instance
  }
}

export type FeatureFlagWebSocketsType = typeof FeatureFlagWebSockets.prototype
