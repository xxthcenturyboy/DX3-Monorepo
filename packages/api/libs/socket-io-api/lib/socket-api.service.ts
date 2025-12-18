import { SocketApiConnection } from './socket-api.connection'

export class SocketApiService extends SocketApiConnection {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public setup() {}
}

export type SocketApiServiceType = typeof SocketApiService.prototype
