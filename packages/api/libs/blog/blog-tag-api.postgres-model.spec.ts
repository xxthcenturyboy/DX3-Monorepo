import { ApiLoggingClass } from '../logger'
import { BLOG_TAG_POSTGRES_DB_NAME } from './blog-api.consts'
import { BlogTagModel } from './blog-tag-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('BlogTagModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(BlogTagModel).toBeDefined()
  })

  it('should have correct entity name constant', () => {
    expect(BLOG_TAG_POSTGRES_DB_NAME).toBeDefined()
    expect(BLOG_TAG_POSTGRES_DB_NAME).toBe('blog_tags')
  })

  it('should have getAll static method', () => {
    expect(BlogTagModel.getAll).toBeDefined()
  })

  it('should have findOrCreateBySlug static method', () => {
    expect(BlogTagModel.findOrCreateBySlug).toBeDefined()
  })
})
