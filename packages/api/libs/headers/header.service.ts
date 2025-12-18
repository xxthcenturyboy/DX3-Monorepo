import type { Request } from 'express'
import type {
  // @ts-expect-error - this is for typing - no impact
  Handshake,
} from 'socket.io/dist/socket'

export class HeaderService {
  public static getTokenFromRequest(req: Request) {
    let token = ''

    const authHeader = req.headers.authorization
    if (authHeader) {
      token = authHeader.split('Bearer ')[1]
    }

    return token
  }

  public static getTokenFromHandshake(handshake: Handshake) {
    if (handshake.headers?.authorization) {
      return handshake.headers.authorization.split('Bearer ')[1]
    }

    if (handshake.auth?.token) {
      return handshake.auth.token
    }

    return ''
  }
}
