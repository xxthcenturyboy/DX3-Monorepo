import {
  ANONYMOUS_AUTHOR_DISPLAY_NAME,
  BLOG_CATEGORY_POSTGRES_DB_NAME,
  BLOG_POST_POSTGRES_DB_NAME,
  BLOG_TAG_POSTGRES_DB_NAME,
} from './blog-api.consts'

describe('ANONYMOUS_AUTHOR_DISPLAY_NAME', () => {
  it('should exist when imported', () => {
    expect(ANONYMOUS_AUTHOR_DISPLAY_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(ANONYMOUS_AUTHOR_DISPLAY_NAME).toEqual('DX3 Team')
  })
})

describe('BLOG_CATEGORY_POSTGRES_DB_NAME', () => {
  it('should exist when imported', () => {
    expect(BLOG_CATEGORY_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(BLOG_CATEGORY_POSTGRES_DB_NAME).toEqual('blog_categories')
  })
})

describe('BLOG_POST_POSTGRES_DB_NAME', () => {
  it('should exist when imported', () => {
    expect(BLOG_POST_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(BLOG_POST_POSTGRES_DB_NAME).toEqual('blog_posts')
  })
})

describe('BLOG_TAG_POSTGRES_DB_NAME', () => {
  it('should exist when imported', () => {
    expect(BLOG_TAG_POSTGRES_DB_NAME).toBeDefined()
  })

  it('should have correct value', () => {
    expect(BLOG_TAG_POSTGRES_DB_NAME).toEqual('blog_tags')
  })
})
