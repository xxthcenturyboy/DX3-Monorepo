import { apiWeb } from './web.api'

jest.mock('.')
jest.mock('../../store')

describe('web.api', () => {
  describe('apiWeb', () => {
    it('should exist when imported', () => {
      // Arrange
      // Act
      // console.log(apiWeb);
      // Assert
      expect(apiWeb).toBeDefined()
    })
  })
})
