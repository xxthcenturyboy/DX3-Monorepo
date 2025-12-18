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
      // arrange
      const req: IRequest = new Request() as unknown as IRequest
      req.headers = {
        authorization: 'Bearer token',
      }
      // act
      const token = HeaderService.getTokenFromRequest(req)
      // assert
      expect(token).toBeDefined()
      expect(token).toEqual('token')
    })
  })
})
