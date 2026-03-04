import { STATS_SUDO_ROUTES, STATS_SUDO_WEB_ENTITY_NAME } from './stats-web.consts'

describe('stats-web.consts', () => {
  describe('STATS_SUDO_WEB_ENTITY_NAME', () => {
    it('should be "stats"', () => {
      expect(STATS_SUDO_WEB_ENTITY_NAME).toBe('stats')
    })
  })

  describe('STATS_SUDO_ROUTES', () => {
    it('should have HEALTH route', () => {
      expect(STATS_SUDO_ROUTES.HEALTH).toBe('/sudo/stats/api-health')
    })

    it('should have SSR_HEALTH route', () => {
      expect(STATS_SUDO_ROUTES.SSR_HEALTH).toBe('/sudo/stats/ssr-health')
    })

    it('should have USERS route', () => {
      expect(STATS_SUDO_ROUTES.USERS).toBe('/sudo/stats/users')
    })
  })
})
