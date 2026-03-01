import { ApiLoggingClass } from '../logger'
import { USER_PRIVILEGES_POSTGRES_DB_NAME } from './user-privilege-api.consts'
import { UserPrivilegeSetModel } from './user-privilege-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('UserPrivilegeSetModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(UserPrivilegeSetModel).toBeDefined()
  })

  it('should have correct entity name constant', () => {
    expect(USER_PRIVILEGES_POSTGRES_DB_NAME).toBeDefined()
    expect(USER_PRIVILEGES_POSTGRES_DB_NAME).toBe('user_privileges')
  })
})
