import { ApiLoggingClass } from '../logger'
import { EmailService } from './email-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('EmailService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    // arrange
    // act
    // assert
    expect(EmailService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    // arrange
    // act
    const service = new EmailService()
    // assert
    expect(service).toBeDefined()
  })

  it('should have all methods', () => {
    // arrange
    // act
    const service = new EmailService()
    // assert
    expect(service.createEmail).toBeDefined()
    expect(service.deleteEmail).toBeDefined()
    expect(service.updateEmail).toBeDefined()
  })
})
