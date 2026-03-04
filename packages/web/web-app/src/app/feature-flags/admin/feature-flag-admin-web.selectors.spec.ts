jest.mock('./feature-flag-admin-web-list.service', () => ({
  FeatureFlagAdminWebListService: jest.fn().mockImplementation(() => ({
    getRows: jest.fn().mockReturnValue([]),
  })),
}))

import { featureFlagAdminInitialState } from './feature-flag-admin-web.reducer'
import {
  selectAdminFlagsFormatted,
  selectAdminFlagsListData,
} from './feature-flag-admin-web.selectors'
import type { FeatureFlagAdminStateType } from './feature-flag-admin-web.types'

type MockRootState = {
  featureFlagsAdmin: FeatureFlagAdminStateType
}

const createMockState = (overrides: Partial<FeatureFlagAdminStateType> = {}): MockRootState => ({
  featureFlagsAdmin: { ...featureFlagAdminInitialState, ...overrides },
})

describe('feature-flag-admin selectors', () => {
  describe('selectAdminFlagsFormatted', () => {
    it('should return empty array when no flags', () => {
      const state = createMockState()
      expect(selectAdminFlagsFormatted(state as never)).toEqual([])
    })

    it('should sort flags alphabetically by name', () => {
      const flags = [
        { id: '2', name: 'z_feature' },
        { id: '1', name: 'a_feature' },
      ] as never[]
      const state = createMockState({ flags })
      const result = selectAdminFlagsFormatted(state as never)
      expect(result[0].name).toBe('a_feature')
      expect(result[1].name).toBe('z_feature')
    })

    it('should not mutate the original array', () => {
      const flags = [
        { id: '2', name: 'z_feature' },
        { id: '1', name: 'a_feature' },
      ] as never[]
      const state = createMockState({ flags })
      selectAdminFlagsFormatted(state as never)
      expect(state.featureFlagsAdmin.flags[0].name).toBe('z_feature')
    })
  })

  describe('selectAdminFlagsListData', () => {
    it('should return table row data', () => {
      const state = createMockState()
      const result = selectAdminFlagsListData(state as never)
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
