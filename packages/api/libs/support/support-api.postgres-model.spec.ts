import { ApiLoggingClass } from '../logger'
import { SUPPORT_REQUEST_POSTGRES_DB_NAME } from './support-api.consts'
import { SupportRequestModel } from './support-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../user/user-api.postgres-model')

describe('SupportRequestModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(SupportRequestModel).toBeDefined()
  })

  it('should have correct entity name constant', () => {
    expect(SUPPORT_REQUEST_POSTGRES_DB_NAME).toBeDefined()
    expect(SUPPORT_REQUEST_POSTGRES_DB_NAME).toBe('support_requests')
  })
})
