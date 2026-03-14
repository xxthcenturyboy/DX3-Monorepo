import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { LoginPayloadType } from '@dx3/models-shared'
import { TEST_EMAIL, TEST_EMAIL_ADMIN, TEST_EMAIL_SUPERADMIN, TEST_USER_DATA } from '@dx3/test-data'

import { AuthUtil } from './auth-util-v1'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth — Email + Password Login', () => {
  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('POST /api/auth/login — error cases', () => {
    test('should return an error when password is incorrect', async () => {
      const payload: LoginPayloadType = {
        password: 'bad-password',
        value: TEST_EMAIL_ADMIN,
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

    test('should return an error when email does not exist', async () => {
      const payload: LoginPayloadType = {
        password: 'anypassword',
        value: 'nobody@nowhere.invalid',
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
    test('should log in USER via email + password', async () => {
      const authUtil = new AuthUtil()
      const result = await authUtil.login(TEST_EMAIL, TEST_USER_DATA.USER.password)

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.USER.id)
      expect(Array.isArray(result.profile.emails)).toBe(true)
    })

    test('should log in ADMIN via email + password', async () => {
      const authUtil = new AuthUtil()
      const result = await authUtil.login(TEST_EMAIL_ADMIN, TEST_USER_DATA.ADMIN.password)

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.ADMIN.id)
      expect(Array.isArray(result.profile.emails)).toBe(true)
    })

    test('should log in SUPERADMIN via email + password', async () => {
      const authUtil = new AuthUtil()
      const result = await authUtil.login(TEST_EMAIL_SUPERADMIN, TEST_USER_DATA.SUPERADMIN.password)

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.SUPERADMIN.id)
      expect(Array.isArray(result.profile.emails)).toBe(true)
    })
  })
})
