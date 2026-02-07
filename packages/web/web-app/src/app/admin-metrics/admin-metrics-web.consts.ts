export const ADMIN_METRICS_ENTITY_NAME = 'adminMetrics'

export const ADMIN_METRICS_ROUTES = {
  DASHBOARD: '/admin-metrics',
  MAIN: '/admin-metrics',
} as const

export const METRICS_DATE_RANGES = {
  LAST_7_DAYS: '7d',
  LAST_14_DAYS: '14d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
} as const

// Maps date range values to i18n keys
export const METRICS_DATE_RANGE_I18N_KEYS = {
  '7d': 'ADMIN_METRICS_LAST_7_DAYS',
  '14d': 'ADMIN_METRICS_LAST_14_DAYS',
  '30d': 'ADMIN_METRICS_LAST_30_DAYS',
  '90d': 'ADMIN_METRICS_LAST_90_DAYS',
} as const

export type MetricsDateRangeType = (typeof METRICS_DATE_RANGES)[keyof typeof METRICS_DATE_RANGES]
