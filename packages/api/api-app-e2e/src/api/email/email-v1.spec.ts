import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios'

import type {
  CreateEmailPayloadType,
  OtpResponseType,
  UpdateEmailPayloadType,
} from '@dx3/models-shared'
import { TEST_EMAIL_ADMIN, TEST_EXISTING_USER_ID, TEST_UUID } from '@dx3/test-data'

import { getGlobalAuthHeaders, getGlobalAuthResponse } from '../../support/test-setup'

describe('v1 Email Routes', () => {
  let idToUpdate: string

  describe('POST /api/v1/email/validate', () => {
    test('should return an error when email is not valid', async () => {
      const request: AxiosRequestConfig = {
        data: {
          email: 'not an email',
        },
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/email/validate',
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('The email you provided is not valid.')
      }
    })

    test('should return an error when missing data in request', async () => {
      const payload = {
        email: undefined,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/email/validate`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('No email sent.')
      }
    })

    test('should return an error when email exists', async () => {
      const payload = {
        email: TEST_EMAIL_ADMIN,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/email/validate`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(`${TEST_EMAIL_ADMIN} already exists.`)
      }
    })
  })

  describe('POST /api/v1/email', () => {
    test('should return an error when no payload sent', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/email',
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
          'Not enough information to create an email.',
        )
      }
    })

    test('should return an error when email exists', async () => {
      const payload: CreateEmailPayloadType = {
        code: '',
        def: false,
        email: TEST_EMAIL_ADMIN,
        label: 'Work',
        userId: TEST_EXISTING_USER_ID,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/email/`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(`${TEST_EMAIL_ADMIN} already exists.`)
      }
    })

    test('should return an error when email is disposable', async () => {
      const payload: CreateEmailPayloadType = {
        code: '',
        def: false,
        email: 'test@0-mail.com',
        label: 'Work',
        userId: TEST_EXISTING_USER_ID,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/email/`,
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
          `The email you provided is not valid. Please note that we do not allow disposable emails or emails that do not exist, so make sure to use a real email address.`,
        )
      }
    })
    test('should return an error when email is invalid', async () => {
      const payload: CreateEmailPayloadType = {
        code: '',
        def: false,
        email: 'test@mail.invalidtld',
        label: 'Work',
        userId: TEST_EXISTING_USER_ID,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/email/`,
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
          `The email you provided is not valid: TLD.`,
        )
      }
    })

    test('should return 200 when successfuly creates email', async () => {
      const result = await axios.request<AxiosRequestConfig, AxiosResponse<OtpResponseType>>({
        data: {
          email: 'test@email.com',
        },
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: `/api/v1/auth/otp-code/send/email`,
        withCredentials: true,
      })
      const payload: CreateEmailPayloadType = {
        code: result.data.code,
        def: false,
        email: 'test@email.com',
        label: 'Work',
        userId: getGlobalAuthResponse().profile.id,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/email',
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()

      idToUpdate = response.data.id
    })
  })

  describe('PUT /api/v1/email/:id', () => {
    test('should return an error when no email exists with the id', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/email/${TEST_UUID}`,
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
          `Email could not be found with the id: ${TEST_UUID}`,
        )
      }
    })

    test('should return 200 when successfuly updates email', async () => {
      const payload: UpdateEmailPayloadType = {
        def: false,
        id: idToUpdate,
        label: 'Test',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/email/${idToUpdate}`,
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
    })
  })

  describe('DELETE /api/v1/email/:id', () => {
    test('should return an error when no email exists with the id', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/email/${TEST_UUID}`,
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
          `Email could not be found with the id: ${TEST_UUID}`,
        )
      }
    })

    test('should return 200 when successfuly deletes email', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/email/${idToUpdate}`,
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
    })

    test('should permanently delete an email when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'DELETE',
        url: `/api/v1/email/test/${idToUpdate}`,
        withCredentials: true,
      }

      const result = await axios.request<AxiosRequestConfig, AxiosResponse<void>>(request)

      expect(result.status).toBe(200)
    })
  })
})
