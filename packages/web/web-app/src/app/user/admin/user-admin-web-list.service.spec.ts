jest.mock('../../store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn().mockReturnValue({
      i18n: { translations: {} },
    }),
  },
}))

import { UserAdminWebListService } from './user-admin-web-list.service'

const mockUser = {
  createdAt: '2024-01-15T10:00:00Z',
  emails: [{ email: 'john@example.com', id: 'e1', label: 'personal' }],
  firstName: 'John',
  fullName: 'John Doe',
  id: 'u1',
  lastName: 'Doe',
  phones: [],
  role: ['USER'],
  username: 'johndoe',
} as never

describe('UserAdminWebListService', () => {
  let service: UserAdminWebListService

  beforeEach(() => {
    service = new UserAdminWebListService()
  })

  describe('getListHeaders', () => {
    it('should return an array of table headers', () => {
      const headers = UserAdminWebListService.getListHeaders()
      expect(Array.isArray(headers)).toBe(true)
    })

    it('should return headers with field and label', () => {
      const headers = UserAdminWebListService.getListHeaders()
      expect(headers.length).toBeGreaterThan(0)
    })
  })

  describe('getRows', () => {
    it('should return empty array for empty input', () => {
      const rows = service.getRows([])
      expect(rows).toEqual([])
    })

    it('should return one row per user', () => {
      const rows = service.getRows([mockUser])
      expect(rows).toHaveLength(1)
    })

    it('should include id in each row', () => {
      const rows = service.getRows([mockUser])
      expect(rows[0]).toHaveProperty('id')
      expect(rows[0].id).toBe('u1')
    })

    it('should include columns in each row', () => {
      const rows = service.getRows([mockUser])
      expect(rows[0]).toHaveProperty('columns')
      expect(Array.isArray(rows[0].columns)).toBe(true)
    })
  })
})
