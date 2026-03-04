describe('env.ts', () => {
  describe('WEB_APP_ENV', () => {
    it('should export WEB_APP_ENV with required keys', async () => {
      const { WEB_APP_ENV } = await import('./env')
      expect(WEB_APP_ENV).toBeDefined()
      expect(typeof WEB_APP_ENV).toBe('object')
    })

    it('should have API_URL as a string (possibly empty)', async () => {
      const { WEB_APP_ENV } = await import('./env')
      expect(typeof WEB_APP_ENV.API_URL).toBe('string')
    })

    it('should have NODE_ENV as a string', async () => {
      const { WEB_APP_ENV } = await import('./env')
      expect(typeof WEB_APP_ENV.NODE_ENV).toBe('string')
    })

    it('should have ENV as a string', async () => {
      const { WEB_APP_ENV } = await import('./env')
      expect(typeof WEB_APP_ENV.ENV).toBe('string')
    })

    it('should have WEB_APP_URL as a string', async () => {
      const { WEB_APP_ENV } = await import('./env')
      expect(typeof WEB_APP_ENV.WEB_APP_URL).toBe('string')
    })

    it('should have WEB_APP_PORT defaulting to "3000" when not set', async () => {
      const { WEB_APP_ENV } = await import('./env')
      expect(WEB_APP_ENV.WEB_APP_PORT).toBe('3000')
    })

    it('should set window.WEB_APP_ENV in browser environment', async () => {
      await import('./env')
      expect(window.WEB_APP_ENV).toBeDefined()
      expect(typeof window.WEB_APP_ENV).toBe('object')
    })
  })
})
