import type { FeatureFlagsResponseType } from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

export const featureFlagsApi = apiWeb.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureFlags: builder.query<FeatureFlagsResponseType, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/feature-flag',
      }),
    }),
  }),
})

export const fetchFeatureFlags = featureFlagsApi.endpoints.getFeatureFlags

export const { useGetFeatureFlagsQuery, useLazyGetFeatureFlagsQuery } = featureFlagsApi
