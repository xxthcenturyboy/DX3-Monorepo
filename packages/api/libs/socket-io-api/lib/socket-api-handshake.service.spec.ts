import type { Request as IRequest } from 'express'
import { Request } from 'jest-express/lib/request'
import type {
  // @ts-expect-error - this is for typing - no impact
  Handshake,
} from 'socket.io/dist/socket'

import { ApiLoggingClass } from '../../logger'
import type { UserSessionType } from '../../user/user-api.types'
import { ensureLoggedInSocket, getUserIdFromHandshake } from './socket-api-handshake.service'

jest.mock('../../logger', () => require('../../testing/mocks/internal/logger.mock'))
jest.unmock('../../headers/header.service')

describe('socket-api-handshake.service', () => {
  const handshakeMock: Handshake = {
    address: 'test-address',
    auth: {},
    headers: {
      authorization: 'Bearer token',
    },
    issued: 12344,
    query: {},
    secure: true,
    time: '0000',
    url: 'test-url',
    xdomain: false,
  }
  let req: IRequest

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Test' })
    req = new Request() as unknown as IRequest
    req.user = {
      id: 'test-user-id',
    } as UserSessionType
  })

  afterAll(async () => {
    jest.clearAllMocks()
  })

  describe('ensureLoggedInSocket', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(ensureLoggedInSocket).toBeDefined()
    })

    it('should return true when has token in headers.authorization', () => {
      // arrange
      // act
      const result = ensureLoggedInSocket(handshakeMock)
      // assert
      expect(result).toEqual(true)
    })

    it('should return true when has token in header.auth.token', () => {
      // arrange
      const modHandshake = {
        ...handshakeMock,
        auth: {
          token: 'test-token',
        },
        headers: {},
      }
      // act
      const result = ensureLoggedInSocket(modHandshake)
      // assert
      expect(result).toEqual(true)
    })

    it('should return false when has no token.', () => {
      // arrange
      const modHandshake = {
        ...handshakeMock,
        headers: {},
      }
      // act
      const result = ensureLoggedInSocket(modHandshake)
      // assert
      expect(result).toEqual(false)
    })
  })

  describe('getUserIdFromHandshake', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(getUserIdFromHandshake).toBeDefined()
    })
    // Everything in this function is tested by the previous test
  })
})
