import { ApiLoggingClass } from '../logger'
import { BlogService } from './blog-api.service'
import { BlogCategoryModel } from './blog-category-api.postgres-model'
import { BlogPostModel } from './blog-post-api.postgres-model'
import { BlogTagModel } from './blog-tag-api.postgres-model'

jest.mock('../logger', () => require('../testing/mocks/internal/logger.mock'))
jest.mock('./blog-post-api.postgres-model')
jest.mock('./blog-category-api.postgres-model')
jest.mock('./blog-tag-api.postgres-model')
jest.mock('@dx3/utils-shared', () => ({
  slugify: (s: string) => s?.toLowerCase().replace(/\s+/g, '-') ?? '',
}))

describe('BlogService', () => {
  let service: BlogService

  beforeAll(() => {
    new ApiLoggingClass({ appName: 'Unit-Test' })
  })

  beforeEach(() => {
    service = new BlogService()
    jest.clearAllMocks()
  })

  it('should exist when imported', () => {
    expect(BlogService).toBeDefined()
  })

  it('should exist when instantiated', () => {
    expect(service).toBeDefined()
  })

  it('should have required public methods', () => {
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

  describe('getPublishedPosts', () => {
    it('should return posts with cursor', async () => {
      const mockRows = [{ id: '1', slug: 'post-1', title: 'Post 1' }]
      ;(BlogPostModel.getPublishedPosts as jest.Mock).mockResolvedValue({
        cursor: 'next-cursor',
        rows: mockRows,
      })

      const result = await service.getPublishedPosts({ limit: 10 })

      expect(result.cursor).toBe('next-cursor')
      expect(result.posts).toHaveLength(1)
      expect(BlogPostModel.getPublishedPosts).toHaveBeenCalledWith({ limit: 10 })
    })
  })

  describe('getCategories', () => {
    it('should return mapped categories', async () => {
      const mockRows = [
        {
          id: '1',
          name: 'Tech',
          slug: 'tech',
          toJSON: () => ({ id: '1', name: 'Tech', slug: 'tech' }),
        },
      ]
      ;(BlogCategoryModel.getAll as jest.Mock).mockResolvedValue(mockRows)

      const result = await service.getCategories()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: '1', name: 'Tech', slug: 'tech' })
    })
  })

  describe('getTags', () => {
    it('should return mapped tags', async () => {
      const mockRows = [
        {
          id: '1',
          name: 'JavaScript',
          slug: 'javascript',
          toJSON: () => ({ id: '1', name: 'JavaScript', slug: 'javascript' }),
        },
      ]
      ;(BlogTagModel.getAll as jest.Mock).mockResolvedValue(mockRows)

      const result = await service.getTags()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: '1', name: 'JavaScript', slug: 'javascript' })
    })
  })

  describe('getPostBySlug', () => {
    it('should return post when slug exists', async () => {
      const mockPost = {
        author: { firstName: 'John', lastName: 'Doe', username: 'johndoe' },
        authorId: 'author-1',
        content: 'Content',
        id: '1',
        isAnonymous: false,
        slug: 'my-post',
        title: 'My Post',
      }
      ;(BlogPostModel.getPostBySlug as jest.Mock).mockResolvedValue(mockPost)

      const result = await service.getPostBySlug('my-post')

      expect(result).toBeDefined()
      expect(result?.slug).toBe('my-post')
      expect(result?.authorDisplayName).toBe('John Doe')
    })

    it('should return null when slug does not exist', async () => {
      ;(BlogPostModel.getPostBySlug as jest.Mock).mockResolvedValue(null)

      const result = await service.getPostBySlug('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('getRelatedPosts', () => {
    it('should return related posts', async () => {
      const mockPost = {
        authorId: 'a1',
        categories: [{ id: 'cat-1' }],
        content: '',
        id: 'post-1',
        isAnonymous: true,
        tags: [{ id: 'tag-1' }],
      }
      const mockRelated = [
        {
          authorId: 'a1',
          content: '',
          id: '2',
          isAnonymous: true,
          slug: 'related',
          title: 'Related',
        },
      ]
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getRelatedPosts as jest.Mock).mockResolvedValue(mockRelated)

      const result = await service.getRelatedPosts('post-1', 3)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ id: '2', slug: 'related', title: 'Related' })
    })

    it('should return empty array when post not found', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(null)

      const result = await service.getRelatedPosts('nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('getAllPosts', () => {
    it('should return admin post list', async () => {
      const mockRows = [{ id: '1', slug: 'admin-post', title: 'Admin Post' }]
      ;(BlogPostModel.getAllPosts as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockRows,
      })

      const result = await service.getAllPosts({})

      expect(result.count).toBe(1)
      expect(result.rows).toHaveLength(1)
    })
  })

  describe('getPostById', () => {
    it('should return post when found', async () => {
      const mockPost = { deletedAt: null, id: '1', slug: 'post', title: 'Post' }
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue(mockPost)

      const result = await service.getPostById('1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('1')
    })

    it('should return null when post deleted', async () => {
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({
        deletedAt: new Date(),
        id: '1',
      })

      const result = await service.getPostById('1')

      expect(result).toBeNull()
    })
  })

  describe('createPost', () => {
    it('should throw when title is empty', async () => {
      await expect(service.createPost('author-1', { content: 'Body' } as never)).rejects.toThrow(
        'Title is required',
      )
    })

    it('should create draft post', async () => {
      const mockPost = {
        id: 'new-1',
        setCategories: jest.fn().mockResolvedValue(undefined),
        setTags: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.create as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue(null)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({
        id: 'new-1',
        slug: 'my-title',
        title: 'My Title',
      })

      const result = await service.createPost('author-1', {
        content: 'Content',
        title: 'My Title',
      } as never)

      expect(result).toBeDefined()
      expect(result.id).toBe('new-1')
    })
  })

  describe('updatePost', () => {
    it('should throw when post not found', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(
        service.updatePost('nonexistent', 'editor-1', { title: 'New' } as never),
      ).rejects.toThrow('Post not found')
    })

    it('should update post', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        setCategories: jest.fn().mockResolvedValue(undefined),
        setTags: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue(null)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({
        id: '1',
        title: 'Updated',
      })

      const result = await service.updatePost('1', 'editor-1', {
        title: 'Updated',
      } as never)

      expect(result).toBeDefined()
      expect(result.title).toBe('Updated')
    })
  })

  describe('deletePost', () => {
    it('should throw when post not found', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(service.deletePost('nonexistent')).rejects.toThrow('Post not found')
    })

    it('should soft delete post', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)

      await service.deletePost('1')

      expect(mockPost.update).toHaveBeenCalled()
    })
  })

  describe('publishPost', () => {
    it('should publish post', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({
        id: '1',
        status: 'PUBLISHED',
      })

      const result = await service.publishPost('1')

      expect(result).toBeDefined()
      expect(result.status).toBe('PUBLISHED')
    })
  })

  describe('getPostForPreview', () => {
    it('should return post with author when found and not deleted', async () => {
      const mockPost = {
        author: { firstName: 'Jane', lastName: 'Smith', username: 'jsmith' },
        authorId: 'a1',
        content: '',
        deletedAt: null,
        id: '1',
        isAnonymous: false,
      }
      ;(BlogPostModel.getPostByIdWithAuthor as jest.Mock).mockResolvedValue(mockPost)

      const result = await service.getPostForPreview('1')

      expect(result).toBeDefined()
      expect(result?.authorDisplayName).toBe('Jane Smith')
    })

    it('should return null when post is deleted', async () => {
      ;(BlogPostModel.getPostByIdWithAuthor as jest.Mock).mockResolvedValue({
        deletedAt: new Date(),
        id: '1',
      })

      const result = await service.getPostForPreview('1')

      expect(result).toBeNull()
    })

    it('should return null when post not found', async () => {
      ;(BlogPostModel.getPostByIdWithAuthor as jest.Mock).mockResolvedValue(null)

      const result = await service.getPostForPreview('missing')

      expect(result).toBeNull()
    })
  })

  describe('schedulePost', () => {
    it('should throw when post not found', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(service.schedulePost('x', new Date(Date.now() + 86400000))).rejects.toThrow(
        'Post not found',
      )
    })

    it('should throw when scheduled time is in the past', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue({
        deletedAt: null,
        id: '1',
        update: jest.fn(),
      })

      await expect(service.schedulePost('1', new Date(Date.now() - 1000))).rejects.toThrow(
        'Scheduled time must be in the future',
      )
    })

    it('should schedule post', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({ id: '1', status: 'SCHEDULED' })

      const futureDate = new Date(Date.now() + 86400000)
      const result = await service.schedulePost('1', futureDate)

      expect(result).toBeDefined()
      expect(mockPost.update).toHaveBeenCalled()
    })
  })

  describe('unschedulePost', () => {
    it('should throw when post not found', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(service.unschedulePost('x')).rejects.toThrow('Post not found')
    })

    it('should throw when post is not scheduled', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue({
        deletedAt: null,
        id: '1',
        status: 'draft',
        update: jest.fn(),
      })

      await expect(service.unschedulePost('1')).rejects.toThrow(
        'Only scheduled posts can be unscheduled',
      )
    })

    it('should unschedule a scheduled post', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        status: 'scheduled',
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({ id: '1', status: 'draft' })

      const result = await service.unschedulePost('1')

      expect(result).toBeDefined()
      expect(mockPost.update).toHaveBeenCalled()
    })
  })

  describe('unpublishPost', () => {
    it('should throw when post not found', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(null)

      await expect(service.unpublishPost('x')).rejects.toThrow('Post not found')
    })

    it('should throw when post is not published', async () => {
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue({
        deletedAt: null,
        id: '1',
        status: 'draft',
        update: jest.fn(),
      })

      await expect(service.unpublishPost('1')).rejects.toThrow(
        'Only published posts can be unpublished',
      )
    })

    it('should unpublish a published post', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        status: 'published',
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({
        id: '1',
        status: 'unpublished',
      })

      const result = await service.unpublishPost('1')

      expect(result).toBeDefined()
      expect(mockPost.update).toHaveBeenCalled()
    })
  })

  describe('processScheduledPosts', () => {
    it('should process and publish all scheduled posts', async () => {
      const mockPost1 = { id: '1', slug: 'post-1', update: jest.fn().mockResolvedValue(undefined) }
      const mockPost2 = { id: '2', slug: 'post-2', update: jest.fn().mockResolvedValue(undefined) }
      ;(BlogPostModel.findScheduledToPublish as jest.Mock).mockResolvedValue([mockPost1, mockPost2])

      const count = await service.processScheduledPosts()

      expect(count).toBe(2)
      expect(mockPost1.update).toHaveBeenCalled()
      expect(mockPost2.update).toHaveBeenCalled()
    })

    it('should return 0 when no posts are scheduled', async () => {
      ;(BlogPostModel.findScheduledToPublish as jest.Mock).mockResolvedValue([])

      const count = await service.processScheduledPosts()

      expect(count).toBe(0)
    })
  })

  describe('updatePost - additional payload branches', () => {
    it('should update content and recalculate reading time', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        setCategories: jest.fn().mockResolvedValue(undefined),
        setTags: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({ id: '1', title: 'Original' })

      await service.updatePost('1', 'editor-1', { content: 'New long content here' } as never)

      expect(mockPost.update).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'New long content here' }),
      )
    })

    it('should throw when new slug is already in use', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        update: jest.fn(),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue({ slug: 'taken-slug' })

      await expect(
        service.updatePost('1', 'editor-1', { slug: 'taken-slug' } as never),
      ).rejects.toThrow('Slug already in use')
    })

    it('should update categories and tags when provided', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        setCategories: jest.fn().mockResolvedValue(undefined),
        setTags: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      }
      const mockCatId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      const mockTagId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({ id: '1' })

      await service.updatePost('1', 'editor-1', {
        categories: [mockCatId],
        tags: [mockTagId],
      } as never)

      expect(mockPost.setCategories).toHaveBeenCalledWith([mockCatId])
      expect(mockPost.setTags).toHaveBeenCalledWith([mockTagId])
    })

    it('should resolve non-UUID category names', async () => {
      const mockPost = {
        deletedAt: null,
        id: '1',
        setCategories: jest.fn().mockResolvedValue(undefined),
        setTags: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.findByPk as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({ id: '1' })
      ;(BlogCategoryModel.findOrCreateBySlug as jest.Mock).mockResolvedValue({ id: 'cat-resolved' })
      ;(BlogTagModel.findOrCreateBySlug as jest.Mock).mockResolvedValue({ id: 'tag-resolved' })

      await service.updatePost('1', 'editor-1', {
        categories: ['Technology'],
        tags: ['javascript'],
      } as never)

      expect(BlogCategoryModel.findOrCreateBySlug).toHaveBeenCalledWith('technology', 'Technology')
      expect(BlogTagModel.findOrCreateBySlug).toHaveBeenCalledWith('javascript', 'javascript')
    })
  })

  describe('createPost - additional branches', () => {
    it('should use anonymous author display name when isAnonymous is true', async () => {
      const mockPost = {
        id: 'new-1',
        setCategories: jest.fn().mockResolvedValue(undefined),
        setTags: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.create as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue(null)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({
        id: 'new-1',
        isAnonymous: true,
      })

      const result = await service.createPost('author-1', {
        content: '',
        isAnonymous: true,
        title: 'Anon Post',
      } as never)

      expect(result).toBeDefined()
      expect(result.id).toBe('new-1')
    })

    it('should resolve category and tag names', async () => {
      const mockPost = {
        id: 'new-2',
        setCategories: jest.fn().mockResolvedValue(undefined),
        setTags: jest.fn().mockResolvedValue(undefined),
      }
      ;(BlogPostModel.create as jest.Mock).mockResolvedValue(mockPost)
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue(null)
      ;(BlogPostModel.getPostById as jest.Mock).mockResolvedValue({ id: 'new-2' })
      ;(BlogCategoryModel.findOrCreateBySlug as jest.Mock).mockResolvedValue({ id: 'cat-1' })
      ;(BlogTagModel.findOrCreateBySlug as jest.Mock).mockResolvedValue({ id: 'tag-1' })

      await service.createPost('author-1', {
        categories: ['Tech'],
        content: '',
        tags: ['typescript'],
        title: 'Tagged Post',
      } as never)

      expect(BlogCategoryModel.findOrCreateBySlug).toHaveBeenCalled()
      expect(BlogTagModel.findOrCreateBySlug).toHaveBeenCalled()
    })
  })

  describe('getPostBySlug - author name edge cases', () => {
    it('should use username when no first/last name', async () => {
      ;(BlogPostModel.getPostBySlug as jest.Mock).mockResolvedValue({
        author: { firstName: '', lastName: '', username: 'onlyusername' },
        authorId: 'a1',
        content: '',
        id: '1',
        isAnonymous: false,
        slug: 'test',
      })

      const result = await service.getPostBySlug('test')

      expect(result?.authorDisplayName).toBe('onlyusername')
    })

    it('should use anonymous name when no author data at all', async () => {
      ;(BlogPostModel.getPostBySlug as jest.Mock).mockResolvedValue({
        author: null,
        authorId: 'a1',
        content: '',
        id: '1',
        isAnonymous: false,
        slug: 'test',
      })

      const result = await service.getPostBySlug('test')

      expect(result?.authorDisplayName).toBeDefined()
    })

    it('should use anonymous display name when isAnonymous is true', async () => {
      ;(BlogPostModel.getPostBySlug as jest.Mock).mockResolvedValue({
        author: { firstName: 'Real', lastName: 'Name', username: 'realname' },
        authorId: 'a1',
        content: '',
        id: '1',
        isAnonymous: true,
        slug: 'anon-post',
      })

      const result = await service.getPostBySlug('anon-post')

      expect(result?.authorDisplayName).not.toBe('Real Name')
    })
  })

  describe('generateSlug', () => {
    it('should generate unique slug', async () => {
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue(null)

      const result = await service.generateSlug('My Title')

      expect(result).toBe('my-title')
    })

    it('should append counter when slug exists', async () => {
      ;(BlogPostModel.findExistingSlug as jest.Mock)
        .mockResolvedValueOnce({ slug: 'my-title' })
        .mockResolvedValueOnce(null)

      const result = await service.generateSlug('My Title')

      expect(result).toBe('my-title-1')
    })

    it('should return existing slug when it matches the provided existing slug', async () => {
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue({ slug: 'my-title' })

      const result = await service.generateSlug('My Title', 'my-title')

      expect(result).toBe('my-title')
    })

    it('should handle empty title by using untitled', async () => {
      ;(BlogPostModel.findExistingSlug as jest.Mock).mockResolvedValue(null)

      const result = await service.generateSlug('')

      expect(result).toBe('untitled')
    })
  })
})
