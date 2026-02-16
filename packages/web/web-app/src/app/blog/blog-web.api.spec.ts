import { apiWebBlog } from './blog-web.api'

jest.mock('../data/rtk-query')

describe('apiWebBlog', () => {
  it('should exist when imported', () => {
    expect(apiWebBlog).toBeDefined()
  })

  it('should have required endpoints', () => {
    expect(apiWebBlog.endpoints.createBlogPost).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogAdminPostById).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogAdminPosts).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogCategories).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogPostBySlug).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogPostPreview).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogPosts).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogRelatedPosts).toBeDefined()
    expect(apiWebBlog.endpoints.getBlogTags).toBeDefined()
    expect(apiWebBlog.endpoints.publishBlogPost).toBeDefined()
    expect(apiWebBlog.endpoints.scheduleBlogPost).toBeDefined()
    expect(apiWebBlog.endpoints.unscheduleBlogPost).toBeDefined()
    expect(apiWebBlog.endpoints.unpublishBlogPost).toBeDefined()
    expect(apiWebBlog.endpoints.updateBlogPost).toBeDefined()
    expect(apiWebBlog.endpoints.updateBlogPostPassive).toBeDefined()
  })

  it('should have updateBlogPostPassive endpoint for passive auto-save', () => {
    expect(apiWebBlog.endpoints.updateBlogPostPassive).toBeDefined()
  })

  it('should have hooks exported', () => {
    expect(apiWebBlog.useCreateBlogPostMutation).toBeDefined()
    expect(apiWebBlog.useGetBlogAdminPostByIdQuery).toBeDefined()
    expect(apiWebBlog.useGetBlogAdminPostsQuery).toBeDefined()
    expect(apiWebBlog.useGetBlogCategoriesQuery).toBeDefined()
    expect(apiWebBlog.useGetBlogPostBySlugQuery).toBeDefined()
    expect(apiWebBlog.useGetBlogPostPreviewQuery).toBeDefined()
    expect(apiWebBlog.useGetBlogPostsQuery).toBeDefined()
    expect(apiWebBlog.useGetBlogRelatedPostsQuery).toBeDefined()
    expect(apiWebBlog.useGetBlogTagsQuery).toBeDefined()
    expect(apiWebBlog.useLazyGetBlogPostsQuery).toBeDefined()
    expect(apiWebBlog.usePublishBlogPostMutation).toBeDefined()
    expect(apiWebBlog.useScheduleBlogPostMutation).toBeDefined()
    expect(apiWebBlog.useUnpublishBlogPostMutation).toBeDefined()
    expect(apiWebBlog.useUnscheduleBlogPostMutation).toBeDefined()
    expect(apiWebBlog.useUpdateBlogPostMutation).toBeDefined()
    expect(apiWebBlog.useUpdateBlogPostPassiveMutation).toBeDefined()
  })
})
