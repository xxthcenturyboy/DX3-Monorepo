import {
  ADMIN_METRICS_ENTITY_NAME,
  ADMIN_METRICS_ROUTES,
  METRIC_FEATURE_I18N_KEYS,
  METRICS_DATE_RANGE_I18N_KEYS,
  METRICS_DATE_RANGES,
} from './admin-metrics-web.consts'

describe('admin-metrics-web.consts', () => {
  describe('ADMIN_METRICS_ENTITY_NAME', () => {
    it('should equal "adminMetrics"', () => {
      expect(ADMIN_METRICS_ENTITY_NAME).toBe('adminMetrics')
    })
  })

  describe('ADMIN_METRICS_ROUTES', () => {
    it('should have DASHBOARD route', () => {
      expect(ADMIN_METRICS_ROUTES.DASHBOARD).toBe('/admin-metrics')
    })

    it('should have MAIN route equal to DASHBOARD', () => {
      expect(ADMIN_METRICS_ROUTES.MAIN).toBe(ADMIN_METRICS_ROUTES.DASHBOARD)
    })
  })

  describe('METRICS_DATE_RANGES', () => {
    it('should have LAST_7_DAYS as "7d"', () => {
      expect(METRICS_DATE_RANGES.LAST_7_DAYS).toBe('7d')
    })

    it('should have LAST_14_DAYS as "14d"', () => {
      expect(METRICS_DATE_RANGES.LAST_14_DAYS).toBe('14d')
    })

    it('should have LAST_30_DAYS as "30d"', () => {
      expect(METRICS_DATE_RANGES.LAST_30_DAYS).toBe('30d')
    })

    it('should have LAST_90_DAYS as "90d"', () => {
      expect(METRICS_DATE_RANGES.LAST_90_DAYS).toBe('90d')
    })
  })

  describe('METRICS_DATE_RANGE_I18N_KEYS', () => {
    it('should map all date ranges to i18n keys', () => {
      expect(METRICS_DATE_RANGE_I18N_KEYS['7d']).toBe('ADMIN_METRICS_LAST_7_DAYS')
      expect(METRICS_DATE_RANGE_I18N_KEYS['14d']).toBe('ADMIN_METRICS_LAST_14_DAYS')
      expect(METRICS_DATE_RANGE_I18N_KEYS['30d']).toBe('ADMIN_METRICS_LAST_30_DAYS')
      expect(METRICS_DATE_RANGE_I18N_KEYS['90d']).toBe('ADMIN_METRICS_LAST_90_DAYS')
    })
  })

  describe('METRIC_FEATURE_I18N_KEYS', () => {
    it('should be a non-empty object', () => {
      expect(Object.keys(METRIC_FEATURE_I18N_KEYS).length).toBeGreaterThan(0)
    })

    it('should map email_sent feature', () => {
      expect(METRIC_FEATURE_I18N_KEYS['email_sent']).toBe('ADMIN_METRICS_FEATURE_EMAIL_SENT')
    })

    it('should map media_upload feature', () => {
      expect(METRIC_FEATURE_I18N_KEYS['media_upload']).toBe('ADMIN_METRICS_FEATURE_MEDIA_UPLOAD')
    })
  })
})
