import { ApiLoggingClass } from '../logger'
import { UserPrivilegeService } from './user-privilege-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('UserPrivilegeSetCache', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(UserPrivilegeService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const service = new UserPrivilegeService()
    // assert
    expect(service).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new UserPrivilegeService()
    // assert
    expect(service.getAllPrivilegeSets).toBeDefined()
    expect(service.updatePrivilegeSet).toBeDefined()
  })
})
