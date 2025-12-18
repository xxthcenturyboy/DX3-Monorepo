import {
  // @ts-expect-error - wierd
  type EventsMap,
  io,
  type Socket,
} from 'socket.io-client'

import { WebConfigService } from '../../config/config-web.service'

export class SocketWebConnection {
  public static async createSocket<
    TServertoClient extends EventsMap,
    TClientToServer extends EventsMap,
  >(namespace: string) {
    const URLS = WebConfigService.getWebUrls()
    let socketUrl = URLS.API_URL

    if (namespace) {
      socketUrl = `${socketUrl}${namespace}`
    }
    const { store } = await import('../../store')
    const accessToken = store.getState().auth.token

    const socket: Socket<TServertoClient, TClientToServer> = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    return socket
  }
}

export type SocketWebConnectionType = typeof SocketWebConnection.prototype
