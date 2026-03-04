import { adminLogsInitialState } from './admin-logs-web.reducer'
import { selectAdminLogsState, selectLogsListData } from './admin-logs-web.selectors'
import type { AdminLogsStateType } from './admin-logs-web.types'

jest.mock('../store', () => ({
  store: { getState: jest.fn().mockReturnValue({ i18n: { translations: {} } }) },
}))

jest.mock('../store/store-web.redux', () => ({
  store: { getState: jest.fn().mockReturnValue({ i18n: { translations: {} } }) },
}))

jest.mock('./admin-logs-web-list.service', () => ({
  AdminLogsWebListService: jest.fn().mockImplementation(() => ({
    getRows: jest.fn().mockReturnValue([]),
  })),
}))

type MockRootState = {
  adminLogs: AdminLogsStateType
}

const createMockState = (overrides: Partial<AdminLogsStateType> = {}): MockRootState => ({
  adminLogs: {
    ...adminLogsInitialState,
    ...overrides,
  },
})

describe('admin-logs selectors', () => {
  describe('selectAdminLogsState', () => {
    it('should return the adminLogs slice', () => {
      const state = createMockState({ limit: 50 })
      const result = selectAdminLogsState(state as never)
      expect(result.limit).toBe(50)
    })

    it('should return initial state when no overrides', () => {
      const state = createMockState()
      const result = selectAdminLogsState(state as never)
      expect(result).toEqual(adminLogsInitialState)
    })
  })

  describe('selectLogsListData', () => {
    it('should return row data from logs', () => {
      const state = createMockState({ logs: [] })
      const result = selectLogsListData(state as never)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should be defined', () => {
      const state = createMockState()
      const result = selectLogsListData(state as never)
      expect(result).toBeDefined()
    })
  })
})
