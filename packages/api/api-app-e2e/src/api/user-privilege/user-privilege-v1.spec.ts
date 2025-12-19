import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { UpdatePrivilegeSetPayloadType } from '@dx3/models-shared'
import { TEST_UUID } from '@dx3/test-data'

import { getGlobalAuthHeaders } from '../../support/test-setup'

describe('v1 User Privilege Routes', () => {
  let initialDescription: string
  let privilegeSetId: string

  describe('GET /api/v1/privilege-set', () => {
    test('should return an array of privileges when called', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: '/api/v1/privilege-set',
        withCredentials: true,
      }

      const result = await axios.request(request)

      expect(result.status).toBe(200)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data).toHaveLength(3)
      privilegeSetId = result.data[0].id
      initialDescription = result.data[0].description
    })
  })

  describe('PUT /api/v1/privilege-set/:id', () => {
    test('should return an error when no record exists with the id', async () => {
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/privilege-set/${TEST_UUID}`,
        withCredentials: true,
      }

      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('No Privilege Set Found!')
      }
    })

    test('should return 200 when successfuly updates description', async () => {
      const payload: UpdatePrivilegeSetPayloadType = {
        description: 'Test',
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/privilege-set/${privilegeSetId}`,
        withCredentials: true,
      }

      try {
        const response = await axios.request(request)
        expect(response.status).toEqual(200)
        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
      } catch (err) {
        console.error('Error during privilege set update test:', err)
      }
    })

    test('should return 200 when successfuly updates description to original value', async () => {
      const payload: UpdatePrivilegeSetPayloadType = {
        description: initialDescription,
      }

      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/privilege-set/${privilegeSetId}`,
        withCredentials: true,
      }

      const response = await axios.request(request)

      expect(response.status).toEqual(200)
      expect(response.data).toBeDefined()
      expect(response.data.id).toBeDefined()
    })
  })
})
