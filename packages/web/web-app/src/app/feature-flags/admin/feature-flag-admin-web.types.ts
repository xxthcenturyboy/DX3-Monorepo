import type { FeatureFlagType } from '@dx3/models-shared'

export type FeatureFlagAdminStateType = {
  filterValue: string
  flags: FeatureFlagType[]
  flagsCount: number
  lastRoute: string | null
  limit: number
  offset: number
  orderBy: string
  selectedFlag: FeatureFlagType | null
  sortDir: 'ASC' | 'DESC'
}
