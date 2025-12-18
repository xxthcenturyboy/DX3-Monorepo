import { createAdapter } from '@socket.io/redis-adapter'
import { Server } from 'socket.io'

import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '@dx3/models-shared'

import { ApiLoggingClass, type ApiLoggingClassType } from '../../logger'
import { RedisService } from '../../redis'
import type { SocketApiConnectionConstructorType } from './socket-api.types'

export class SocketApiConnection {
  static #instance: SocketApiConnectionType
  public io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  private logger: ApiLoggingClassType

  constructor(params: SocketApiConnectionConstructorType) {
    this.logger = ApiLoggingClass.instance
    if (!params.httpServer && !params.webUrl) {
      this.logger.logError('Missing params in SocketApiConnection: Could not create sockets')
      return
    }
    if (!RedisService.instance.cacheHandle) {
      this.logger.logError(
        'Redis instance unavailable in SocketApiConnection: Could not create sockets',
      )
      return
    }

    SocketApiConnection.#instance = this
    const pubClient = RedisService.instance.cacheHandle.duplicate()
    const subClient = RedisService.instance.cacheHandle.duplicate()

    this.io = new Server(params.httpServer, {
      adapter: createAdapter(pubClient, subClient),
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: false,
      },
      cors: {
        credentials: true,
        origin: params.webUrl,
      },
      serveClient: false,
    })
  }

  public static get instance() {
    return SocketApiConnection.#instance
  }
}

export type SocketApiConnectionType = typeof SocketApiConnection.prototype
