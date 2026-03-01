import { ApiLoggingClass } from '../logger'
import { BLOG_POST_POSTGRES_DB_NAME } from './blog-api.consts'
import { BlogPostModel } from './blog-post-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('../media/media-api.postgres-model')
jest.mock('../user/user-api.postgres-model')

describe('BlogPostModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(BlogPostModel).toBeDefined()
  })

  it('should have correct entity name constant', () => {
    expect(BLOG_POST_POSTGRES_DB_NAME).toBeDefined()
    expect(BLOG_POST_POSTGRES_DB_NAME).toBe('blog_posts')
  })
})
