import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { AuthSuccessResponseType, LoginPayloadType } from '@dx3/models-shared'
import { TEST_EMAIL, TEST_EMAIL_ADMIN, TEST_EMAIL_SUPERADMIN, TEST_USER_DATA } from '@dx3/test-data'

import { AuthUtil } from './auth-util-v1'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth — Email OTP Login', () => {
  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  async function sendEmailOtp(email: string, strict = true): Promise<string> {
    const response = await axios.request<{ code: string }>({
      data: { email, strict },
      method: 'POST',
      url: '/api/auth/otp-code/send/email',
    })
    return response.data.code
  }

  describe('POST /api/auth/otp-code/send/email — error cases', () => {
    test('should return empty string when email is invalid', async () => {
      const response = await axios.request<{ code: string }>({
        data: { email: 'not-a-valid-email' },
        method: 'POST',
        url: '/api/auth/otp-code/send/email',
      })
      expect(response.status).toEqual(200)
      expect(response.data.code).toEqual('')
    })
  })

  describe('POST /api/auth/login — error cases', () => {
    test('should return an error when email has no account', async () => {
      const otpCode = await sendEmailOtp(TEST_EMAIL)
      const payload: LoginPayloadType = { code: otpCode, value: 'not-in-this-system@useless.com' }
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
        expect(typedError.response.data.message).toEqual('100 Could not log you in.')
      }
    })

    test('should return an error when OTP code is invalid', async () => {
      const payload: LoginPayloadType = { code: 'INVALID', value: TEST_EMAIL }
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
        expect(typedError.response.data.message).toEqual('100 Could not log you in.')
      }
    })
  })

  describe('POST /api/auth/login — success cases', () => {
    test('should log in USER via email OTP', async () => {
      const authUtil = new AuthUtil()
      const otp = await sendEmailOtp(TEST_EMAIL)
      const result = await authUtil.loginEmailPasswordless(TEST_EMAIL, otp)

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.USER.id)
      expect(Array.isArray(result.profile.emails)).toBe(true)
    })

    test('should log in ADMIN via email OTP', async () => {
      const authUtil = new AuthUtil()
      const otp = await sendEmailOtp(TEST_EMAIL_ADMIN)
      const result = await authUtil.loginEmailPasswordless(TEST_EMAIL_ADMIN, otp)

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.ADMIN.id)
    })

    test('should log in SUPERADMIN via email OTP', async () => {
      const authUtil = new AuthUtil()
      const otp = await sendEmailOtp(TEST_EMAIL_SUPERADMIN)
      const result = await authUtil.loginEmailPasswordless(TEST_EMAIL_SUPERADMIN, otp)

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.SUPERADMIN.id)
    })
  })
})
