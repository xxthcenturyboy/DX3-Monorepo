import type {
  GetLogsQueryType,
  GetLogsResponseType,
  LogEntryType,
  LogsStatsResponseType,
} from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

type AdminLogsStatusResponseType = {
  isAvailable: boolean
  message: string
}

const buildAdminLogsUrl = (params: GetLogsQueryType): string => {
  const searchParams = new URLSearchParams()

  if (params.appId !== undefined) {
    searchParams.append('appId', params.appId)
  }
  if (params.endDate !== undefined) {
    searchParams.append('endDate', params.endDate)
  }
  if (params.eventType !== undefined) {
    searchParams.append('eventType', params.eventType)
  }
  if (params.limit !== undefined) {
    searchParams.append('limit', String(params.limit))
  }
  if (params.offset !== undefined) {
    searchParams.append('offset', String(params.offset))
  }
  if (params.orderBy !== undefined) {
    searchParams.append('orderBy', params.orderBy)
  }
  if (params.sortDir !== undefined) {
    searchParams.append('sortDir', params.sortDir)
  }
  if (params.startDate !== undefined) {
    searchParams.append('startDate', params.startDate)
  }
  if (params.success !== undefined) {
    searchParams.append('success', String(params.success))
  }
  if (params.userId !== undefined) {
    searchParams.append('userId', params.userId)
  }

  const queryString = searchParams.toString()
  return queryString ? `/admin-logs?${queryString}` : '/admin-logs'
}

export const apiWebAdminLogs = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getAdminLogs: build.query<GetLogsResponseType, GetLogsQueryType>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildAdminLogsUrl(params),
      }),
    }),
    getAdminLogsRecentErrors: build.query<
      LogEntryType[],
      { appId?: string; limit?: number; minutesBack?: number }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.appId) searchParams.append('appId', params.appId)
        if (params.limit) searchParams.append('limit', String(params.limit))
        if (params.minutesBack) searchParams.append('minutesBack', String(params.minutesBack))
        const queryString = searchParams.toString()
        return {
          headers: getCustomHeaders({ version: 1 }),
          method: 'GET',
          url: queryString ? `/admin-logs/errors?${queryString}` : '/admin-logs/errors',
        }
      },
    }),
    getAdminLogsStats: build.query<LogsStatsResponseType, { appId?: string; daysBack?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.appId) searchParams.append('appId', params.appId)
        if (params.daysBack) searchParams.append('daysBack', String(params.daysBack))
        const queryString = searchParams.toString()
        return {
          headers: getCustomHeaders({ version: 1 }),
          method: 'GET',
          url: queryString ? `/admin-logs/stats?${queryString}` : '/admin-logs/stats',
        }
      },
    }),
    getAdminLogsStatus: build.query<AdminLogsStatusResponseType, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/admin-logs/status',
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAdminLogsQuery,
  useGetAdminLogsRecentErrorsQuery,
  useGetAdminLogsStatsQuery,
  useGetAdminLogsStatusQuery,
  useLazyGetAdminLogsQuery,
  useLazyGetAdminLogsRecentErrorsQuery,
  useLazyGetAdminLogsStatsQuery,
  useLazyGetAdminLogsStatusQuery,
} = apiWebAdminLogs
