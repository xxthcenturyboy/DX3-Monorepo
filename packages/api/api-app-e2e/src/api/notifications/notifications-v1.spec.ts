import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { NotificationCreationParamTypes } from '@dx3/models-shared'
import { NOTIFICATION_LEVELS } from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID } from '@dx3/test-data'

import { getAuthHeaders, getGlobalAuthHeaders } from '../../support/test-setup'

describe('v1 Notification Routes', () => {
  const idsToUpdate: string[] = []

  describe('POST /api/notification/user', () => {
    test('should return an error when no userId and message is sent', async () => {
      //arrange
      const payload: NotificationCreationParamTypes = {
        level: NOTIFICATION_LEVELS.INFO,
        message: '',
        title: 'TEST',
        userId: '',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/notification/user',
        withCredentials: true,
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('904 Missing params')
      }
    })

    test('should return a notificaiton when successful', async () => {
      //arrange
      const payload: NotificationCreationParamTypes = {
        level: NOTIFICATION_LEVELS.INFO,
        message: 'Test Message',
        title: 'TEST',
        userId: TEST_EXISTING_USER_ID,
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/notification/user',
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      idsToUpdate.push(result.data.id)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
      expect(result.data.title).toEqual('TEST')
    })
  })

  describe('POST /api/notification/all-users', () => {
    test('should return an error when no userId and message is sent', async () => {
      //arrange
      const payload: Partial<NotificationCreationParamTypes> = {
        level: NOTIFICATION_LEVELS.INFO,
        message: '',
        title: 'TEST',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/notification/all-users',
        withCredentials: true,
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response?.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('904 Missing params')
      }
    })

    test('should return a notificaiton when successful', async () => {
      //arrange
      const payload: Partial<NotificationCreationParamTypes> = {
        level: NOTIFICATION_LEVELS.INFO,
        message: 'Test Message',
        suppressPush: true,
        title: 'TEST',
      }
      const request: AxiosRequestConfig = {
        data: payload,
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/notification/all-users',
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      idsToUpdate.push(result.data.id)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
      expect(result.data.title).toEqual('TEST')
    })
  })

  describe('POST /api/notification/app-update', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/notification/app-update',
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('GET /api/notification/badge-count/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/notification/badge-count/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('GET /api/notification/user/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/notification/user/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
      expect(result.data.user.length).toEqual(1)
    })
  })

  describe('PUT /api/notification/read-all/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/notification/read-all/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/notification/viewed-all/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/notification/viewed-all/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/notification/dismiss-all/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/notification/dismiss-all/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/notification/dismiss/:id/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/notification/dismiss/${idsToUpdate[0]}/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/notification/read/:id', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/notification/read/${idsToUpdate[1]}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('Role-based access', () => {
    test('POST /api/notification/user should return 401 for USER', async () => {
      const request: AxiosRequestConfig = {
        data: {
          level: NOTIFICATION_LEVELS.INFO,
          message: 'Test',
          title: 'Test',
          userId: TEST_EXISTING_USER_ID,
        },
        headers: getAuthHeaders('user'),
        method: 'POST',
        url: '/api/notification/user',
        withCredentials: true,
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
      }
    })

    test('POST /api/notification/all-users should return 401 for USER', async () => {
      const request: AxiosRequestConfig = {
        data: {
          level: NOTIFICATION_LEVELS.INFO,
          message: 'Test',
          title: 'Test',
        },
        headers: getAuthHeaders('user'),
        method: 'POST',
        url: '/api/notification/all-users',
        withCredentials: true,
      }
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
      }
    })
  })
})
