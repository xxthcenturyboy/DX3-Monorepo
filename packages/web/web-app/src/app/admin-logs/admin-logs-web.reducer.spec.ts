import { adminLogsActions, adminLogsInitialState, adminLogsReducer } from './admin-logs-web.reducer'

describe('adminLogsReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = adminLogsReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(adminLogsInitialState)
  })

  it('should have correct initial state shape', () => {
    expect(adminLogsInitialState).toEqual({
      eventTypeFilter: '',
      isAvailable: null,
      lastRoute: '',
      limit: 25,
      logs: [],
      logsCount: 0,
      offset: 0,
      orderBy: 'created_at',
      sortDir: 'DESC',
      successFilter: '',
    })
  })

  describe('eventTypeFilterSet', () => {
    it('should set eventTypeFilter', () => {
      const state = adminLogsReducer(
        adminLogsInitialState,
        adminLogsActions.eventTypeFilterSet('AUTH_SUCCESS'),
      )
      expect(state.eventTypeFilter).toBe('AUTH_SUCCESS')
    })

    it('should clear eventTypeFilter to empty string', () => {
      const loaded = {
        ...adminLogsInitialState,
        eventTypeFilter: 'AUTH_SUCCESS',
      } as typeof adminLogsInitialState
      const state = adminLogsReducer(loaded, adminLogsActions.eventTypeFilterSet(''))
      expect(state.eventTypeFilter).toBe('')
    })
  })

  describe('isAvailableSet', () => {
    it('should set isAvailable to true', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.isAvailableSet(true))
      expect(state.isAvailable).toBe(true)
    })

    it('should set isAvailable to false', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.isAvailableSet(false))
      expect(state.isAvailable).toBe(false)
    })

    it('should set isAvailable to null', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.isAvailableSet(null))
      expect(state.isAvailable).toBeNull()
    })
  })

  describe('lastRouteSet', () => {
    it('should set lastRoute', () => {
      const state = adminLogsReducer(
        adminLogsInitialState,
        adminLogsActions.lastRouteSet('/admin-logs'),
      )
      expect(state.lastRoute).toBe('/admin-logs')
    })
  })

  describe('limitSet', () => {
    it('should set limit', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.limitSet(50))
      expect(state.limit).toBe(50)
    })
  })

  describe('logsCountSet', () => {
    it('should set logsCount', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.logsCountSet(42))
      expect(state.logsCount).toBe(42)
    })
  })

  describe('logsSet', () => {
    it('should set logs array', () => {
      const mockLog = { id: '1' } as never
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.logsSet([mockLog]))
      expect(state.logs).toHaveLength(1)
      expect(state.logs[0]).toBe(mockLog)
    })

    it('should replace existing logs', () => {
      const withLogs = {
        ...adminLogsInitialState,
        logs: [{ id: '0' }],
      } as typeof adminLogsInitialState
      const state = adminLogsReducer(withLogs, adminLogsActions.logsSet([]))
      expect(state.logs).toHaveLength(0)
    })
  })

  describe('offsetSet', () => {
    it('should set offset', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.offsetSet(25))
      expect(state.offset).toBe(25)
    })
  })

  describe('orderBySet', () => {
    it('should set orderBy', () => {
      const state = adminLogsReducer(
        adminLogsInitialState,
        adminLogsActions.orderBySet('event_type'),
      )
      expect(state.orderBy).toBe('event_type')
    })
  })

  describe('sortDirSet', () => {
    it('should set sortDir to ASC', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.sortDirSet('ASC'))
      expect(state.sortDir).toBe('ASC')
    })

    it('should set sortDir to DESC', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.sortDirSet('DESC'))
      expect(state.sortDir).toBe('DESC')
    })
  })

  describe('successFilterSet', () => {
    it('should set successFilter to true', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.successFilterSet(true))
      expect(state.successFilter).toBe(true)
    })

    it('should set successFilter to empty string', () => {
      const state = adminLogsReducer(adminLogsInitialState, adminLogsActions.successFilterSet(''))
      expect(state.successFilter).toBe('')
    })
  })
})
