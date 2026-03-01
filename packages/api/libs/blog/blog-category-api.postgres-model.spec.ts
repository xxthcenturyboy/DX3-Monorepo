import { ApiLoggingClass } from '../logger'
import { BLOG_CATEGORY_POSTGRES_DB_NAME } from './blog-api.consts'
import { BlogCategoryModel } from './blog-category-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))

describe('BlogCategoryModel', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(BlogCategoryModel).toBeDefined()
  })

  it('should have correct entity name constant', () => {
    expect(BLOG_CATEGORY_POSTGRES_DB_NAME).toBeDefined()
    expect(BLOG_CATEGORY_POSTGRES_DB_NAME).toBe('blog_categories')
  })

  it('should have getAll static method', () => {
    expect(BlogCategoryModel.getAll).toBeDefined()
  })

  it('should have findOrCreateBySlug static method', () => {
    expect(BlogCategoryModel.findOrCreateBySlug).toBeDefined()
  })
})
