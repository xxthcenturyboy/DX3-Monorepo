import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  type FeatureFlagStatusType,
  type FeatureFlagTargetType,
  type FeatureFlagType,
  type GetFeatureFlagsListQueryType,
  type GetFeatureFlagsListResponseType,
} from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../../data/rtk-query/web.api'

type CreateFlagPayloadType = {
  description: string
  name: string
  percentage?: number
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}

type UpdateFlagPayloadType = {
  description?: string
  id: string
  percentage?: number | null
  status?: FeatureFlagStatusType
  target?: FeatureFlagTargetType
}

const buildFeatureFlagAdminListUrl = (params: GetFeatureFlagsListQueryType): string => {
  const limit = params.limit !== undefined ? params.limit : DEFAULT_LIMIT
  const offset = params.offset !== undefined ? params.offset : DEFAULT_OFFSET

  let url = `/feature-flag/admin?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`

  if (params.orderBy !== undefined && params.sortDir !== undefined) {
    url += `&orderBy=${encodeURIComponent(params.orderBy)}&sortDir=${encodeURIComponent(params.sortDir)}`
  }
  if (params.filterValue !== undefined) {
    url += `&filterValue=${encodeURIComponent(params.filterValue)}`
  }

  return url
}

export const featureFlagAdminApi = apiWeb.injectEndpoints({
  endpoints: (builder) => ({
    createFeatureFlag: builder.mutation<{ flag: FeatureFlagType }, CreateFlagPayloadType>({
      query: (body) => ({
        data: body,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: '/feature-flag/admin',
      }),
    }),
    getAdminFeatureFlags: builder.query<
      GetFeatureFlagsListResponseType,
      GetFeatureFlagsListQueryType
    >({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildFeatureFlagAdminListUrl(params),
      }),
    }),
    updateFeatureFlag: builder.mutation<{ updated: boolean }, UpdateFlagPayloadType>({
      query: (body) => ({
        data: body,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: '/feature-flag/admin',
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useCreateFeatureFlagMutation,
  useGetAdminFeatureFlagsQuery,
  useLazyGetAdminFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
} = featureFlagAdminApi
