import type {
  CreateSupportRequestPayloadType,
  GetSupportRequestsListQueryType,
  GetSupportRequestsListResponseType,
  SupportRequestType,
  SupportRequestWithUserType,
  SupportUnviewedCountResponseType,
  UpdateSupportRequestStatusPayloadType,
} from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

const buildSupportListUrl = (params: GetSupportRequestsListQueryType): string => {
  const searchParams = new URLSearchParams()

  if (params.category !== undefined) {
    searchParams.append('category', params.category)
  }
  if (params.filterValue !== undefined) {
    searchParams.append('filterValue', params.filterValue)
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit))
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', String(params.offset))
  }
  if (params.openOnly !== undefined) {
    searchParams.append('openOnly', String(params.openOnly))
  }
  if (params.orderBy !== undefined) {
    searchParams.append('orderBy', params.orderBy)
  }
  if (params.sortDir !== undefined) {
    searchParams.append('sortDir', params.sortDir)
  }
  if (params.status !== undefined) {
    searchParams.append('status', params.status)
  }
  if (params.userId !== undefined) {
    searchParams.append('userId', params.userId)
  }

  const queryString = searchParams.toString()
  return queryString ? `/support/list?${queryString}` : '/support/list'
}

export const apiWebSupport = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    bulkUpdateSupportStatus: build.mutation<
      { success: boolean; updated: number },
      { ids: string[]; status: string }
    >({
      query: (payload) => ({
        data: payload,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: '/support/bulk-status',
      }),
    }),
    createSupportRequest: build.mutation<SupportRequestType, CreateSupportRequestPayloadType>({
      query: (payload) => ({
        data: payload,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: '/support',
      }),
    }),
    getSupportRequestById: build.query<SupportRequestWithUserType, string>({
      query: (id) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `/support/${encodeURIComponent(id)}`,
      }),
    }),
    getSupportRequestList: build.query<
      GetSupportRequestsListResponseType,
      GetSupportRequestsListQueryType
    >({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildSupportListUrl(params),
      }),
    }),
    getSupportRequestsByUserId: build.query<
      SupportRequestType[],
      { openOnly?: boolean; userId: string }
    >({
      query: ({ openOnly, userId }) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: `/support/user/${encodeURIComponent(userId)}${openOnly ? '?openOnly=true' : ''}`,
      }),
    }),
    getSupportUnviewedCount: build.query<SupportUnviewedCountResponseType, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/support/unviewed-count',
      }),
    }),
    markAllSupportAsViewed: build.mutation<{ success: boolean }, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: '/support/mark-all-viewed',
      }),
    }),
    markSupportAsViewed: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `/support/${encodeURIComponent(id)}/viewed`,
      }),
    }),
    updateSupportRequestStatus: build.mutation<
      SupportRequestType,
      { id: string; payload: UpdateSupportRequestStatusPayloadType }
    >({
      query: ({ id, payload }) => ({
        data: payload,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `/support/${encodeURIComponent(id)}/status`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useBulkUpdateSupportStatusMutation,
  useCreateSupportRequestMutation,
  useGetSupportRequestByIdQuery,
  useGetSupportRequestListQuery,
  useGetSupportRequestsByUserIdQuery,
  useGetSupportUnviewedCountQuery,
  useLazyGetSupportRequestByIdQuery,
  useLazyGetSupportRequestListQuery,
  useLazyGetSupportRequestsByUserIdQuery,
  useLazyGetSupportUnviewedCountQuery,
  useMarkAllSupportAsViewedMutation,
  useMarkSupportAsViewedMutation,
  useUpdateSupportRequestStatusMutation,
} = apiWebSupport

// Export individual endpoints for use in bootstrap
export const { getSupportUnviewedCount: fetchSupportUnviewedCount } = apiWebSupport.endpoints
