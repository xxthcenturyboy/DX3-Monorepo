/**
 * Blog Post (Public) Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { BLOG_TEST_THEME } from './testing/blog-test.fixtures'
import './testing/blog-test-setup'

import { BlogPostComponent } from './blog-post-web.component'

const mockPost = {
  authorDisplayName: 'John Doe',
  canonicalUrl: 'https://example.com/blog/hello',
  categories: [{ id: 'c1', name: 'News' }],
  content: '# Hello\n\nBlog content here.',
  createdAt: '2025-01-10T00:00:00Z',
  excerpt: 'Short excerpt',
  featuredImageId: '',
  id: 'post-1',
  isAnonymous: false,
  publishedAt: '2025-01-12T00:00:00Z',
  readingTimeMinutes: 2,
  seoDescription: 'SEO description',
  seoTitle: 'SEO Title',
  slug: 'hello',
  status: 'published',
  tags: [],
  title: 'Hello World',
  updatedAt: '2025-01-12T00:00:00Z',
}

const mockUseGetBlogPostBySlugQuery = jest.fn()
const mockUseGetBlogRelatedPostsQuery = jest.fn()

jest.mock('./blog-web.api', () => ({
  useGetBlogPostBySlugQuery: (slug: string) => mockUseGetBlogPostBySlugQuery(slug),
  useGetBlogRelatedPostsQuery: (params: { id: string }) => mockUseGetBlogRelatedPostsQuery(params),
}))

describe('BlogPostComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetBlogRelatedPostsQuery.mockReturnValue({ data: [] })
  })

  it('should show post not found when no slug', () => {
    mockUseGetBlogPostBySlugQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog']}>
          <Routes>
            <Route
              element={<BlogPostComponent />}
              path="/blog/:slug?"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Post not found')).toBeTruthy()
  })

  it('should show loading state', () => {
    mockUseGetBlogPostBySlugQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog/hello']}>
          <Routes>
            <Route
              element={<BlogPostComponent />}
              path="/blog/:slug"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.queryByText('Hello World')).toBeNull()
  })

  it('should render post content when loaded', () => {
    mockUseGetBlogPostBySlugQuery.mockReturnValue({
      data: mockPost,
      isError: false,
      isLoading: false,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog/hello']}>
          <Routes>
            <Route
              element={<BlogPostComponent />}
              path="/blog/:slug"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Hello World')).toBeTruthy()
    expect(screen.getByText(/John Doe/)).toBeTruthy()
    expect(screen.getByText('News')).toBeTruthy()
  })

  it('should show post not found when isError', () => {
    mockUseGetBlogPostBySlugQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog/bad-slug']}>
          <Routes>
            <Route
              element={<BlogPostComponent />}
              path="/blog/:slug"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Post not found')).toBeTruthy()
  })
})
