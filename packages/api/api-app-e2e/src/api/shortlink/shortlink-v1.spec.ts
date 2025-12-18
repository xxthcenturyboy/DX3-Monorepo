import axios, { type AxiosError } from 'axios'

describe('v1 Shortlink Routes', () => {
  describe('GET /api/v1/shortlink', () => {
    test('should return error when queried with a non-existent link', async () => {
      // arrange
      const url = `/api/v1/shortlink/test-id-not-valid`
      // act
      // assert
      try {
        expect(await axios.get(url)).toThrow()
      } catch (err) {
        const typedError = err as AxiosError
        // console.log('got error', typedError);
        // assert
        expect(typedError.response.status).toBe(400)
        // @ts-expect-error - type is bad
        expect(typedError.response.data.message).toEqual('No target for this url.')
      }
    })
  })
})
