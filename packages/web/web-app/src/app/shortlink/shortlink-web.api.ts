import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

export const apiWebShortlink = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getShortlinkTarget: build.query<string, { id: string }>({
      query: (payload) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `shortlink/${payload.id}`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const { useLazyGetShortlinkTargetQuery } = apiWebShortlink
