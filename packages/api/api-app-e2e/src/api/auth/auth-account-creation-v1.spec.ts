import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { AccountCreationPayloadType, AuthSuccessResponseType } from '@dx3/models-shared'
import { AUTH_TOKEN_NAMES, ERROR_CODES, PHONE_DEFAULT_REGION_CODE, REDACTED_VALUE } from '@dx3/models-shared'
import {
  TEST_DEVICE,
  TEST_EMAIL_NEW_2,
  TEST_PHONE_3,
  TEST_PHONE_IT_INVALID,
  TEST_USER_DATA,
} from '@dx3/test-data'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth Account Creation', () => {
  let otpEmail: string
  let otpPhone: string

  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('POST /api/auth/otp-code/send/email', () => {
    test('should return empty code when sent with an invalid email', async () => {
      // The endpoint silently returns { code: '' } for invalid/unrecognised emails — it does not
      // expose validation errors to prevent enumeration attacks.
      const response = await axios.request<{ code: string }>({
        data: { email: 'not-a-valid-email' },
        method: 'POST',
        url: '/api/auth/otp-code/send/email',
      })
      expect(response.status).toEqual(200)
      expect(response.data.code).toEqual('')
    })

    test('should return code when sent with a valid new email', async () => {
      const response = await axios.request<{ code: string }>({
        data: { email: TEST_EMAIL_NEW_2 },
        method: 'POST',
        url: '/api/auth/otp-code/send/email',
      })
      expect(response.status).toEqual(200)
      expect(response.data.code).toBeTruthy()
      otpEmail = response.data.code
    })
  })

  describe('POST /api/auth/otp-code/send/phone', () => {
    test('should return empty string when sent with an invalid IT phone', async () => {
      const response = await axios.request<{ code: string }>({
        data: { phone: TEST_PHONE_IT_INVALID },
        method: 'POST',
        url: '/api/auth/otp-code/send/phone',
      })
      expect(response.status).toEqual(200)
      expect(response.data.code).toEqual('')
    })

    test('should return code when sent with a valid new US phone', async () => {
      const response = await axios.request<{ code: string }>({
        data: { phone: TEST_PHONE_3 },
        method: 'POST',
        url: '/api/auth/otp-code/send/phone',
      })
      expect(response.status).toEqual(200)
      expect(response.data.code).toBeTruthy()
      otpPhone = response.data.code
    })
  })

  describe('POST /api/auth/account — error cases', () => {
    test('should return a validation error when sent with no value', async () => {
      const payload: AccountCreationPayloadType = { code: '', value: '' }
      try {
        expect(
          await axios.request({ data: payload, method: 'POST', url: '/api/auth/account' }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.GENERIC_VALIDATION_FAILED} Invalid request: code: String must contain at least 1 character(s)`,
        )
      }
    })

    test('should return an error when sent with an invalid email', async () => {
      const payload: AccountCreationPayloadType = { code: 'OU812', value: 'not-a-valid-email' }
      try {
        expect(
          await axios.request({ data: payload, method: 'POST', url: '/api/auth/account' }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.AUTH_SIGNUP_FAILED} Account could not be created with payload: ${JSON.stringify({ code: REDACTED_VALUE, value: REDACTED_VALUE }, null, 2)}`,
        )
      }
    })

    test('should return an OTP error when sent with an existing email and invalid OTP', async () => {
      const payload: AccountCreationPayloadType = { code: 'OU812', value: TEST_USER_DATA.USER.email }
      try {
        expect(
          await axios.request({ data: payload, method: 'POST', url: '/api/auth/account' }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.AUTH_OTP_INVALID} Invalid code.`,
        )
      }
    })

    test('should return an error when sent with a restricted email (admin prefix)', async () => {
      const payload: AccountCreationPayloadType = { code: 'OU812', value: 'admin@test.com' }
      try {
        expect(
          await axios.request({ data: payload, method: 'POST', url: '/api/auth/account' }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.AUTH_SIGNUP_FAILED} Account could not be created with payload: ${JSON.stringify({ code: REDACTED_VALUE, value: REDACTED_VALUE }, null, 2)}`,
        )
      }
    })

    test('should return an error when sent with an invalid phone', async () => {
      const payload: AccountCreationPayloadType = { code: 'OU812', value: TEST_PHONE_IT_INVALID }
      try {
        expect(
          await axios.request({ data: payload, method: 'POST', url: '/api/auth/account' }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.AUTH_SIGNUP_FAILED} Account could not be created with payload: ${JSON.stringify({ code: REDACTED_VALUE, value: REDACTED_VALUE }, null, 2)}`,
        )
      }
    })

    test('should return an error when sent with an unrecognized phone number', async () => {
      const payload: AccountCreationPayloadType = {
        code: 'OU812',
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_USER_DATA.USER.phone,
      }
      try {
        expect(
          await axios.request({ data: payload, method: 'POST', url: '/api/auth/account' }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `${ERROR_CODES.AUTH_SIGNUP_FAILED} Account could not be created with payload: ${JSON.stringify({ code: REDACTED_VALUE, region: PHONE_DEFAULT_REGION_CODE, value: REDACTED_VALUE }, null, 2)}`,
        )
      }
    })
  })

  describe('POST /api/auth/account — success cases', () => {
    test('should return user profile when successfully creating account with email OTP', async () => {
      const payload: AccountCreationPayloadType = {
        code: otpEmail,
        value: TEST_EMAIL_NEW_2,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/auth/account',
      }

      const response = await axios.request<AuthSuccessResponseType>(request)

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
      expect(response.data.profile.emails).toHaveLength(1)

      const refreshCookie = (response.headers['set-cookie'] as string[])
        .find((c) => c.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
      expect(refreshCookie).toBeDefined()
    })

    test('should return user profile when successfully creating account with phone OTP', async () => {
      const payload: AccountCreationPayloadType = {
        code: otpPhone,
        device: TEST_DEVICE,
        region: PHONE_DEFAULT_REGION_CODE,
        value: TEST_PHONE_3,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        method: 'POST',
        url: '/api/auth/account',
      }

      const response = await axios.request<AuthSuccessResponseType>(request)

      expect(response.status).toEqual(200)
      expect(response.data.accessToken).toBeDefined()
      expect(response.data.profile.phones).toHaveLength(1)

      const refreshCookie = (response.headers['set-cookie'] as string[])
        .find((c) => c.includes(AUTH_TOKEN_NAMES.REFRESH))
        ?.match(new RegExp(`^${AUTH_TOKEN_NAMES.REFRESH}=(.+?);`))?.[1]
      expect(refreshCookie).toBeDefined()
    })
  })
})
