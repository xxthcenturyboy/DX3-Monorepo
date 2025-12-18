import { apiWeb } from '../data/rtk-query/web.api'

export const apiWebShortlink = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getShortlinkTarget: build.query<string, { id: string }>({
      query: (payload) => ({
        method: 'GET',
        url: `v1/shortlink/${payload.id}`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const { useLazyGetShortlinkTargetQuery } = apiWebShortlink
