import { MEDIA_API_POSTGRES_DB_NAME } from './media-api.consts'
import { MediaModel } from './media-api.postgres-model'

describe('MediaModel', () => {
  it('should exist when imported', () => {
    expect(MediaModel).toBeDefined()
  })

  it('should have correct entity name constant', () => {
    expect(MEDIA_API_POSTGRES_DB_NAME).toBeDefined()
    expect(MEDIA_API_POSTGRES_DB_NAME).toBe('media')
  })
})
