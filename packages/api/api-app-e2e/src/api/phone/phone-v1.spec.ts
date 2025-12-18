import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import type {
  CreatePhonePayloadType,
  OtpResponseType,
  UpdatePhonePayloadType,
} from '@dx3/models-shared'
import { PHONE_DEFAULT_REGION_CODE } from '@dx3/models-shared'
import {
  TEST_COUNTRY_CODE,
  TEST_EXISTING_PHONE,
  TEST_PHONE,
  TEST_PHONE_IT_INVALID,
  TEST_PHONE_IT_VALID,
  TEST_PHONE_VALID,
  TEST_UUID,
} from '@dx3/test-data'

import { getGlobalAuthHeaders, getGlobalAuthResponse } from '../../support/test-setup'

describe('v1 Phone Routes', () => {
  let idToUpdate: string
  let idToUpdateItaly: string

  describe('POST /api/v1/phone/validate', () => {
    test('should return an error when phone is not valid', async () => {
      const request: AxiosRequestConfig = {
        data: {
          phone: 'not a phone number',
          regionCode: 'x',
        },
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/phone/validate',
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('This phone cannot be used (invalid).')
      }
    })

    test('should return an error when missing data in request', async () => {
      const payload = {
        phone: TEST_EXISTING_PHONE,
        regionCode: undefined,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/phone/validate`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('Missing phone or region code.')
      }
    })

    test('should return an error when phone exists', async () => {
      const payload = {
        phone: TEST_EXISTING_PHONE,
        regionCode: PHONE_DEFAULT_REGION_CODE,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/phone/validate`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('(858) 484-6800 is already in use.')
      }
    })
  })

  describe('POST /api/v1/phone', () => {
    test('should return an error when no payload sent', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/phone',
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          'Not enough information to create a phone.',
        )
      }
    })

    test('should return an error when phone exists', async () => {
      const payload: CreatePhonePayloadType = {
        code: 'code',
        countryCode: TEST_COUNTRY_CODE,
        def: false,
        label: 'Work',
        phone: TEST_EXISTING_PHONE,
        regionCode: PHONE_DEFAULT_REGION_CODE,
        userId: getGlobalAuthResponse().profile.id,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/phone/`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('(858) 484-6800 is already in use.')
      }
    })

    test('should return an error when phone is invalid', async () => {
      const payload: CreatePhonePayloadType = {
        code: 'code',
        countryCode: TEST_COUNTRY_CODE,
        def: false,
        label: 'Work',
        phone: TEST_PHONE,
        regionCode: PHONE_DEFAULT_REGION_CODE,
        userId: getGlobalAuthResponse().profile.id,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/phone/`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(`This phone cannot be used (invalid).`)
      }
    })

    test('should return an error when Italian phone is invalid', async () => {
      const payload: CreatePhonePayloadType = {
        code: 'code',
        countryCode: '39',
        def: false,
        label: 'Work',
        phone: TEST_PHONE_IT_INVALID,
        regionCode: 'IT',
        userId: getGlobalAuthResponse().profile.id,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/phone/`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(`This phone cannot be used (invalid).`)
      }
    })

    test('should return 200 when successfuly creates Italian phone', async () => {
      const result = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
        data: {
          phone: TEST_PHONE_IT_VALID,
          regionCode: 'IT',
        },
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/auth/otp-code/send/phone`,
        withCredentials: true,
      })
      const payload: CreatePhonePayloadType = {
        code: result.data.code,
        countryCode: '39',
        def: false,
        label: 'Work',
        phone: TEST_PHONE_IT_VALID,
        regionCode: 'IT',
        userId: getGlobalAuthResponse().profile.id,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/phone',
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()

      idToUpdateItaly = response.data.id
    })

    test('should return 200 when successfuly creates phone', async () => {
      const result = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
        data: {
          phone: TEST_PHONE_VALID,
          regionCode: 'US',
        },
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/auth/otp-code/send/phone`,
        withCredentials: true,
      })
      const payload: CreatePhonePayloadType = {
        code: result.data.code,
        countryCode: TEST_COUNTRY_CODE,
        def: false,
        label: 'Work',
        phone: TEST_PHONE_VALID,
        regionCode: 'US',
        userId: getGlobalAuthResponse().profile.id,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/phone',
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()

      idToUpdate = response.data.id
    })
  })

  describe('PUT /api/v1/phone/:id', () => {
    test('should return an error when no phone exists with the id', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/phone/${TEST_UUID}`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `Phone could not be found with the id: ${TEST_UUID}`,
        )
      }
    })

    test('should return 200 when successfuly updates email', async () => {
      const payload: UpdatePhonePayloadType = {
        def: false,
        id: idToUpdate,
        label: 'Test',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/phone/${idToUpdate}`,
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
    })
  })

  describe('DELETE /api/v1/phone/:id', () => {
    test('should return an error when no phone exists with the id', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/phone/${TEST_UUID}`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(
          `Phone could not be found with the id: ${TEST_UUID}`,
        )
      }
    })

    test('should return 200 when successfuly deletes phone', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/phone/${idToUpdate}`,
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
    })

    test('should permanently delete our test phones when called', async () => {
      const request1: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/phone/test/${idToUpdate}`,
        withCredentials: true,
      }
      const request2: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/phone/test/${idToUpdateItaly}`,
        withCredentials: true,
      }

      const result1 = await axios.request<AxiosRequestConfig, AxiosResponse<void>>(request1)
      const result2 = await axios.request<AxiosRequestConfig, AxiosResponse<void>>(request2)

      expect(result1.status).toBe(200)
      expect(result2.status).toBe(200)
    })
  })
})
