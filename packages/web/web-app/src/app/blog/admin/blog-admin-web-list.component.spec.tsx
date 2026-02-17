/**
 * Blog Admin List Component Tests
 */

import { createTheme, ThemeProvider } from '@mui/material/styles'

jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: () => ({
      i18n: { translations: {} },
    }),
  },
}))
import { fireEvent, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { renderWithProviders } from '../../../../testing-render'
import { BlogAdminListComponent } from './blog-admin-web-list.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({
    ALL: 'All',
    BLOG: 'Blog',
    BLOG_CREATE_POST: 'Create Post',
    BLOG_EDITOR_TITLE: 'Blog Editor',
    BLOG_PUBLISH: 'Publish',
    BLOG_PUBLISH_CONFIRM: 'Publish this post?',
    BLOG_STATUS_ARCHIVED: 'Archived',
    BLOG_STATUS_DRAFT: 'Draft',
    BLOG_STATUS_PUBLISHED: 'Published',
    BLOG_STATUS_SCHEDULED: 'Scheduled',
    BLOG_STATUS_UNPUBLISHED: 'Unpublished',
    BLOG_UNPUBLISH: 'Unpublish',
    BLOG_UNPUBLISH_CONFIRM: 'Unpublish this post?',
    BLOG_UNSCHEDULE: 'Unschedule',
    BLOG_UNSCHEDULE_CONFIRM: 'Unschedule this post?',
    CANCEL: 'Cancel',
    CANCELING: 'Canceling',
    STATUS: 'Status',
    TOOLTIP_REFRESH_LIST: 'Refresh list',
  }),
}))

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}))

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

const testTheme = createTheme()

describe('BlogAdminListComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    let modalRoot = document.getElementById('modal-root')
    if (!modalRoot) {
      modalRoot = document.createElement('div')
      modalRoot.id = 'modal-root'
      document.body.appendChild(modalRoot)
    }
  })

  it('should render list header and table', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <MemoryRouter>
          <BlogAdminListComponent />
        </MemoryRouter>
      </ThemeProvider>,
      {
        preloadedState: {
          auth: {
            logoutResponse: false,
            password: '',
            token: 'test-token',
            userId: 'u1',
            username: 'u@example.com',
          },
        },
      },
    )

    expect(screen.getByText('Blog Editor')).toBeTruthy()
    expect(screen.getByText('Create Post')).toBeTruthy()
    expect(screen.getByText('First Post')).toBeTruthy()
    expect(screen.getByText('Second Post')).toBeTruthy()
  })

  it('should call onCreateClick when Create Post clicked', () => {
    mockNavigate.mockClear()

    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <MemoryRouter>
          <BlogAdminListComponent />
        </MemoryRouter>
      </ThemeProvider>,
      {
        preloadedState: {
          auth: {
            logoutResponse: false,
            password: '',
            token: 'test-token',
            userId: 'u1',
            username: 'u@example.com',
          },
        },
      },
    )

    fireEvent.click(screen.getByText('Create Post'))
    expect(mockNavigate).toHaveBeenCalledWith('/blog-editor/new')
  })
})
