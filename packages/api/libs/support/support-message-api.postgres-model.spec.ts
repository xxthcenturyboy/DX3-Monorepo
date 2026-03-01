import { ApiLoggingClass } from '../logger'
import { SUPPORT_MESSAGE_POSTGRES_DB_NAME } from './support-api.consts'
import { SupportMessageModel } from './support-message-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../user/user-api.postgres-model')
jest.mock('./support-api.postgres-model')

describe('SupportMessageModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(SupportMessageModel).toBeDefined()
  })

  it('should have correct entity name constant', () => {
    expect(SUPPORT_MESSAGE_POSTGRES_DB_NAME).toBeDefined()
    expect(SUPPORT_MESSAGE_POSTGRES_DB_NAME).toBe('support_messages')
  })
})
