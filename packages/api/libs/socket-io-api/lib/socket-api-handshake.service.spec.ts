import type { Request as IRequest } from 'express'
import { Request } from 'jest-express/lib/request'
import type {
  // @ts-expect-error - this is for typing - no impact
  Handshake,
} from 'socket.io/dist/socket'

import { ApiLoggingClass } from '../../logger'
import type { UserSessionType } from '../../user/user-api.types'
import {
  ensureLoggedInSocket,
  getUserIdFromHandshake,
  getUserRolesFromHandshake,
} from './socket-api-handshake.service'

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

    it('should return empty string when token decodes to a non-UUID userId', () => {
      const { TokenService } = require('../../auth/tokens/token.service')
      jest.spyOn(TokenService, 'getUserIdFromToken').mockReturnValueOnce('not-a-valid-uuid')
      const result = getUserIdFromHandshake(handshakeMock)
      expect(result).toBe('')
    })
  })

  describe('getUserRolesFromHandshake', () => {
    it('should exist when imported', () => {
      expect(getUserRolesFromHandshake).toBeDefined()
    })

    it('should return empty array when userId is empty (no token in handshake)', async () => {
      const noTokenHandshake = { ...handshakeMock, auth: {}, headers: {} }
      const roles = await getUserRolesFromHandshake(noTokenHandshake)
      expect(Array.isArray(roles)).toBe(true)
      expect(roles).toEqual([])
    })

    it('should return roles when user is found in the database', async () => {
      const { UserModel } = require('../../user/user-api.postgres-model')
      jest.spyOn(UserModel, 'findByPk').mockResolvedValueOnce({ roles: ['USER', 'ADMIN'] })
      const roles = await getUserRolesFromHandshake(handshakeMock)
      expect(roles).toEqual(['USER', 'ADMIN'])
    })

    it('should return empty array when user is not found in the database', async () => {
      const { UserModel } = require('../../user/user-api.postgres-model')
      jest.spyOn(UserModel, 'findByPk').mockResolvedValueOnce(null)
      const roles = await getUserRolesFromHandshake(handshakeMock)
      expect(roles).toEqual([])
    })

    it('should return empty array when database throws an error', async () => {
      const { UserModel } = require('../../user/user-api.postgres-model')
      jest.spyOn(UserModel, 'findByPk').mockRejectedValueOnce(new Error('DB connection failed'))
      const roles = await getUserRolesFromHandshake(handshakeMock)
      expect(roles).toEqual([])
    })
  })
})
