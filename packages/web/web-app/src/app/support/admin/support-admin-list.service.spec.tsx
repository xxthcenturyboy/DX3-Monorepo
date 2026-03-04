jest.mock('../../store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn().mockReturnValue({
      i18n: { translations: {} },
      supportAdmin: { selectedIds: [] },
    }),
  },
}))

import { SupportAdminWebListService } from './support-admin-list.service'

const mockSupportRequest = {
  category: 'issue',
  createdAt: '2024-01-15T10:00:00.000Z',
  id: 'req-1',
  message: 'I have an issue',
  status: 'open',
  subject: 'Test Support Subject',
  updatedAt: '2024-01-15T10:00:00.000Z',
  user: { id: 'u1', username: 'johndoe' },
  userDisplayName: 'John Doe',
  userId: 'u1',
  viewedByAdmin: false,
} as never

describe('SupportAdminWebListService', () => {
  let service: SupportAdminWebListService

  beforeEach(() => {
    service = new SupportAdminWebListService()
  })

  describe('getListHeaders', () => {
    it('should return an array of table headers', () => {
      const headers = SupportAdminWebListService.getListHeaders()
      expect(Array.isArray(headers)).toBe(true)
    })

    it('should have required header fieldName and title properties', () => {
      const headers = SupportAdminWebListService.getListHeaders()
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
      const rows = service.getRows([mockSupportRequest])
      expect(rows).toHaveLength(1)
    })

    it('should include id in each row', () => {
      const rows = service.getRows([mockSupportRequest])
      expect(rows[0]).toHaveProperty('id')
      expect(rows[0].id).toBe('req-1')
    })

    it('should include columns in each row', () => {
      const rows = service.getRows([mockSupportRequest])
      expect(rows[0]).toHaveProperty('columns')
      expect(Array.isArray(rows[0].columns)).toBe(true)
    })
  })
})
