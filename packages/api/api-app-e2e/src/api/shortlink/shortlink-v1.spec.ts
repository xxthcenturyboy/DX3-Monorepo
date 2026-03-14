import axios from 'axios'

describe('v1 Shortlink Routes', () => {
  describe('GET /api/shortlink', () => {
    test('should return null when queried with a non-existent link', async () => {
      const response = await axios.get(`/api/shortlink/test-id-not-valid`)
      expect(response.status).toBe(200)
      expect(response.data).toBeFalsy()
    })
  })
})
