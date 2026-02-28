/**
 * Blog Post (Public) Component Tests
 *
 * Uses createMemoryRouter with loader returning defer() - matches SSR/CSR behavior.
 */

import { ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

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

function createBlogPostRouter(
  data:
    | { post: typeof mockPost; relatedPosts: unknown[] }
    | Promise<{ post: typeof mockPost; relatedPosts: unknown[] }>,
) {
  const dataPromise = data instanceof Promise ? data : Promise.resolve(data)
  return createMemoryRouter(
    [
      {
        element: <BlogPostComponent />,
        loader: () => ({ data: dataPromise }),
        path: '/blog/:slug',
      },
    ],
    { initialEntries: ['/blog/hello'] },
  )
}

describe('BlogPostComponent', () => {
  it('should show loading state', () => {
    const router = createBlogPostRouter(new Promise(() => {}))
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )
    expect(screen.queryByText('Hello World')).toBeNull()
  })

  it('should render post content when loaded', async () => {
    const router = createBlogPostRouter({ post: mockPost, relatedPosts: [] })
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )
    await screen.findByText('Hello World')
    expect(screen.getByText('Hello World')).toBeTruthy()
    expect(screen.getByText(/John Doe/)).toBeTruthy()
    expect(screen.getByText('News')).toBeTruthy()
  })

  it('should show post not found when loader throws', async () => {
    const router = createBlogPostRouter(
      Promise.reject(new Response('Not Found', { status: 404 })),
    )
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )
    await screen.findByText('Post not found')
    expect(screen.getByText('Post not found')).toBeTruthy()
  })
})
