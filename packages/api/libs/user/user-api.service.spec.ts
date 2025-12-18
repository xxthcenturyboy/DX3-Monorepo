import { ApiLoggingClass } from '../logger'
import { UserService } from './user-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('UserService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(UserService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const service = new UserService()
    // assert
    expect(service).toBeDefined()
  })

  it('should exist have the correct methods', () => {
    // arrange
    // act
    const service = new UserService()
    // assert
    expect(service.createUser).toBeDefined()
    expect(service.deleteUser).toBeDefined()
    expect(service.getProfile).toBeDefined()
    expect(service.getUser).toBeDefined()
    expect(service.getUserList).toBeDefined()
    expect(service.sendOtpCode).toBeDefined()
    expect(service.updatePassword).toBeDefined()
    expect(service.updateUser).toBeDefined()
  })
})
