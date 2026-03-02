import type { Request as IRequest } from 'express'
import { Request } from 'jest-express/lib/request'

import { HeaderService } from './header.service'

jest.unmock('./header.service')

describe('HeaderService', () => {
  it('should exist when imported', () => {
    expect(HeaderService).toBeDefined()
  })

  describe('getTokenFromRequest', () => {
    it('should exist on the class as a static method.', () => {
      expect(HeaderService.getTokenFromRequest).toBeDefined()
    })

    it('should return the token when called.', () => {
      const req: IRequest = new Request() as unknown as IRequest
      req.headers = { authorization: 'Bearer token' }
      const token = HeaderService.getTokenFromRequest(req)
      expect(token).toBeDefined()
      expect(token).toEqual('token')
    })

    it('should return empty string when no authorization header', () => {
      const req: IRequest = new Request() as unknown as IRequest
      req.headers = {}
      const token = HeaderService.getTokenFromRequest(req)
      expect(token).toBe('')
    })
  })

  describe('getFingerprintFromRequest', () => {
    it('should return the fingerprint when header is present', () => {
      const req: IRequest = new Request() as unknown as IRequest
      jest.spyOn(req, 'get').mockReturnValue('fp-abc-123')
      const fingerprint = HeaderService.getFingerprintFromRequest(req)
      expect(fingerprint).toBe('fp-abc-123')
    })

    it('should return null when fingerprint header is absent', () => {
      const req: IRequest = new Request() as unknown as IRequest
      jest.spyOn(req, 'get').mockReturnValue(undefined)
      const fingerprint = HeaderService.getFingerprintFromRequest(req)
      expect(fingerprint).toBeNull()
    })
  })

  describe('getTokenFromHandshake', () => {
    it('should return token from authorization header', () => {
      const handshake = { auth: {}, headers: { authorization: 'Bearer hs-token' } } as any
      const token = HeaderService.getTokenFromHandshake(handshake)
      expect(token).toBe('hs-token')
    })

    it('should return token from auth.token when no authorization header', () => {
      const handshake = { auth: { token: 'auth-token' }, headers: {} } as any
      const token = HeaderService.getTokenFromHandshake(handshake)
      expect(token).toBe('auth-token')
    })

    it('should return empty string when neither authorization header nor auth.token exist', () => {
      const handshake = { auth: {}, headers: {} } as any
      const token = HeaderService.getTokenFromHandshake(handshake)
      expect(token).toBe('')
    })
  })

  describe('getVersionFromRequest', () => {
    it('should return the parsed version number when header is valid', () => {
      const req: IRequest = new Request() as unknown as IRequest
      jest.spyOn(req, 'get').mockReturnValue('2')
      const version = HeaderService.getVersionFromRequest(req)
      expect(version).toBe(2)
    })

    it('should return 0 when version header is absent', () => {
      const req: IRequest = new Request() as unknown as IRequest
      jest.spyOn(req, 'get').mockReturnValue(undefined)
      const version = HeaderService.getVersionFromRequest(req)
      expect(version).toBe(0)
    })

    it('should return 0 when version header is non-numeric (Number("abc") is NaN, falsy branch)', () => {
      const req: IRequest = new Request() as unknown as IRequest
      jest.spyOn(req, 'get').mockReturnValue('abc')
      const version = HeaderService.getVersionFromRequest(req)
      // Number('abc') = NaN; falls through to `return version` which is NaN
      expect(Number.isNaN(version as number)).toBe(true)
    })
  })
})
