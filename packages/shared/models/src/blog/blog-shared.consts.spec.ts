import { BLOG_DEFAULTS, BLOG_POST_STATUS, BLOG_POST_STATUS_ARRAY } from './blog-shared.consts'

describe('BLOG_POST_STATUS', () => {
  it('should exist when imported', () => {
    expect(BLOG_POST_STATUS).toBeDefined()
  })

  it('should have correct status values', () => {
    expect(BLOG_POST_STATUS.ARCHIVED).toEqual('archived')
    expect(BLOG_POST_STATUS.DRAFT).toEqual('draft')
    expect(BLOG_POST_STATUS.PUBLISHED).toEqual('published')
    expect(BLOG_POST_STATUS.SCHEDULED).toEqual('scheduled')
    expect(BLOG_POST_STATUS.UNPUBLISHED).toEqual('unpublished')
  })
})

describe('BLOG_POST_STATUS_ARRAY', () => {
  it('should exist when imported', () => {
    expect(BLOG_POST_STATUS_ARRAY).toBeDefined()
  })

  it('should be array of all status values', () => {
    expect(BLOG_POST_STATUS_ARRAY).toEqual([
      'archived',
      'draft',
      'published',
      'scheduled',
      'unpublished',
    ])
  })
})

describe('BLOG_DEFAULTS', () => {
  it('should exist when imported', () => {
    expect(BLOG_DEFAULTS).toBeDefined()
  })

  it('should have correct default values', () => {
    expect(BLOG_DEFAULTS.EXCERPT_MAX_LENGTH).toEqual(200)
    expect(BLOG_DEFAULTS.POSTS_PER_PAGE).toEqual(5)
    expect(BLOG_DEFAULTS.WORDS_PER_MINUTE).toEqual(200)
  })
})
