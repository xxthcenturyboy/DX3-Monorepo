import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { LoginPayloadType } from '@dx3/models-shared'
import { PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'
import { TEST_PHONE_VALID, TEST_USER_DATA } from '@dx3/test-data'

import { AuthUtil } from './auth-util-v1'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth — Phone OTP Login', () => {
  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  async function sendPhoneOtp(phone: string, strict = true): Promise<string> {
    const response = await axios.request<{ code: string }>({
      data: { phone, strict },
      method: 'POST',
      url: '/api/auth/otp-code/send/phone',
    })
    return response.data.code
  }

  describe('POST /api/auth/otp-code/send/phone — error cases', () => {
    test('should return empty string when phone has no account', async () => {
      // Unverified IT phone should return empty — only verified mobile phones get OTP
      const response = await axios.request<{ code: string }>({
        data: { phone: TEST_USER_DATA.USER.phone },
        method: 'POST',
        url: '/api/auth/otp-code/send/phone',
      })
      expect(response.status).toEqual(200)
      expect(response.data.code).toEqual('')
    })
  })

  describe('POST /api/auth/login — error cases', () => {
    test('should return an error when phone has no account', async () => {
      const otp = await sendPhoneOtp(TEST_PHONE_VALID)
      const payload: LoginPayloadType = {
        code: otp,
        value: '8584846802', // non-existent phone
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
        expect(typedError.response.data.message).toEqual('103 Invalid code.')
      }
    })

    test('should return an error when OTP code is invalid', async () => {
      const payload: LoginPayloadType = {
        code: 'INVALID',
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_PHONE_VALID,
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
        expect(typedError.response.data.message).toEqual('103 Invalid code.')
      }
    })
  })

  describe('POST /api/auth/login — success cases', () => {
    test('should log in SUPERADMIN via US phone OTP', async () => {
      const authUtil = new AuthUtil()
      const otp = await sendPhoneOtp(TEST_PHONE_VALID)
      const result = await authUtil.loginWithPhoneOtp(
        TEST_PHONE_VALID,
        PHONE_DEFAULT_REGION_CODE,
        otp,
      )

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.SUPERADMIN.id)
      expect(Array.isArray(result.profile.phones)).toBe(true)
    })

    test('should log in ADMIN via US phone OTP', async () => {
      const authUtil = new AuthUtil()
      const otp = await sendPhoneOtp(TEST_USER_DATA.ADMIN.phone)
      const result = await authUtil.loginWithPhoneOtp(
        TEST_USER_DATA.ADMIN.phone,
        PHONE_DEFAULT_REGION_CODE,
        otp,
      )

      expect(result.accessToken).toBeDefined()
      expect(result.profile.id).toEqual(TEST_USER_DATA.ADMIN.id)
    })
  })
})
