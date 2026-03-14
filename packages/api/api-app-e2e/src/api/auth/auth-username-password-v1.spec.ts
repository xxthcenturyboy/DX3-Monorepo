import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { LoginPayloadType } from '@dx3/models-shared'
import { TEST_USER_DATA } from '@dx3/test-data'

import { AuthUtil } from './auth-util-v1'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth — Username + Password Login', () => {
  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('POST /api/auth/login — error cases', () => {
    test('should return an error when password is incorrect for username', async () => {
      const payload: LoginPayloadType = {
        password: 'bad-password',
        value: TEST_USER_DATA.ADMIN.username,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/auth/login',
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('101 Invalid username or password')
      }
    })

    test('should return an error when username does not exist', async () => {
      const payload: LoginPayloadType = {
        password: 'anypassword',
        value: 'no-such-username-xyz',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/auth/login',
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('101 Invalid username or password')
      }
    })
  })

  describe('POST /api/auth/login — success cases', () => {
    test('should log in USER via username + password', async () => {
      const authUtil = new AuthUtil()
      const result = await authUtil.loginWithUsernamePassword(
        TEST_USER_DATA.USER.username,
        TEST_USER_DATA.USER.password,
      )

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.USER.id)
    })

    test('should log in ADMIN via username + password', async () => {
      const authUtil = new AuthUtil()
      const result = await authUtil.loginWithUsernamePassword(
        TEST_USER_DATA.ADMIN.username,
        TEST_USER_DATA.ADMIN.password,
      )

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.ADMIN.id)
    })

    test('should log in SUPERADMIN via username + password', async () => {
      const authUtil = new AuthUtil()
      const result = await authUtil.loginWithUsernamePassword(
        TEST_USER_DATA.SUPERADMIN.username,
        TEST_USER_DATA.SUPERADMIN.password,
      )

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.SUPERADMIN.id)
    })
  })
})
