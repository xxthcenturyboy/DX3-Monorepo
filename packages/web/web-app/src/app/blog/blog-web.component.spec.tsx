/**
 * Blog (List) Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { BLOG_TEST_THEME } from './testing/blog-test.fixtures'
import './testing/blog-test-setup'

import { BlogComponent } from './blog-web.component'

const mockUseGetBlogPostsQuery = jest.fn()

jest.mock('./blog-web.api', () => ({
  useGetBlogPostsQuery: (params?: unknown) => mockUseGetBlogPostsQuery(params),
}))

describe('BlogComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render page title', () => {
    mockUseGetBlogPostsQuery.mockReturnValue({
      data: { posts: [] },
      isLoading: false,
      isSuccess: true,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter>
          <BlogComponent />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Latest posts')).toBeTruthy()
  })

  it('should show loading spinner when loading', () => {
    mockUseGetBlogPostsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter>
          <BlogComponent />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.queryByText('No posts yet')).toBeNull()
  })

  it('should show no posts message when empty', () => {
    mockUseGetBlogPostsQuery.mockReturnValue({
      data: { posts: [] },
      isLoading: false,
      isSuccess: true,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter>
          <BlogComponent />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('No posts yet')).toBeTruthy()
  })

  it('should render post cards when posts exist', () => {
    mockUseGetBlogPostsQuery.mockReturnValue({
      data: {
        posts: [
          {
            authorDisplayName: 'Author',
            categories: [],
            excerpt: 'Excerpt',
            id: 'post-1',
            publishedAt: '2025-01-01',
            readingTimeMinutes: 2,
            slug: 'first-post',
            tags: [],
            title: 'First Post',
          },
        ],
      },
      isLoading: false,
      isSuccess: true,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter>
          <BlogComponent />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('First Post')).toBeTruthy()
  })
})
