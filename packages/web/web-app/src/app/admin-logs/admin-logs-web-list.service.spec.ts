jest.mock('../store', () => ({
  store: {
    getState: jest.fn().mockReturnValue({
      i18n: {
        translations: {
          STATUS: 'Status',
          TIME: 'Time',
        },
      },
    }),
  },
}))

import { AdminLogsWebListService } from './admin-logs-web-list.service'

const mockLog = {
  appId: 'dx3',
  createdAt: '2024-01-15T10:30:00.000Z',
  eventType: 'USER_LOGIN',
  id: 'log-1',
  message: 'User logged in successfully',
  statusCode: 200,
  success: true,
  userId: 'user-abc',
} as never

describe('AdminLogsWebListService', () => {
  let service: AdminLogsWebListService

  beforeEach(() => {
    service = new AdminLogsWebListService()
  })

  describe('getListHeaders', () => {
    it('should return an array of table headers', () => {
      const headers = AdminLogsWebListService.getListHeaders()
      expect(Array.isArray(headers)).toBe(true)
    })

    it('should return headers with required fields', () => {
      const headers = AdminLogsWebListService.getListHeaders()
      expect(headers.length).toBeGreaterThan(0)
      for (const header of headers) {
        expect(header).toHaveProperty('fieldName')
        expect(header).toHaveProperty('title')
      }
    })
  })

  describe('getRows', () => {
    it('should return an empty array when given empty input', () => {
      const rows = service.getRows([])
      expect(rows).toEqual([])
    })

    it('should return an array with one row per log entry', () => {
      const rows = service.getRows([mockLog, mockLog])
      expect(rows).toHaveLength(2)
    })

    it('should include id in each row', () => {
      const rows = service.getRows([mockLog])
      expect(rows[0]).toHaveProperty('id')
    })

    it('should include columns array in each row', () => {
      const rows = service.getRows([mockLog])
      expect(rows[0]).toHaveProperty('columns')
      expect(Array.isArray(rows[0].columns)).toBe(true)
    })

    it('should have at least one column per row', () => {
      const rows = service.getRows([mockLog])
      expect(rows[0].columns.length).toBeGreaterThan(0)
    })
  })
})
