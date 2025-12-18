import { AxiosInstance, axiosBaseQuery } from './axios-web.api'

jest.mock('../../store')
jest.mock('.')

describe('axios-web.api', () => {
  describe('AxiosInstance', () => {
    it('should exist when imported', () => {
      // Arrange
      // Act
      // console.log(AxiosInstance({ headers: {} }));
      // Assert
      expect(AxiosInstance).toBeDefined()
    })
  })

  describe('axiosBaseQuery', () => {
    it('should exist when imported', () => {
      // Arrange
      // Act
      // console.log(axiosBaseQuery({ baseUrl: 'test' })({
      //   url: 'test/url',
      //   method: 'POST',
      //   data: {},
      //   params: {},
      //   headers: {},
      //   uploadProgressHandler: () => null
      // }));
      // Assert
      expect(axiosBaseQuery).toBeDefined()
    })
  })
})
