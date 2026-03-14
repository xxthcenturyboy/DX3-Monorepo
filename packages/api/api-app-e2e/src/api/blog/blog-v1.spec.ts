import axios, { type AxiosError } from 'axios'

import { TEST_UUID } from '@dx3/test-data'

const errorLogSpyMock = jest.spyOn(console, 'error').mockImplementation(() => {})

describe('v1 Blog Routes (public)', () => {
  afterAll(() => {
    errorLogSpyMock.mockRestore()
  })

  describe('GET /api/blog/categories', () => {
    test('should return 200 with an array of categories', async () => {
      const response = await axios.get('/api/blog/categories')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })
  })

  describe('GET /api/blog/tags', () => {
    test('should return 200 with an array of tags', async () => {
      const response = await axios.get('/api/blog/tags')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })
  })

  describe('GET /api/blog/posts', () => {
    test('should return 200 with paginated posts', async () => {
      const response = await axios.get('/api/blog/posts')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.posts)).toBe(true)
    })

    test('should accept limit and cursor query params', async () => {
      const response = await axios.get('/api/blog/posts?limit=5')
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data.posts)).toBe(true)
    })
  })

  describe('GET /api/blog/posts/:slug', () => {
    test('should return 404 when slug does not exist', async () => {
      try {
        expect(await axios.get('/api/blog/posts/non-existent-slug-xyz')).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        expect(typedError.response?.status).toBe(404)
      }
    })
  })

  describe('GET /api/blog/posts/:id/related', () => {
    test('should return 200 with empty array for a non-existent post id', async () => {
      const response = await axios.get(`/api/blog/posts/${TEST_UUID}/related`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.data)).toBe(true)
    })
  })
})
