import {
  SUPPORT_MESSAGE_POSTGRES_DB_NAME,
  SUPPORT_REQUEST_POSTGRES_DB_NAME,
} from './support-api.consts'

describe('support-api.consts', () => {
  describe('SUPPORT_REQUEST_POSTGRES_DB_NAME', () => {
    it('should be defined', () => {
      expect(SUPPORT_REQUEST_POSTGRES_DB_NAME).toBeDefined()
    })

    it('should equal "support_requests"', () => {
      expect(SUPPORT_REQUEST_POSTGRES_DB_NAME).toBe('support_requests')
    })
  })

  describe('SUPPORT_MESSAGE_POSTGRES_DB_NAME', () => {
    it('should be defined', () => {
      expect(SUPPORT_MESSAGE_POSTGRES_DB_NAME).toBeDefined()
    })

    it('should equal "support_messages"', () => {
      expect(SUPPORT_MESSAGE_POSTGRES_DB_NAME).toBe('support_messages')
    })
  })
})
