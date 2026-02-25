import { ApiLoggingClass } from '../logger'
import { BlogService } from './blog-api.service'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./blog-post-api.postgres-model')
jest.mock('./blog-category-api.postgres-model')
jest.mock('./blog-tag-api.postgres-model')
jest.mock('@dx3/utils-shared', () => ({
  slugify: (s: string) => s?.toLowerCase().replace(/\s+/g, '-') ?? '',
}))

describe('BlogService', () => {
  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  it('should exist when imported', () => {
    expect(BlogService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    const service = new BlogService()
    expect(service).toBeDefined()
  })

  it('should have required public methods', () => {
    const service = new BlogService()
    expect(service.getPublishedPosts).toBeDefined()
    expect(service.getPostBySlug).toBeDefined()
    expect(service.getRelatedPosts).toBeDefined()
    expect(service.getCategories).toBeDefined()
    expect(service.getTags).toBeDefined()
    expect(service.getAllPosts).toBeDefined()
    expect(service.getPostById).toBeDefined()
    expect(service.getPostForPreview).toBeDefined()
    expect(service.createPost).toBeDefined()
    expect(service.updatePost).toBeDefined()
    expect(service.deletePost).toBeDefined()
    expect(service.publishPost).toBeDefined()
    expect(service.schedulePost).toBeDefined()
    expect(service.unschedulePost).toBeDefined()
    expect(service.unpublishPost).toBeDefined()
    expect(service.processScheduledPosts).toBeDefined()
    expect(service.generateSlug).toBeDefined()
  })
})
