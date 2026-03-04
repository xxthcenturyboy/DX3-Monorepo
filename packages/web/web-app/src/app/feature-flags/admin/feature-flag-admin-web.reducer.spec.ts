import {
  featureFlagAdminActions,
  featureFlagAdminInitialState,
  featureFlagAdminReducer,
} from './feature-flag-admin-web.reducer'

describe('featureFlagAdminReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = featureFlagAdminReducer(undefined, { type: 'unknown' })
    expect(state).toEqual(featureFlagAdminInitialState)
  })

  it('should have correct initial state', () => {
    expect(featureFlagAdminInitialState).toEqual({
      filterValue: '',
      flags: [],
      flagsCount: 0,
      lastRoute: null,
      limit: 10,
      offset: 0,
      orderBy: 'name',
      selectedFlag: null,
      sortDir: 'ASC',
    })
  })

  describe('filterValueSet', () => {
    it('should set filterValue', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.filterValueSet('search'),
      )
      expect(state.filterValue).toBe('search')
    })
  })

  describe('flagsCountSet', () => {
    it('should set flagsCount', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.flagsCountSet(5),
      )
      expect(state.flagsCount).toBe(5)
    })
  })

  describe('flagsListSet', () => {
    it('should set flags array', () => {
      const mockFlag = { id: '1', name: 'feature_a' } as never
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.flagsListSet([mockFlag]),
      )
      expect(state.flags).toHaveLength(1)
    })
  })

  describe('lastRouteSet', () => {
    it('should set lastRoute', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.lastRouteSet('/sudo/feature-flags'),
      )
      expect(state.lastRoute).toBe('/sudo/feature-flags')
    })
  })

  describe('limitSet', () => {
    it('should set limit', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.limitSet(20),
      )
      expect(state.limit).toBe(20)
    })
  })

  describe('offsetSet', () => {
    it('should set offset', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.offsetSet(10),
      )
      expect(state.offset).toBe(10)
    })
  })

  describe('orderBySet', () => {
    it('should set orderBy', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.orderBySet('enabled'),
      )
      expect(state.orderBy).toBe('enabled')
    })
  })

  describe('selectedFlagSet', () => {
    it('should set selected flag', () => {
      const flag = { id: '1', name: 'test' } as never
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.selectedFlagSet(flag),
      )
      expect(state.selectedFlag).toBe(flag)
    })

    it('should clear selected flag to null', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.selectedFlagSet(null),
      )
      expect(state.selectedFlag).toBeNull()
    })
  })

  describe('sortDirSet', () => {
    it('should set sortDir to DESC', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.sortDirSet('DESC'),
      )
      expect(state.sortDir).toBe('DESC')
    })

    it('should set sortDir to ASC', () => {
      const state = featureFlagAdminReducer(
        featureFlagAdminInitialState,
        featureFlagAdminActions.sortDirSet('ASC'),
      )
      expect(state.sortDir).toBe('ASC')
    })
  })
})
