import axios, { type AxiosError } from 'axios'

import { SUPPORT_CATEGORY, SUPPORT_STATUS } from '@dx3/models-shared'
import { TEST_USER_DATA } from '@dx3/test-data'

import { getAuthHeaders } from '../../support/test-setup'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Support Routes', () => {
  let createdRequestId: string

  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('POST /api/support — USER', () => {
    test('should return 403 for unauthenticated requests', async () => {
      try {
        expect(
          await axios.request({
            data: {
              category: SUPPORT_CATEGORY.ISSUE,
              message: 'Test message',
              subject: 'Test subject',
            },
            method: 'POST',
            url: '/api/support',
          }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(403)
      }
    })

    test('should return 400 when required fields are missing', async () => {
      try {
        expect(
          await axios.request({
            data: { category: SUPPORT_CATEGORY.ISSUE },
            headers: getAuthHeaders('user'),
            method: 'POST',
            url: '/api/support',
          }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect([400, 422]).toContain(typedError.response?.status)
      }
    })

    test('should create a support request for USER', async () => {
      const response = await axios.request({
        data: {
          category: SUPPORT_CATEGORY.ISSUE,
          message: 'E2E test support message',
          subject: 'E2E test support subject',
        },
        headers: getAuthHeaders('user'),
        method: 'POST',
        url: '/api/support',
      })
      expect(response.status).toBe(200)
      expect(response.data.id).toBeDefined()
      expect(response.data.category).toEqual(SUPPORT_CATEGORY.ISSUE)
      createdRequestId = response.data.id
    })
  })

  describe('GET /api/support/list — ADMIN', () => {
    test('should return 403 for USER', async () => {
      try {
        expect(
          await axios.request({
            headers: getAuthHeaders('user'),
            method: 'GET',
            url: '/api/support/list',
          }),
        ).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(401)
      }
    })

    test('should return paginated list for ADMIN', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('admin'),
        method: 'GET',
        url: '/api/support/list',
      })
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.rows)).toBe(true)
      expect(typeof response.data.count).toBe('number')
    })
  })

  describe('GET /api/support/unviewed-count — ADMIN', () => {
    test('should return count for ADMIN', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('admin'),
        method: 'GET',
        url: '/api/support/unviewed-count',
      })
      expect(response.status).toBe(200)
      expect(typeof response.data.count).toBe('number')
    })
  })

  describe('GET /api/support/user/:userId — ADMIN', () => {
    test('should return support requests for a user', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('admin'),
        method: 'GET',
        url: `/api/support/user/${TEST_USER_DATA.USER.id}`,
      })
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })
  })

  describe('GET /api/support/:id — ADMIN', () => {
    test('should return a single support request', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('admin'),
        method: 'GET',
        url: `/api/support/${createdRequestId}`,
      })
      expect(response.status).toBe(200)
      expect(response.data.id).toEqual(createdRequestId)
    })
  })

  describe('PUT /api/support/mark-all-viewed — ADMIN', () => {
    test('should mark all unviewed requests as viewed', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: '/api/support/mark-all-viewed',
      })
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })
  })

  describe('PUT /api/support/:id/viewed — ADMIN', () => {
    test('should mark a single request as viewed', async () => {
      const response = await axios.request({
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: `/api/support/${createdRequestId}/viewed`,
      })
      expect(response.status).toBe(200)
      expect(response.data.success).toBe(true)
    })
  })

  describe('PUT /api/support/:id/status — ADMIN', () => {
    test('should update the status of a support request', async () => {
      const response = await axios.request({
        data: { status: SUPPORT_STATUS.RESOLVED },
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: `/api/support/${createdRequestId}/status`,
      })
      expect(response.status).toBe(200)
      expect(response.data.id).toEqual(createdRequestId)
      expect(response.data.status).toEqual(SUPPORT_STATUS.RESOLVED)
    })
  })

  describe('PUT /api/support/bulk-status — ADMIN', () => {
    test('should bulk-update status for multiple requests', async () => {
      const response = await axios.request({
        data: { ids: [createdRequestId], status: SUPPORT_STATUS.CLOSED },
        headers: getAuthHeaders('admin'),
        method: 'PUT',
        url: '/api/support/bulk-status',
      })
      expect(response.status).toBe(200)
    })
  })
})
