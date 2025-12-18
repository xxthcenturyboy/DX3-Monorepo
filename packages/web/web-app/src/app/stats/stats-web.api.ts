import type { HealthzStatusType } from '@dx3/models-shared'

import { apiWeb } from '../data/rtk-query/web.api'

export const apiStatsWebHealth = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getApiHealthz: build.query<HealthzStatusType, void>({
      query: () => ({
        method: 'GET',
        url: 'healthz/h',
      }),
    }),
  }),
  overrideExisting: true,
})

export const { useLazyGetApiHealthzQuery } = apiStatsWebHealth
