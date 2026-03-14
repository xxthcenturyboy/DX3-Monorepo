import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { AuthSuccessResponseType } from '@dx3/models-shared'
import { AUTH_TOKEN_NAMES } from '@dx3/models-shared'

import { AuthUtil } from './auth-util-v1'

describe('v1 Auth — Token Refresh & Logout', () => {
  let errorLogSpyMock: jest.SpyInstance
  let phoneAuthToken: string
  let phoneRefreshToken: string

  beforeAll(async () => {
    // Log in via email+password to get a fresh session with both tokens
    const authUtil = new AuthUtil()
    const loginResult = await authUtil.login()

    if (!loginResult?.accessToken) {
      throw new Error(`Login failed in beforeAll — no accessToken returned`)
    }

    phoneAuthToken = authUtil.accessToken
    phoneRefreshToken = authUtil.cookiesRaw
      ?.find((c) => c.includes(AUTH_TOKEN_NAMES.REFRESH))
      ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1] as string

    if (!phoneRefreshToken) {
      throw new Error(
        `No refresh token in cookies after login. cookiesRaw: ${JSON.stringify(authUtil.cookiesRaw)}`,
      )
    }

    errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    errorLogSpyMock?.mockRestore()
  })

  describe('GET /api/auth/refresh-token', () => {
    test('should return 401 when sent with an invalid refresh token', async () => {
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=invalid-jwt`],
        },
        method: 'GET',
        url: '/api/auth/refresh-token',
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Invalid token.')
      }
    })

    test('should return a new accessToken with a valid refresh token', async () => {
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'GET',
        url: '/api/auth/refresh-token',
        withCredentials: true,
      }
      const response = await axios.request<{ accessToken: string }>(request)

      // Update tokens for logout test
      phoneAuthToken = response.data.accessToken
      phoneRefreshToken = (response.headers['set-cookie'] as string[])
        .find((c) => c.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1] as string

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
    })
  })

  describe('POST /api/auth/logout', () => {
    test('should return loggedOut: true on successful logout', async () => {
      const request: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${phoneAuthToken}`,
          cookie: [`${AUTH_TOKEN_NAMES.REFRESH}=${phoneRefreshToken}`],
        },
        method: 'POST',
        url: '/api/auth/logout',
      }
      const response = await axios.request<{ loggedOut: boolean }>(request)
      expect(response.status).toEqual(200)
      expect(response.data).toEqual({ loggedOut: true })
    })
  })
})
