import { BLOG_POST_STATUS } from '@dx3/models-shared'
import type { BlogPostType } from '@dx3/models-shared'

import { BlogAdminWebListService } from './blog-admin-web-list.service'

jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: () => ({
      i18n: {
        translations: {
          BLOG_DATE_CREATED: 'Created',
          BLOG_DATE_PUBLISHED: 'Published',
          BLOG_PUBLISH: 'Publish',
          BLOG_SCHEDULE: 'Schedule',
          BLOG_TOOLTIP_PUBLISH: 'Publish now',
          BLOG_TOOLTIP_SCHEDULE: 'Schedule for later',
          BLOG_TOOLTIP_UNPUBLISH: 'Unpublish',
          BLOG_TOOLTIP_UNSCHEDULE: 'Unschedule',
          BLOG_UNPUBLISH: 'Unpublish',
          BLOG_UNSCHEDULE: 'Unschedule',
          SLUG: 'Slug',
          STATUS: 'Status',
          TITLE: 'Title',
        },
      },
    }),
  },
}))

const createMockPost = (overrides: Partial<BlogPostType> = {}): BlogPostType =>
  ({
    authorId: 'author-1',
    canonicalUrl: null,
    categories: [],
    content: 'Content',
    createdAt: new Date('2025-01-15'),
    excerpt: null,
    featuredImageId: null,
    id: 'post-1',
    isAnonymous: false,
    publishedAt: null,
    readingTimeMinutes: 1,
    scheduledAt: null,
    seoDescription: null,
    seoTitle: null,
    slug: 'my-post',
    status: BLOG_POST_STATUS.DRAFT,
    tags: [],
    title: 'My Post',
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  }) as BlogPostType

describe('BlogAdminWebListService', () => {
  it('should exist when imported', () => {
    expect(BlogAdminWebListService).toBeDefined()
  })

  describe('getListHeaders', () => {
    it('should return headers for all columns', () => {
      const headers = BlogAdminWebListService.getListHeaders()
      expect(headers).toBeDefined()
      expect(headers.length).toBeGreaterThan(0)
      expect(headers.some((h) => h.fieldName === 'title')).toBe(true)
      expect(headers.some((h) => h.fieldName === 'slug')).toBe(true)
      expect(headers.some((h) => h.fieldName === 'status')).toBe(true)
      expect(headers.some((h) => h.fieldName === 'createdAt')).toBe(true)
      expect(headers.some((h) => h.fieldName === 'publishedAt')).toBe(true)
      expect(headers.some((h) => h.fieldName === 'actions')).toBe(true)
    })
  })

  describe('getRows', () => {
    it('should return rows for posts without actions', () => {
      const service = new BlogAdminWebListService()
      const posts = [createMockPost()]
      const rows = service.getRows(posts)

      expect(rows).toHaveLength(1)
      expect(rows[0].id).toBe('post-1')
      expect(rows[0].testingKey).toBe('blog-post-row-my-post')
      expect(rows[0].columns).toBeDefined()
      expect(rows[0].columns.length).toBe(6)
    })

    it('should include title and slug in row data', () => {
      const service = new BlogAdminWebListService()
      const posts = [createMockPost({ slug: 'test-slug', title: 'Test Title' })]
      const rows = service.getRows(posts)

      const textColumns = rows[0].columns.filter(
        (c) => typeof c.data === 'string',
      ) as { data: string }[]
      const values = textColumns.map((c) => c.data)
      expect(values).toContain('Test Title')
      expect(values).toContain('test-slug')
    })

    it('should return multiple rows for multiple posts', () => {
      const service = new BlogAdminWebListService()
      const posts = [
        createMockPost({ id: '1', slug: 'post-1' }),
        createMockPost({ id: '2', slug: 'post-2' }),
      ]
      const rows = service.getRows(posts)

      expect(rows).toHaveLength(2)
      expect(rows[0].id).toBe('1')
      expect(rows[1].id).toBe('2')
    })

    it('should accept actions and include actions column', () => {
      const service = new BlogAdminWebListService()
      const onPublish = jest.fn()
      const onScheduleClick = jest.fn()
      const onUnpublish = jest.fn()
      const onUnschedule = jest.fn()
      const posts = [createMockPost({ status: BLOG_POST_STATUS.DRAFT })]

      const rows = service.getRows(posts, {
        onPublish,
        onScheduleClick,
        onUnpublish,
        onUnschedule,
      })

      expect(rows).toHaveLength(1)
      const actionsCol = rows[0].columns[rows[0].columns.length - 1]
      expect(actionsCol.componentType).toBe('component')
      expect(actionsCol.data).toBeDefined()
    })
  })
})
