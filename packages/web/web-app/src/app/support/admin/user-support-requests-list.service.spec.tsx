jest.mock('../../store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn().mockReturnValue({
      i18n: { translations: {} },
      supportAdmin: { selectedIds: [] },
    }),
  },
}))

import { UserSupportRequestListService } from './user-support-requests-list.service'

const mockRequest = {
  category: 'question',
  createdAt: '2024-01-15T10:00:00.000Z',
  id: 'req-2',
  message: 'I have a question',
  status: 'open',
  subject: 'My Test Question',
  updatedAt: '2024-01-15T10:00:00.000Z',
  userId: 'u1',
} as never

describe('UserSupportRequestListService', () => {
  let service: UserSupportRequestListService

  beforeEach(() => {
    service = new UserSupportRequestListService()
  })

  describe('getListHeaders', () => {
    it('should return an array of table headers', () => {
      const headers = UserSupportRequestListService.getListHeaders()
      expect(Array.isArray(headers)).toBe(true)
    })

    it('should return headers with required fieldName property', () => {
      const headers = UserSupportRequestListService.getListHeaders()
      expect(headers.length).toBeGreaterThan(0)
      for (const header of headers) {
        expect(header).toHaveProperty('fieldName')
      }
    })
  })

  describe('getRows', () => {
    it('should return empty array for empty input', () => {
      const rows = service.getRows([])
      expect(rows).toEqual([])
    })

    it('should return one row per request', () => {
      const rows = service.getRows([mockRequest])
      expect(rows).toHaveLength(1)
    })

    it('should include id in each row', () => {
      const rows = service.getRows([mockRequest])
      expect(rows[0]).toHaveProperty('id')
    })

    it('should include columns in each row', () => {
      const rows = service.getRows([mockRequest])
      expect(rows[0]).toHaveProperty('columns')
    })
  })
})
