import type {
  FeatureFlagStatusType,
  FeatureFlagTargetType,
} from '@dx3/models-shared'

export type CreateFeatureFlagPayloadType = {
  description: string
  name: string
  percentage?: number
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}

export type UpdateFeatureFlagPayloadType = {
  description?: string
  id: string
  percentage?: number | null
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}
