import type { Request } from 'express'
import type {
  // @ts-expect-error - this is for typing - no impact
  Handshake,
} from 'socket.io/dist/socket'

import { HEADER_API_VERSION_PROP, HEADER_CLIENT_FINGERPRINT_PROP } from '@dx3/models-shared'

export class HeaderService {
  public static getTokenFromRequest(req: Request) {
    let token = ''

    const authHeader = req.headers.authorization
    if (authHeader) {
      token = authHeader.split('Bearer ')[1]
    }

    return token
  }

  public static getFingerprintFromRequest(req: Request): string | null {
    const fingerprintHeaderValue = req.get(HEADER_CLIENT_FINGERPRINT_PROP)
    if (fingerprintHeaderValue) {
      return fingerprintHeaderValue
    }

    return null
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

  public static getVersionFromRequest(req: Request) {
    let version = 0
    const versionHeaderValue = req.get(HEADER_API_VERSION_PROP)
    if (versionHeaderValue) {
      version = Number(versionHeaderValue)
      if (version) {
        return version
      }
    }

    return version
  }
}
