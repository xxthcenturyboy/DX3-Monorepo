/**
 * Blog Admin List Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'

import '../testing/blog-test-setup'
import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { AUTH_PRELOADED_STATE, BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import { BlogAdminListComponent } from './blog-admin-web-list.component'

const mockNavigate = jest.fn()
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
}))

const mockPublishPost = jest.fn().mockResolvedValue({})
const mockUnpublishPost = jest.fn().mockResolvedValue({})
const mockUnschedulePost = jest.fn().mockResolvedValue({})
const mockSchedulePost = jest.fn().mockReturnValue({ unwrap: () => Promise.resolve({}) })

jest.mock('../blog-web.api', () => ({
  useGetBlogAdminPostsQuery: jest.fn().mockReturnValue({
    data: {
      count: 2,
      rows: [
        {
          createdAt: '2025-01-01',
          id: 'post-1',
          slug: 'first-post',
          status: 'draft',
          title: 'First Post',
          updatedAt: '2025-01-01',
        },
        {
          createdAt: '2025-01-02',
          id: 'post-2',
          slug: 'second-post',
          status: 'published',
          title: 'Second Post',
          updatedAt: '2025-01-02',
        },
      ],
    },
    isFetching: false,
    refetch: jest.fn(),
  }),
  usePublishBlogPostMutation: () => [mockPublishPost],
  useScheduleBlogPostMutation: () => [mockSchedulePost],
  useUnpublishBlogPostMutation: () => [mockUnpublishPost],
  useUnscheduleBlogPostMutation: () => [mockUnschedulePost],
}))

describe('BlogAdminListComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render list header and table', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter>
          <BlogAdminListComponent />
        </MemoryRouter>
      </ThemeProvider>,
      { preloadedState: AUTH_PRELOADED_STATE },
    )

    expect(screen.getByText('Blog Editor')).toBeTruthy()
    expect(screen.getByText('Create Post')).toBeTruthy()
    expect(screen.getByText('First Post')).toBeTruthy()
    expect(screen.getByText('Second Post')).toBeTruthy()
  })

  it('should call onCreateClick when Create Post clicked', () => {
    mockNavigate.mockClear()

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <MemoryRouter>
          <BlogAdminListComponent />
        </MemoryRouter>
      </ThemeProvider>,
      { preloadedState: AUTH_PRELOADED_STATE },
    )

    fireEvent.click(screen.getByText('Create Post'))
    expect(mockNavigate).toHaveBeenCalledWith('/blog-editor/new')
  })
})
