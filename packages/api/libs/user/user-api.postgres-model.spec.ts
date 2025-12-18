import { ApiLoggingClass } from '../logger'
import { USER_ENTITY_POSTGRES_DB_NAME } from './user-api.consts'
import { UserModel } from './user-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('User Models', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  describe('UserModel', () => {
    it('should exist when imported', () => {
      // arrange
      // act
      // assert
      expect(UserModel).toBeDefined()
    })

    it('should have correct entity name constant', () => {
      expect(USER_ENTITY_POSTGRES_DB_NAME).toBeDefined()
    })
  })
})
