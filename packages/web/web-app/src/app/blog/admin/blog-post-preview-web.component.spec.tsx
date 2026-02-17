/**
 * Blog Post Preview Component Tests
 */

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { BlogPostPreviewComponent } from './blog-post-preview-web.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({
    BLOG: 'Blog',
    BLOG_EDITOR_TITLE: 'Blog Editor',
    BLOG_FEATURED_IMAGE: 'Featured image',
    BLOG_READING_TIME_MIN: 'min read',
    PREVIEW: 'Preview',
    PREVIEW_NOT_PUBLISHED: 'This post is not yet published',
  }),
}))

jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: () => ({
      API_URL: 'http://test.api',
      WEB_APP_URL: 'http://test.app',
    }),
  },
}))

const mockPost = {
  id: 'post-1',
  authorDisplayName: 'Jane Doe',
  content: '# Hello World\n\nParagraph content.',
  createdAt: '2025-01-15T10:00:00Z',
  slug: 'hello-world',
  status: 'draft',
  title: 'Hello World',
  updatedAt: '2025-01-15T10:00:00Z',
  categories: [{ id: 'cat-1', name: 'Tech' }],
  canonicalUrl: '',
  excerpt: 'Excerpt',
  featuredImageId: '',
  isAnonymous: false,
  publishedAt: null,
  readingTimeMinutes: 3,
  seoDescription: '',
  seoTitle: '',
  tags: [{ id: 'tag-1', name: 'React' }],
}

const mockUseGetBlogPostPreviewQuery = jest.fn()

jest.mock('../blog-web.api', () => ({
  useGetBlogPostPreviewQuery: (id: string) => mockUseGetBlogPostPreviewQuery(id),
}))

const testTheme = createTheme()

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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog-editor/preview']}>
          <Routes>
            <Route
              path="/blog-editor/preview"
              element={<BlogPostPreviewComponent />}
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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog-editor/preview/post-1']}>
          <Routes>
            <Route
              path="/blog-editor/preview/:id"
              element={<BlogPostPreviewComponent />}
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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog-editor/preview/post-1']}>
          <Routes>
            <Route
              path="/blog-editor/preview/:id"
              element={<BlogPostPreviewComponent />}
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
      <ThemeProvider theme={testTheme}>
        <MemoryRouter initialEntries={['/blog-editor/preview/post-1']}>
          <Routes>
            <Route
              path="/blog-editor/preview/:id"
              element={<BlogPostPreviewComponent />}
            />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByText('Post not found')).toBeTruthy()
  })
})
