import type { MetricsDateRangeType } from './admin-metrics-web.consts'

export type MetricsStatusType = {
  isAvailable: boolean
  loggingAvailable: boolean
  message: string
  metricsAvailable: boolean
}

export type MetricsGrowthDataType = {
  dailyActiveUsers: number
  monthlyActiveUsers: number
  signupsLast7Days: number
  signupsLast30Days: number
  totalSignups: number
  weeklyActiveUsers: number
}

export type MetricsTimeSeriesPointType = {
  count: number
  date: string
}

export type MetricsSignupsByMethodType = {
  count: number
  method: string
}

export type MetricsFeatureUsageType = {
  count: number
  featureName: string
}

export type AdminMetricsStateType = {
  dateRange: MetricsDateRangeType
  growth: MetricsGrowthDataType | null
  isAvailable: boolean | null
  lastRoute: string
}
