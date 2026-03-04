jest.mock('../admin/support-admin-list.service', () => ({
  SupportAdminWebListService: jest.fn().mockImplementation(() => ({
    getRows: jest.fn().mockReturnValue([]),
  })),
}))

jest.mock('../admin/user-support-requests-list.service', () => ({
  UserSupportRequestListService: jest.fn().mockImplementation(() => ({
    getRows: jest.fn().mockReturnValue([]),
  })),
}))

import { supportAdminInitialState } from './support-admin-web.reducer'
import {
  selectAllRowsSelected,
  selectHasUnviewedSelected,
  selectSupportRequestWithUserRowData,
  selectUserTabSupportRequestRowData,
} from './support-admin-web.selector'
import type { SupportAdminStateType } from '../support.types'

type MockRootState = {
  supportAdmin: SupportAdminStateType
}

const createMockState = (overrides: Partial<SupportAdminStateType> = {}): MockRootState => ({
  supportAdmin: { ...supportAdminInitialState, ...overrides },
})

describe('support-admin selectors', () => {
  describe('selectSupportRequestWithUserRowData', () => {
    it('should return array of row data', () => {
      const state = createMockState()
      const result = selectSupportRequestWithUserRowData(state as never)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('selectAllRowsSelected', () => {
    it('should return false when count is 0', () => {
      const state = createMockState({ supportRequestsWithUserCount: 0, selectedIds: [] })
      expect(selectAllRowsSelected(state as never)).toBe(false)
    })

    it('should return true when all rows are selected', () => {
      const state = createMockState({
        selectedIds: ['id1', 'id2'],
        supportRequestsWithUserCount: 2,
      })
      expect(selectAllRowsSelected(state as never)).toBe(true)
    })

    it('should return false when only some rows are selected', () => {
      const state = createMockState({
        selectedIds: ['id1'],
        supportRequestsWithUserCount: 3,
      })
      expect(selectAllRowsSelected(state as never)).toBe(false)
    })
  })

  describe('selectHasUnviewedSelected', () => {
    it('should return false when no selected ids', () => {
      const state = createMockState({ selectedIds: [] })
      expect(selectHasUnviewedSelected(state as never)).toBe(false)
    })

    it('should return true when selected request is unviewed', () => {
      const requests = [{ id: 'id1', viewedByAdmin: false }] as never[]
      const state = createMockState({
        selectedIds: ['id1'],
        supportRequestsWithUser: requests,
      })
      expect(selectHasUnviewedSelected(state as never)).toBe(true)
    })

    it('should return false when selected request is viewed', () => {
      const requests = [{ id: 'id1', viewedByAdmin: true }] as never[]
      const state = createMockState({
        selectedIds: ['id1'],
        supportRequestsWithUser: requests,
      })
      expect(selectHasUnviewedSelected(state as never)).toBe(false)
    })
  })

  describe('selectUserTabSupportRequestRowData', () => {
    it('should return array of row data', () => {
      const state = createMockState()
      const result = selectUserTabSupportRequestRowData(state as never)
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
