import type { Server } from 'node:http'

export type SocketApiConnectionConstructorType = {
  httpServer: Server
  webUrl: string
}

export type SocketApiServiceConstructorType = {} & SocketApiConnectionConstructorType
