import { FeatureFlagAdminWebListService } from './feature-flag-admin-web-list.service'

const mockFlag = {
  description: 'Test feature description',
  enabled: true,
  id: 'flag-1',
  name: 'test_feature',
  percentage: null,
  status: 'ACTIVE',
  target: 'ALL',
} as never

describe('FeatureFlagAdminWebListService', () => {
  let service: FeatureFlagAdminWebListService

  beforeEach(() => {
    service = new FeatureFlagAdminWebListService()
  })

  describe('getListHeaders', () => {
    it('should return an array of table headers', () => {
      const headers = FeatureFlagAdminWebListService.getListHeaders()
      expect(Array.isArray(headers)).toBe(true)
    })

    it('should have required header properties', () => {
      const headers = FeatureFlagAdminWebListService.getListHeaders()
      expect(headers.length).toBeGreaterThan(0)
      for (const header of headers) {
        expect(header).toHaveProperty('fieldName')
        expect(header).toHaveProperty('title')
      }
    })
  })

  describe('getRows', () => {
    it('should return empty array for empty input', () => {
      const rows = service.getRows([])
      expect(rows).toEqual([])
    })

    it('should return one row per flag', () => {
      const rows = service.getRows([mockFlag, mockFlag])
      expect(rows).toHaveLength(2)
    })

    it('should include id in each row', () => {
      const rows = service.getRows([mockFlag])
      expect(rows[0]).toHaveProperty('id')
    })

    it('should include columns in each row', () => {
      const rows = service.getRows([mockFlag])
      expect(rows[0]).toHaveProperty('columns')
      expect(Array.isArray(rows[0].columns)).toBe(true)
    })
  })
})
