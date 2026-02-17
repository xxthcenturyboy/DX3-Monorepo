/**
 * Blog Post (Public) Component Tests
 */

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { BlogPostComponent } from './blog-post-web.component'

jest.mock('../data/rtk-query')
jest.mock('../i18n', () => ({
  useStrings: () => ({
    BLOG: 'Blog',
    BLOG_FEATURED_IMAGE: 'Featured image',
    BLOG_POST_NOT_FOUND: 'Post not found',
    BLOG_READING_TIME_MIN: 'min read',
    BLOG_RELATED_POSTS: 'Related posts',
  }),
}))

jest.mock('../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: () => ({
      API_URL: 'http://test.api',
      WEB_APP_URL: 'http://test.app',
    }),
  },
}))

const mockPost = {
  id: 'post-1',
  authorDisplayName: 'John Doe',
  canonicalUrl: 'https://example.com/blog/hello',
  content: '# Hello\n\nBlog content here.',
  createdAt: '2025-01-10T00:00:00Z',
  excerpt: 'Short excerpt',
  featuredImageId: '',
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
  categories: [{ id: 'c1', name: 'News' }],
}

const mockUseGetBlogPostBySlugQuery = jest.fn()
const mockUseGetBlogRelatedPostsQuery = jest.fn()

jest.mock('./blog-web.api', () => ({
  useGetBlogPostBySlugQuery: (slug: string) => mockUseGetBlogPostBySlugQuery(slug),
  useGetBlogRelatedPostsQuery: (params: { id: string }) =>
    mockUseGetBlogRelatedPostsQuery(params),
}))

const testTheme = createTheme()

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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog']}>
          <Routes>
            <Route
              path="/blog/:slug?"
              element={<BlogPostComponent />}
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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog/hello']}>
          <Routes>
            <Route
              path="/blog/:slug"
              element={<BlogPostComponent />}
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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog/hello']}>
          <Routes>
            <Route
              path="/blog/:slug"
              element={<BlogPostComponent />}
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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog/bad-slug']}>
          <Routes>
            <Route
              path="/blog/:slug"
              element={<BlogPostComponent />}
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Post not found')).toBeTruthy()
  })
})
