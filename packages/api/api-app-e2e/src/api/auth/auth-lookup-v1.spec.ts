import axios, { type AxiosError } from 'axios'

import type { UserLookupResponseType } from '@dx3/models-shared'
import { PHONE_DEFAULT_REGION_CODE, USER_LOOKUPS } from '@dx3/models-shared'
import {
  TEST_EMAIL,
  TEST_EMAIL_ADMIN,
  TEST_PHONE_1,
  TEST_PHONE_2,
} from '@dx3/test-data'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Auth Lookup', () => {
  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('GET /api/auth/lookup — phone', () => {
    test('should return available when queried with a non-existent phone', async () => {
      const url = `/api/auth/lookup?code=1&value=${TEST_PHONE_2}&type=${USER_LOOKUPS.PHONE}&region=${PHONE_DEFAULT_REGION_CODE}`
      const response = await axios.get<UserLookupResponseType>(url)
      expect(response.status).toBe(200)
      expect(response.data.available).toBe(true)
    })

    test('should return unavailable when queried with an existing phone', async () => {
      const url = `/api/auth/lookup?code=1&value=${TEST_PHONE_1}&type=${USER_LOOKUPS.PHONE}&region=${PHONE_DEFAULT_REGION_CODE}`
      const response = await axios.get<UserLookupResponseType>(url)
      expect(response.status).toBe(200)
      expect(response.data.available).toBe(false)
    })

    test('should return an error when queried without a region code', async () => {
      const url = `/api/auth/lookup?code=1&value=${TEST_PHONE_2}&type=${USER_LOOKUPS.PHONE}`
      try {
        expect(await axios.get(url)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
      }
    })
  })

  describe('GET /api/auth/lookup — email', () => {
    test('should return available when queried with a non-existent email', async () => {
      const expectedResult: UserLookupResponseType = { available: true }
      const url = `/api/auth/lookup?value=non-existent-${TEST_EMAIL}&type=${USER_LOOKUPS.EMAIL}`
      const response = await axios.get<UserLookupResponseType>(url)
      expect(response.status).toBe(200)
      expect(response.data).toEqual(expectedResult)
    })

    test('should return unavailable when queried with an existing email', async () => {
      const url = `/api/auth/lookup?value=${TEST_EMAIL_ADMIN}&type=${USER_LOOKUPS.EMAIL}`
      const response = await axios.get<UserLookupResponseType>(url)
      expect(response.status).toBe(200)
      expect(response.data.available).toBe(false)
    })

    test('should return an error when queried with an invalid email', async () => {
      const url = `/api/auth/lookup?code=1&value=not-a-valid-email&type=${USER_LOOKUPS.EMAIL}`
      try {
        expect(await axios.get(url)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
      }
    })

    test('should return an error when queried with a disposable email', async () => {
      const url = `/api/auth/lookup?code=1&value=email@080mail.com&type=${USER_LOOKUPS.EMAIL}`
      try {
        expect(await axios.get(url)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(400)
      }
    })
  })
})
