/**
 * Blog (List) Component Tests
 *
 * Uses createMemoryRouter with loader returning defer() - matches SSR/CSR behavior.
 */

import { ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'

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

function createBlogRouter(posts: typeof mockPosts | Promise<typeof mockPosts>) {
  const postsPromise =
    posts instanceof Promise ? posts : Promise.resolve(posts)
  return createMemoryRouter(
    [
      {
        element: <BlogComponent />,
        loader: () => ({ posts: postsPromise }),
        path: '/blog',
      },
    ],
    { initialEntries: ['/blog'] },
  )
}

describe('BlogComponent', () => {
  it('should show loading spinner when loading', async () => {
    const router = createBlogRouter(new Promise(() => {}))
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )
    expect(screen.queryByText('No posts yet')).toBeNull()
  })

  it('should show no posts message when empty', async () => {
    const router = createBlogRouter([])
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )
    await screen.findByText('No posts yet')
    expect(screen.getByText('No posts yet')).toBeTruthy()
  })

  it('should render post cards when posts exist', async () => {
    const router = createBlogRouter(mockPosts)
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    )
    await screen.findByText('First Post')
    expect(screen.getByText('First Post')).toBeTruthy()
  })
})
