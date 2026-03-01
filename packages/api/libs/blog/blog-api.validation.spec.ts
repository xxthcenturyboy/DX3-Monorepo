import {
  createBlogPostBodySchema,
  getBlogPostsAdminQuerySchema,
  getBlogPostsQuerySchema,
  blogPostParamsSchema,
  blogPostSlugParamsSchema,
  scheduleBlogPostBodySchema,
  updateBlogPostBodySchema,
} from './blog-api.validation'

describe('blog-api.validation', () => {
  describe('createBlogPostBodySchema', () => {
    it('should accept valid payload with required fields', () => {
      const result = createBlogPostBodySchema.safeParse({
        content: 'Post content',
        title: 'Post Title',
      })
      expect(result.success).toBe(true)
    })

    it('should accept full payload with optional fields', () => {
      const result = createBlogPostBodySchema.safeParse({
        categories: ['tech'],
        content: 'Post content',
        excerpt: 'Short excerpt',
        featuredImageId: 'img-1',
        isAnonymous: false,
        tags: ['news'],
        title: 'Post Title',
      })
      expect(result.success).toBe(true)
    })

    it('should reject when title is missing', () => {
      const result = createBlogPostBodySchema.safeParse({ content: 'Post content' })
      expect(result.success).toBe(false)
    })

    it('should reject when content is empty', () => {
      const result = createBlogPostBodySchema.safeParse({
        content: '',
        title: 'Post Title',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateBlogPostBodySchema', () => {
    it('should accept partial payload', () => {
      const result = updateBlogPostBodySchema.safeParse({ title: 'Updated Title' })
      expect(result.success).toBe(true)
    })

    it('should accept empty object', () => {
      const result = updateBlogPostBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('scheduleBlogPostBodySchema', () => {
    it('should accept valid scheduledAt', () => {
      const result = scheduleBlogPostBodySchema.safeParse({
        scheduledAt: '2025-03-01T12:00:00Z',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty scheduledAt', () => {
      const result = scheduleBlogPostBodySchema.safeParse({ scheduledAt: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('blogPostParamsSchema', () => {
    it('should accept valid id', () => {
      const result = blogPostParamsSchema.safeParse({ id: 'post-123' })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = blogPostParamsSchema.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('blogPostSlugParamsSchema', () => {
    it('should accept valid slug', () => {
      const result = blogPostSlugParamsSchema.safeParse({ slug: 'my-post-slug' })
      expect(result.success).toBe(true)
    })

    it('should reject empty slug', () => {
      const result = blogPostSlugParamsSchema.safeParse({ slug: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('getBlogPostsAdminQuerySchema', () => {
    it('should accept empty query', () => {
      const result = getBlogPostsAdminQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept full query', () => {
      const result = getBlogPostsAdminQuerySchema.safeParse({
        filterValue: 'search',
        limit: 10,
        offset: 0,
        orderBy: 'createdAt',
        sortDir: 'DESC',
        status: 'draft',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid sortDir', () => {
      const result = getBlogPostsAdminQuerySchema.safeParse({ sortDir: 'INVALID' })
      expect(result.success).toBe(false)
    })
  })

  describe('getBlogPostsQuerySchema', () => {
    it('should accept empty query', () => {
      const result = getBlogPostsQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept cursor and limit', () => {
      const result = getBlogPostsQuerySchema.safeParse({
        cursor: 'cursor-123',
        limit: 20,
      })
      expect(result.success).toBe(true)
    })
  })
})
