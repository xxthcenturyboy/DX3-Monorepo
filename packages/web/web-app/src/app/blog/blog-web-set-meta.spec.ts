import type { BlogPostMetaInputType } from './blog-web-set-meta'
import { setBlogPostMeta } from './blog-web-set-meta'

describe('setBlogPostMeta', () => {
  const baseUrl = 'https://example.com'

  beforeEach(() => {
    document.head.innerHTML = ''
  })

  const createInput = (overrides: Partial<BlogPostMetaInputType> = {}): BlogPostMetaInputType => ({
    canonicalUrl: null,
    content: 'Post content',
    excerpt: 'Short excerpt',
    seoDescription: null,
    seoTitle: null,
    slug: 'my-post',
    title: 'My Post',
    ...overrides,
  })

  it('should set document title via meta description', () => {
    setBlogPostMeta(createInput(), baseUrl)
    const desc = document.querySelector('meta[name="description"]')
    expect(desc?.getAttribute('content')).toBeTruthy()
  })

  it('should use seoDescription when provided', () => {
    setBlogPostMeta(createInput({ seoDescription: 'Custom SEO desc' }), baseUrl)
    const desc = document.querySelector('meta[name="description"]')
    expect(desc?.getAttribute('content')).toBe('Custom SEO desc')
  })

  it('should set og:title', () => {
    setBlogPostMeta(createInput({ seoTitle: 'OG Title' }), baseUrl)
    const ogTitle = document.querySelector('meta[property="og:title"]')
    expect(ogTitle?.getAttribute('content')).toBe('OG Title')
  })

  it('should set og:type to article', () => {
    setBlogPostMeta(createInput(), baseUrl)
    const ogType = document.querySelector('meta[property="og:type"]')
    expect(ogType?.getAttribute('content')).toBe('article')
  })
})
