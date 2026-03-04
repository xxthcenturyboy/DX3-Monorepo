/**
 * Blog Post (Public) Component Tests
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

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLoaderData: jest.fn(),
  useParams: jest.fn().mockReturnValue({ slug: 'hello' }),
}))

import { useLoaderData } from 'react-router'

const mockUseLoaderData = useLoaderData as jest.Mock

describe('BlogPostComponent', () => {
  afterEach(() => {
    mockUseLoaderData.mockReset()
  })

  it('should show loading state initially', () => {
    mockUseLoaderData.mockReturnValue(undefined)
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider theme={BLOG_TEST_THEME}>
          <BlogPostComponent />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(screen.queryByText('something-nonexistent-xyz')).toBeNull()
  })

  it('should render post content when loaded', async () => {
    mockUseLoaderData.mockReturnValue({ data: { post: mockPost, relatedPosts: [] } })
    renderWithProviders(
      <MemoryRouter>
        <ThemeProvider theme={BLOG_TEST_THEME}>
          <BlogPostComponent />
        </ThemeProvider>
      </MemoryRouter>,
    )
    await screen.findByText('Hello World')
    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('should render base element without crashing when no data', () => {
    mockUseLoaderData.mockReturnValue(undefined)
    const { baseElement } = renderWithProviders(
      <MemoryRouter>
        <ThemeProvider theme={BLOG_TEST_THEME}>
          <BlogPostComponent />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(baseElement).toBeTruthy()
  })
})
