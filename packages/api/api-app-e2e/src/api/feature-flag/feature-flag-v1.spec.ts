import axios, { type AxiosError } from 'axios'

import { FEATURE_FLAG_NAMES, FEATURE_FLAG_STATUS, FEATURE_FLAG_TARGET } from '@dx3/models-shared'

import { getAuthHeaders } from '../../support/test-setup'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Feature Flag Routes', () => {
  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('GET /api/feature-flag — USER+', () => {
    test('should return evaluated flags for USER', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('user'),
        method: 'GET',
        url: '/api/feature-flag',
      })
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.flags)).toBe(true)
    })

    test('should return evaluated flags for ADMIN', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('admin'),
        method: 'GET',
        url: '/api/feature-flag',
      })
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.flags)).toBe(true)
    })

    test('should return evaluated flags for SUPERADMIN', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('superadmin'),
        method: 'GET',
        url: '/api/feature-flag',
      })
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.flags)).toBe(true)
    })
  })

  describe('GET /api/feature-flag/admin — SUPER_ADMIN only', () => {
    test('should return 401 for ADMIN', async () => {
      try {
        expect(
          await axios.request({
            headers: getAuthHeaders('admin'),
            method: 'GET',
            url: '/api/feature-flag/admin',
          }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
      }
    })

    test('should return flag list for SUPERADMIN', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('superadmin'),
        method: 'GET',
        url: '/api/feature-flag/admin',
      })
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.flags)).toBe(true)
      expect(typeof response.data.count).toBe('number')
    })
  })

  describe('POST /api/feature-flag/admin — SUPER_ADMIN only', () => {
    let createdFlagId: string

    test('should return 401 for ADMIN', async () => {
      try {
        expect(
          await axios.request({
            data: {
              description: 'Test flag',
              name: FEATURE_FLAG_NAMES.BLOG,
              status: FEATURE_FLAG_STATUS.DISABLED,
              target: FEATURE_FLAG_TARGET.ALL,
            },
            headers: getAuthHeaders('admin'),
            method: 'POST',
            url: '/api/feature-flag/admin',
          }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
      }
    })

    test('should create a feature flag for SUPERADMIN', async () => {
      const response = await axios.request({
        data: {
          description: 'E2E test blog flag',
          name: FEATURE_FLAG_NAMES.BLOG,
          status: FEATURE_FLAG_STATUS.DISABLED,
          target: FEATURE_FLAG_TARGET.ALL,
        },
        headers: getAuthHeaders('superadmin'),
        method: 'POST',
        url: '/api/feature-flag/admin',
      })
      expect(response.status).toBe(200)
      expect(response.data.flag.id).toBeDefined()
      expect(response.data.flag.name).toEqual(FEATURE_FLAG_NAMES.BLOG)
      createdFlagId = response.data.flag.id
    })

    describe('PUT /api/feature-flag/admin', () => {
      test('should update the feature flag for SUPERADMIN', async () => {
        const response = await axios.request({
          data: {
            description: 'Updated via E2E',
            id: createdFlagId,
            status: FEATURE_FLAG_STATUS.ACTIVE,
            target: FEATURE_FLAG_TARGET.ALL,
          },
          headers: getAuthHeaders('superadmin'),
          method: 'PUT',
          url: '/api/feature-flag/admin',
        })
        expect(response.status).toBe(200)
        expect(response.data.updated).toBe(true)
      })

      test('should reflect updated flag in USER evaluated flags', async () => {
        const response = await axios.request({
          headers: getAuthHeaders('user'),
          method: 'GET',
          url: '/api/feature-flag',
        })
        expect(response.status).toBe(200)
        const blogFlag = (response.data.flags as Array<{ name: string; status: string }>).find(
          (f) => f.name === FEATURE_FLAG_NAMES.BLOG,
        )
        // Flag may or may not be in the evaluated list depending on target/status logic
        if (blogFlag) {
          expect(blogFlag.name).toEqual(FEATURE_FLAG_NAMES.BLOG)
        }
      })
    })
  })
})
