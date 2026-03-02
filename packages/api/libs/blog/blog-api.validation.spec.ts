import {
  blogPostParamsSchema,
  blogPostSlugParamsSchema,
  createBlogPostBodySchema,
  getBlogPostsAdminQuerySchema,
  getBlogPostsQuerySchema,
  scheduleBlogPostBodySchema,
  updateBlogPostBodySchema,
} from './blog-api.validation'

describe('blog-api validation schemas', () => {
  describe('createBlogPostBodySchema', () => {
    it('should accept a minimal valid payload', () => {
      const result = createBlogPostBodySchema.safeParse({ content: 'Body text', title: 'My Post' })
      expect(result.success).toBe(true)
    })

    it('should accept a full valid payload', () => {
      const result = createBlogPostBodySchema.safeParse({
        categories: ['tech'],
        content: 'Body text',
        excerpt: 'Short excerpt',
        featuredImageId: 'img-1',
        isAnonymous: false,
        tags: ['typescript'],
        title: 'My Post',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing title', () => {
      const result = createBlogPostBodySchema.safeParse({ content: 'Body' })
      expect(result.success).toBe(false)
    })

    it('should reject empty title', () => {
      const result = createBlogPostBodySchema.safeParse({ content: 'Body', title: '' })
      expect(result.success).toBe(false)
    })

    it('should reject missing content', () => {
      const result = createBlogPostBodySchema.safeParse({ title: 'Title' })
      expect(result.success).toBe(false)
    })

    it('should allow nullable featuredImageId', () => {
      const result = createBlogPostBodySchema.safeParse({
        content: 'Body',
        featuredImageId: null,
        title: 'Title',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateBlogPostBodySchema', () => {
    it('should accept empty payload (all fields optional)', () => {
      const result = updateBlogPostBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept seo fields', () => {
      const result = updateBlogPostBodySchema.safeParse({
        canonicalUrl: 'https://example.com',
        seoDescription: 'SEO description',
        seoTitle: 'SEO title',
        slug: 'my-post',
      })
      expect(result.success).toBe(true)
    })

    it('should allow nullable seo fields', () => {
      const result = updateBlogPostBodySchema.safeParse({
        canonicalUrl: null,
        seoDescription: null,
        seoTitle: null,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('scheduleBlogPostBodySchema', () => {
    it('should accept a valid datetime string', () => {
      const result = scheduleBlogPostBodySchema.safeParse({
        scheduledAt: '2026-12-01T10:00:00Z',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing scheduledAt', () => {
      const result = scheduleBlogPostBodySchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject empty scheduledAt string', () => {
      const result = scheduleBlogPostBodySchema.safeParse({ scheduledAt: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('blogPostParamsSchema', () => {
    it('should accept a valid id', () => {
      const result = blogPostParamsSchema.safeParse({ id: 'abc-123' })
      expect(result.success).toBe(true)
    })

    it('should reject missing id', () => {
      const result = blogPostParamsSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject empty id', () => {
      const result = blogPostParamsSchema.safeParse({ id: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('blogPostSlugParamsSchema', () => {
    it('should accept a valid slug', () => {
      const result = blogPostSlugParamsSchema.safeParse({ slug: 'my-post-slug' })
      expect(result.success).toBe(true)
    })

    it('should reject missing slug', () => {
      const result = blogPostSlugParamsSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should reject empty slug', () => {
      const result = blogPostSlugParamsSchema.safeParse({ slug: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('getBlogPostsAdminQuerySchema', () => {
    it('should accept an empty query', () => {
      const result = getBlogPostsAdminQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept all valid filter fields', () => {
      const result = getBlogPostsAdminQuerySchema.safeParse({
        filterValue: 'test',
        limit: '10',
        offset: '0',
        orderBy: 'title',
        sortDir: 'ASC',
        status: 'published',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid sortDir', () => {
      const result = getBlogPostsAdminQuerySchema.safeParse({ sortDir: 'RANDOM' })
      expect(result.success).toBe(false)
    })

    it('should coerce numeric strings for limit and offset', () => {
      const result = getBlogPostsAdminQuerySchema.safeParse({ limit: '5', offset: '20' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(5)
        expect(result.data.offset).toBe(20)
      }
    })
  })

  describe('getBlogPostsQuerySchema', () => {
    it('should accept an empty query', () => {
      const result = getBlogPostsQuerySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept cursor and limit', () => {
      const result = getBlogPostsQuerySchema.safeParse({ cursor: 'abc', limit: '5' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.cursor).toBe('abc')
        expect(result.data.limit).toBe(5)
      }
    })
  })
})
