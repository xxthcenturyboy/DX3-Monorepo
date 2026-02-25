/**
 * Blog Post Preview Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import '../testing/blog-test-setup'

import { BlogPostPreviewComponent } from './blog-post-preview-web.component'

const mockPost = {
  authorDisplayName: 'Jane Doe',
  canonicalUrl: '',
  categories: [{ id: 'cat-1', name: 'Tech' }],
  content: '# Hello World\n\nParagraph content.',
  createdAt: '2025-01-15T10:00:00Z',
  excerpt: 'Excerpt',
  featuredImageId: '',
  id: 'post-1',
  isAnonymous: false,
  publishedAt: null,
  readingTimeMinutes: 3,
  seoDescription: '',
  seoTitle: '',
  slug: 'hello-world',
  status: 'draft',
  tags: [{ id: 'tag-1', name: 'React' }],
  title: 'Hello World',
  updatedAt: '2025-01-15T10:00:00Z',
}

const mockUseGetBlogPostPreviewQuery = jest.fn()

jest.mock('../blog-web.api', () => ({
  useGetBlogPostPreviewQuery: (id: string) => mockUseGetBlogPostPreviewQuery(id),
}))

describe('BlogPostPreviewComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show post not found when no id', () => {
    mockUseGetBlogPostPreviewQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: false,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog-editor/preview']}>
          <Routes>
            <Route
              element={<BlogPostPreviewComponent />}
              path="/blog-editor/preview"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Post not found')).toBeTruthy()
  })

  it('should show loading state', () => {
    mockUseGetBlogPostPreviewQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog-editor/preview/post-1']}>
          <Routes>
            <Route
              element={<BlogPostPreviewComponent />}
              path="/blog-editor/preview/:id"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render post content when loaded', () => {
    mockUseGetBlogPostPreviewQuery.mockReturnValue({
      data: mockPost,
      isError: false,
      isLoading: false,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog-editor/preview/post-1']}>
          <Routes>
            <Route
              element={<BlogPostPreviewComponent />}
              path="/blog-editor/preview/:id"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getAllByRole('heading', { name: 'Hello World' })[0]).toBeTruthy()
    expect(screen.getByText(/Jane Doe/)).toBeTruthy()
    expect(screen.getByText(/This post is not yet published/)).toBeTruthy()
    expect(screen.getByText('Tech')).toBeTruthy()
    expect(screen.getByText('React')).toBeTruthy()
  })

  it('should show post not found when isError', () => {
    mockUseGetBlogPostPreviewQuery.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
    })

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter initialEntries={['/blog-editor/preview/post-1']}>
          <Routes>
            <Route
              element={<BlogPostPreviewComponent />}
              path="/blog-editor/preview/:id"
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Post not found')).toBeTruthy()
  })
})
