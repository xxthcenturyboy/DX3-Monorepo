import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import type { BlogPostWithAuthorType } from '@dx3/models-shared'

import { BLOG_TEST_THEME } from './testing/blog-test.fixtures'
import './testing/blog-test-setup'
import { BlogPostCardComponent } from './blog-post-card.component'

const mockNavigate = jest.fn()
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const createMockPost = (overrides: Partial<BlogPostWithAuthorType> = {}): BlogPostWithAuthorType =>
  ({
    authorDisplayName: 'Author Name',
    authorId: 'author-1',
    canonicalUrl: null,
    categories: [{ id: 'cat-1', name: 'Tech', slug: 'tech' }],
    content: 'Full content here',
    createdAt: new Date('2025-01-01'),
    excerpt: 'Short excerpt',
    featuredImageId: null,
    id: 'post-1',
    isAnonymous: false,
    publishedAt: new Date('2025-01-15'),
    readingTimeMinutes: 3,
    scheduledAt: null,
    seoDescription: null,
    seoTitle: null,
    slug: 'my-post',
    status: 'published',
    tags: [{ id: 'tag-1', name: 'React', slug: 'react' }],
    title: 'My Post Title',
    updatedAt: new Date('2025-01-15'),
    ...overrides,
  }) as BlogPostWithAuthorType

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={BLOG_TEST_THEME}>{ui}</ThemeProvider>)

describe('BlogPostCardComponent', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('should render post title', () => {
    const post = createMockPost({ title: 'Test Post' })
    renderWithTheme(<BlogPostCardComponent post={post} />)
    expect(screen.getByText('Test Post')).toBeTruthy()
  })

  it('should render author and date', () => {
    const post = createMockPost({ authorDisplayName: 'Jane Doe' })
    renderWithTheme(<BlogPostCardComponent post={post} />)
    expect(screen.getByText(/Jane Doe/)).toBeTruthy()
  })

  it('should render excerpt', () => {
    const post = createMockPost({ excerpt: 'Brief summary' })
    renderWithTheme(<BlogPostCardComponent post={post} />)
    expect(screen.getByText('Brief summary')).toBeTruthy()
  })

  it('should render Read more link', () => {
    const post = createMockPost()
    renderWithTheme(<BlogPostCardComponent post={post} />)
    expect(screen.getByText('Read more')).toBeTruthy()
  })

  it('should render categories', () => {
    const post = createMockPost({ categories: [{ id: 'c1', name: 'News', slug: 'news' }] })
    renderWithTheme(<BlogPostCardComponent post={post} />)
    expect(screen.getByText('News')).toBeTruthy()
  })

  it('should render tags', () => {
    const post = createMockPost({ tags: [{ id: 't1', name: 'Tutorial', slug: 'tutorial' }] })
    renderWithTheme(<BlogPostCardComponent post={post} />)
    expect(screen.getByText('Tutorial')).toBeTruthy()
  })

  it('should show reading time when > 0', () => {
    const post = createMockPost({ readingTimeMinutes: 5 })
    renderWithTheme(<BlogPostCardComponent post={post} />)
    expect(screen.getByText(/5 min read/)).toBeTruthy()
  })
})
