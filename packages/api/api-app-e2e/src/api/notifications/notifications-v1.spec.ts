import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import type { NotificationCreationParamTypes } from '@dx3/models-shared'
import { NOTIFICATION_ERRORS, NOTIFICATION_LEVELS } from '@dx3/models-shared'
import { TEST_EXISTING_USER_ID } from '@dx3/test-data'

import { getGlobalAuthHeaders } from '../../support/test-setup'

describe('v1 Notification Routes', () => {
  const idsToUpdate: string[] = []

  describe('POST /api/v1/notification/user', () => {
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
        url: '/api/v1/notification/user',
        withCredentials: true,
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(NOTIFICATION_ERRORS.SERVER_ERROR)
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
        url: '/api/v1/notification/user',
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

  describe('POST /api/v1/notification/all-users', () => {
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
        url: '/api/v1/notification/all-users',
        withCredentials: true,
      }
      // act
      try {
        expect(await axios.request(request)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual(NOTIFICATION_ERRORS.SERVER_ERROR)
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
        url: '/api/v1/notification/all-users',
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

  describe('POST /api/v1/notification/app-update', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'POST',
        url: '/api/v1/notification/app-update',
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('GET /api/v1/notification/badge-count/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/notification/badge-count/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('GET /api/v1/notification/user/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'GET',
        url: `/api/v1/notification/user/${TEST_EXISTING_USER_ID}`,
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

  describe('PUT /api/v1/notification/read-all/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/notification/read-all/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/v1/notification/viewed-all/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/notification/viewed-all/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/v1/notification/dismiss-all/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/notification/dismiss-all/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/v1/notification/dismiss/:id/:userId', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/notification/dismiss/${idsToUpdate[0]}/${TEST_EXISTING_USER_ID}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })

  describe('PUT /api/v1/notification/read/:id', () => {
    test('should return status 200 when successful', async () => {
      //arrange
      const request: AxiosRequestConfig = {
        headers: getGlobalAuthHeaders(),
        method: 'PUT',
        url: `/api/v1/notification/read/${idsToUpdate[1]}`,
        withCredentials: true,
      }

      // act
      const result = await axios.request(request)
      // assert
      expect(result).toBeDefined()
      expect(result.status).toEqual(200)
    })
  })
})
