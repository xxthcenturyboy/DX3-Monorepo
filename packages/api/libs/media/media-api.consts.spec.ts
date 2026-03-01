import { MEDIA_API_POSTGRES_DB_NAME } from './media-api.consts'

describe('media-api.consts', () => {
  describe('MEDIA_API_POSTGRES_DB_NAME', () => {
    it('should be defined', () => {
      expect(MEDIA_API_POSTGRES_DB_NAME).toBeDefined()
    })

    it('should equal "media"', () => {
      expect(MEDIA_API_POSTGRES_DB_NAME).toBe('media')
    })
  })
})
