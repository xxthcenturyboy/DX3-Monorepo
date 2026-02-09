import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'
import type { MetricsDateRangeType } from './admin-metrics-web.consts'
import type {
  MetricsFeatureUsageType,
  MetricsGrowthDataType,
  MetricsSignupsByMethodType,
  MetricsStatusType,
  MetricsTimeSeriesPointType,
} from './admin-metrics-web.types'

type MetricsQueryParams = {
  appId?: string
  range?: MetricsDateRangeType
}

const buildMetricsUrl = (endpoint: string, params?: MetricsQueryParams): string => {
  const searchParams = new URLSearchParams()

  if (params?.appId) {
    searchParams.append('appId', params.appId)
  }
  if (params?.range) {
    searchParams.append('range', params.range)
  }

  const queryString = searchParams.toString()
  return queryString ? `/metrics/${endpoint}?${queryString}` : `/metrics/${endpoint}`
}

export const apiWebAdminMetrics = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getMetricsDAU: build.query<MetricsTimeSeriesPointType[], MetricsQueryParams>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildMetricsUrl('dau', params),
      }),
    }),
    getMetricsFeatures: build.query<MetricsFeatureUsageType[], MetricsQueryParams>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildMetricsUrl('features', params),
      }),
    }),
    getMetricsGrowth: build.query<MetricsGrowthDataType, MetricsQueryParams>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildMetricsUrl('growth', params),
      }),
    }),
    getMetricsMAU: build.query<MetricsTimeSeriesPointType[], MetricsQueryParams>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildMetricsUrl('mau', params),
      }),
    }),
    getMetricsSignups: build.query<MetricsSignupsByMethodType[], MetricsQueryParams>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildMetricsUrl('signups', params),
      }),
    }),
    getMetricsStatus: build.query<MetricsStatusType, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/metrics/status',
      }),
    }),
    getMetricsWAU: build.query<MetricsTimeSeriesPointType[], MetricsQueryParams>({
      query: (params) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: buildMetricsUrl('wau', params),
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetMetricsDAUQuery,
  useGetMetricsFeaturesQuery,
  useGetMetricsGrowthQuery,
  useGetMetricsMAUQuery,
  useGetMetricsSignupsQuery,
  useGetMetricsStatusQuery,
  useGetMetricsWAUQuery,
  useLazyGetMetricsDAUQuery,
  useLazyGetMetricsFeaturesQuery,
  useLazyGetMetricsGrowthQuery,
  useLazyGetMetricsMAUQuery,
  useLazyGetMetricsSignupsQuery,
  useLazyGetMetricsStatusQuery,
  useLazyGetMetricsWAUQuery,
} = apiWebAdminMetrics
