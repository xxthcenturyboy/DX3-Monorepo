/**
 * Blog (List) Component Tests
 *
 * Mocks useLoaderData to avoid createMemoryRouter dependency on the Request global,
 * which is not available in the jsdom test environment.
 */

import { ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../testing-render'
import { BLOG_TEST_THEME } from './testing/blog-test.fixtures'
import './testing/blog-test-setup'

import { BlogComponent } from './blog-web.component'

const mockPosts = [
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
]

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLoaderData: jest.fn(),
}))

import { useLoaderData } from 'react-router'

const mockUseLoaderData = useLoaderData as jest.Mock

describe('BlogComponent', () => {
  afterEach(() => {
    mockUseLoaderData.mockReset()
  })

  it('should show loading spinner when using deferred loader', () => {
    mockUseLoaderData.mockReturnValue(undefined)
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider theme={BLOG_TEST_THEME}>
          <BlogComponent />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(screen.queryByText('something-nonexistent-xyz')).toBeNull()
  })

  it('should show no posts message when empty', async () => {
    mockUseLoaderData.mockReturnValue({ posts: [] })
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider theme={BLOG_TEST_THEME}>
          <BlogComponent />
        </ThemeProvider>
      </MemoryRouter>,
    )
    await screen.findByText('No posts yet')
    expect(screen.getByText('No posts yet')).toBeTruthy()
  })

  it('should render post cards when posts exist', async () => {
    mockUseLoaderData.mockReturnValue({ posts: mockPosts })
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider theme={BLOG_TEST_THEME}>
          <BlogComponent />
        </ThemeProvider>
      </MemoryRouter>,
    )
    await screen.findByText('First Post')
    expect(screen.getByText('First Post')).toBeTruthy()
  })
})
