import {
  supportAdminActions,
  supportAdminInitialState,
  supportAdminReducer,
  supportAdminUserTabInitialState,
} from './support-admin-web.reducer'

describe('supportAdminReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = supportAdminReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(supportAdminInitialState)
  })

  it('should have correct initial state shape', () => {
    expect(supportAdminInitialState.categoryFilter).toBe('')
    expect(supportAdminInitialState.filterValue).toBe('')
    expect(supportAdminInitialState.selectedIds).toEqual([])
    expect(supportAdminInitialState.supportRequestsWithUser).toEqual([])
    expect(supportAdminInitialState.userTab).toEqual(supportAdminUserTabInitialState)
  })

  describe('categoryFilterSet', () => {
    it('should set categoryFilter', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.categoryFilterSet('issue'),
      )
      expect(state.categoryFilter).toBe('issue')
    })

    it('should clear categoryFilter', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.categoryFilterSet(''),
      )
      expect(state.categoryFilter).toBe('')
    })
  })

  describe('filterValueSet', () => {
    it('should set filterValue', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.filterValueSet('test'),
      )
      expect(state.filterValue).toBe('test')
    })
  })

  describe('limitSet', () => {
    it('should set limit', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.limitSet(50),
      )
      expect(state.limit).toBe(50)
    })
  })

  describe('offsetSet', () => {
    it('should set offset', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.offsetSet(25),
      )
      expect(state.offset).toBe(25)
    })
  })

  describe('sortDirSet', () => {
    it('should set sortDir to ASC', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.sortDirSet('ASC'),
      )
      expect(state.sortDir).toBe('ASC')
    })
  })

  describe('statusFilterSet', () => {
    it('should set statusFilter', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.statusFilterSet('open'),
      )
      expect(state.statusFilter).toBe('open')
    })
  })

  describe('listWithUserSet', () => {
    it('should set supportRequestsWithUser', () => {
      const requests = [{ id: 'r1' }] as never[]
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.listWithUserSet(requests),
      )
      expect(state.supportRequestsWithUser).toHaveLength(1)
    })
  })

  describe('setSelectedIds', () => {
    it('should set selected ids', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.setSelectedIds(['id1', 'id2']),
      )
      expect(state.selectedIds).toEqual(['id1', 'id2'])
    })
  })

  describe('resetFilters', () => {
    it('should reset filters to empty values', () => {
      const modified = {
        ...supportAdminInitialState,
        categoryFilter: 'issue' as never,
        filterValue: 'test',
        offset: 50,
        statusFilter: 'open' as never,
      }
      const state = supportAdminReducer(modified, supportAdminActions.resetFilters())
      expect(state.categoryFilter).toBe('')
      expect(state.filterValue).toBe('')
      expect(state.offset).toBe(0)
      expect(state.statusFilter).toBe('')
    })
  })

  describe('updateRequestViewed', () => {
    it('should mark a request as viewed', () => {
      const requests = [
        { id: 'r1', viewedByAdmin: false },
        { id: 'r2', viewedByAdmin: false },
      ] as never[]
      const modified = { ...supportAdminInitialState, supportRequestsWithUser: requests }
      const state = supportAdminReducer(modified, supportAdminActions.updateRequestViewed('r1'))
      expect(state.supportRequestsWithUser[0].viewedByAdmin).toBe(true)
      expect(state.supportRequestsWithUser[1].viewedByAdmin).toBe(false)
    })

    it('should do nothing when id is not found', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.updateRequestViewed('nonexistent'),
      )
      expect(state.supportRequestsWithUser).toHaveLength(0)
    })
  })

  describe('userTab actions', () => {
    it('should set userTab filterOpenOnly', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.userTabFilterOpenOnlySet(false),
      )
      expect(state.userTab.filterOpenOnly).toBe(false)
    })

    it('should set userTab userId', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.userTabUserIdSet('user-abc'),
      )
      expect(state.userTab.userId).toBe('user-abc')
    })

    it('should set userTab limit', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.userTabLimitSet(20),
      )
      expect(state.userTab.limit).toBe(20)
    })

    it('should reset userTab to initial values', () => {
      const modified = {
        ...supportAdminInitialState,
        userTab: { ...supportAdminUserTabInitialState, userId: 'user-123', limit: 99 },
      }
      const state = supportAdminReducer(modified, supportAdminActions.userTabReset())
      expect(state.userTab).toEqual(supportAdminUserTabInitialState)
    })

    it('should set userTab supportRequestsCount', () => {
      const state = supportAdminReducer(
        supportAdminInitialState,
        supportAdminActions.userTabSupportRequestsCountSet(15),
      )
      expect(state.userTab.supportRequestsCount).toBe(15)
    })
  })
})
