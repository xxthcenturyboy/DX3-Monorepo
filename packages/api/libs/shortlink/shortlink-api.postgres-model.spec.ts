import { ApiLoggingClass } from '../logger'
import { ShortLinkModel } from './shortlink-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('ShortlinkModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  describe('ShortLinkModel', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(ShortLinkModel).toBeDefined()
    })
  })
})
